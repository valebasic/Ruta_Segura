import config from '@payload-config'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import { boundingBox, DEFAULT_RADIUS_KM, haversineKm } from '@/models/geo'
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

const MAX_RADIUS_KM = 100

const toNumber = (value: string | null) => (value === null || value === '' ? NaN : Number(value))

/**
 * Reportes aprobados. Con ?lat=&lon= devuelve solo los que están dentro de
 * ?radius_km= (5 km por defecto), ordenados del más cercano al más lejano y con
 * su distancia en km. Sin coordenadas devuelve los más recientes.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const latitude = toNumber(params.get('lat'))
  const longitude = toNumber(params.get('lon'))
  const hasOrigin = params.has('lat') || params.has('lon')

  if (
    hasOrigin &&
    (!Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180)
  ) {
    return Response.json({ error: 'Ubicación inválida' }, { status: 400 })
  }
  const requestedRadius = params.has('radius_km') ? toNumber(params.get('radius_km')) : DEFAULT_RADIUS_KM
  if (hasOrigin && (!Number.isFinite(requestedRadius) || requestedRadius <= 0)) {
    return Response.json({ error: 'Radio inválido' }, { status: 400 })
  }
  const radiusKm = Math.min(requestedRadius, MAX_RADIUS_KM)

  const where: Where = { status: { equals: 'approved' } }
  if (hasOrigin) {
    const box = boundingBox(latitude, longitude, radiusKm)
    where.and = [
      { latitude: { greater_than_equal: box.minLat } },
      { latitude: { less_than_equal: box.maxLat } },
      { longitude: { greater_than_equal: box.minLon } },
      { longitude: { less_than_equal: box.maxLon } },
    ]
  }

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'reports',
    depth: 1,
    limit: hasOrigin ? 500 : 100,
    sort: '-createdAt',
    overrideAccess: false,
    where,
  })

  let rows = result.docs.map((report) => ({
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
    distance_km: null as number | null,
  }))

  if (hasOrigin) {
    rows = rows
      .map((row) => ({
        ...row,
        distance_km: haversineKm({ latitude, longitude }, row),
      }))
      .filter((row) => (row.distance_km ?? Infinity) <= radiusKm)
      .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0))
  }

  return Response.json({
    reports: rows,
    origin: hasOrigin ? { latitude, longitude, radius_km: radiusKm } : null,
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

  // Doble clic / reenvío: si la misma persona acaba de enviar lo mismo, se devuelve ese reporte.
  const recent = await payload.find({
    collection: 'reports',
    limit: 1,
    depth: 0,
    overrideAccess: true,
    where: {
      and: [
        { owner: { equals: user.id } },
        { description: { equals: description } },
        { latitude: { equals: latitude } },
        { longitude: { equals: longitude } },
        { createdAt: { greater_than: new Date(Date.now() - 60_000).toISOString() } },
      ],
    },
  })
  if (recent.docs[0]) return Response.json({ report: recent.docs[0], duplicate: true }, { status: 200 })

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
      status: 'approved',
      owner: user.id,
    },
  })

  return Response.json({ report }, { status: 201 })
}
