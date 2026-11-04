import config from '@payload-config'
import { getPayload } from 'payload'
import { getCurrentAppUser } from '@/lib/app-auth'

type ReportInput = {
  latitude?: unknown
  longitude?: unknown
  accuracy_m?: unknown
  address?: unknown
  municipality_id?: unknown
  category_id?: unknown
  description?: unknown
  location_source?: unknown
  reference_point?: unknown
}

const isId = (value: unknown): value is string | number =>
  typeof value === 'string' || typeof value === 'number'

export async function GET() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'reports',
    depth: 1,
    limit: 100,
    sort: '-createdAt',
    overrideAccess: false,
    where: { status: { equals: 'approved' } },
  })
  return Response.json({
    reports: result.docs.map((report) => ({
      id: report.id,
      latitude: report.latitude,
      longitude: report.longitude,
      accuracy_m: report.accuracyM,
      address: report.address,
      municipality_id:
        typeof report.municipality === 'object' ? report.municipality.id : report.municipality,
      municipality: typeof report.municipality === 'object' ? report.municipality.name : null,
      category_id: typeof report.category === 'object' ? report.category.id : report.category,
      category: typeof report.category === 'object' ? report.category.name : null,
      description: report.description,
      reference_point: report.referencePoint,
      location_source: report.locationSource,
      created_at: report.createdAt,
      status: report.status,
    })),
  })
}

export async function POST(request: Request) {
  const user = await getCurrentAppUser()
  if (!user) return Response.json({ error: 'Tu sesión expiró' }, { status: 401 })

  const body = (await request.json().catch(() => null)) as ReportInput | null
  const latitude = Number(body?.latitude)
  const longitude = Number(body?.longitude)
  const accuracyM = body?.accuracy_m == null ? undefined : Number(body.accuracy_m)
  const address = typeof body?.address === 'string' ? body.address.trim().slice(0, 240) : ''
  const description = typeof body?.description === 'string' ? body.description.trim() : ''
  const referencePoint =
    typeof body?.reference_point === 'string' ? body.reference_point.trim() : ''
  const locationSource = body?.location_source

  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180 ||
    (accuracyM !== undefined && (!Number.isFinite(accuracyM) || accuracyM < 0)) ||
    !isId(body?.municipality_id) ||
    !isId(body?.category_id) ||
    description.length < 10 ||
    description.length > 280 ||
    !referencePoint ||
    !['gps', 'manual'].includes(String(locationSource))
  ) {
    return Response.json({ error: 'Revisa los datos y la ubicación seleccionada' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const [municipality, category] = await Promise.all([
    payload.findByID({
      collection: 'municipalities',
      id: body.municipality_id,
      overrideAccess: false,
    }),
    payload.findByID({
      collection: 'risk-categories',
      id: body.category_id,
      overrideAccess: false,
    }),
  ]).catch(() => [null, null])

  if (!municipality || !category) {
    return Response.json({ error: 'El municipio o la categoría no son válidos' }, { status: 400 })
  }

  const report = await payload.create({
    collection: 'reports',
    draft: false,
    overrideAccess: false,
    user,
    data: {
      latitude,
      longitude,
      accuracyM,
      address: address || undefined,
      municipality: municipality.id,
      category: category.id,
      description,
      locationSource: locationSource as 'gps' | 'manual',
      referencePoint,
      status: 'pending',
      owner: user.id,
    },
  })

  return Response.json({ report }, { status: 201 })
}
