import config from '@payload-config'
import { getPayload } from 'payload'
import { getCurrentAppUser } from '@/lib/app-auth'

export async function GET() {
  const user = await getCurrentAppUser()
  if (!user || user.role !== 'moderator')
    return Response.json({ error: 'No autorizado' }, { status: 403 })
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'reports',
    depth: 1,
    limit: 100,
    sort: '-createdAt',
    overrideAccess: false,
    user,
  })
  return Response.json({ reports: result.docs })
}

export async function PATCH(request: Request) {
  const user = await getCurrentAppUser()
  if (!user || user.role !== 'moderator')
    return Response.json({ error: 'No autorizado' }, { status: 403 })
  const body = await request.json().catch(() => null)
  const id = body?.id
  const status = body?.status
  if (
    (typeof id !== 'string' && typeof id !== 'number') ||
    !['approved', 'rejected', 'hidden'].includes(status)
  ) {
    return Response.json({ error: 'Acción inválida' }, { status: 400 })
  }
  const payload = await getPayload({ config })
  const report = await payload.update({
    collection: 'reports',
    id,
    overrideAccess: false,
    user,
    data: { status },
  })
  return Response.json({ report })
}
