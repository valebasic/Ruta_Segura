import config from '@payload-config'
import { getPayload } from 'payload'
import { getCurrentAppUser } from '@/lib/app-auth'

/** Reportes de la persona con sesión iniciada, en cualquier estado (pendiente, aprobado…). */
export async function GET() {
  const user = await getCurrentAppUser()
  if (!user) return Response.json({ error: 'Tu sesión expiró' }, { status: 401 })

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'reports',
    depth: 1,
    limit: 200,
    sort: '-createdAt',
    overrideAccess: false,
    user,
    where: { owner: { equals: user.id } },
  })
  return Response.json({ reports: result.docs })
}

/** Elimina un reporte propio. El permiso lo valida la colección (dueño o moderación). */
export async function DELETE(request: Request) {
  const user = await getCurrentAppUser()
  if (!user) return Response.json({ error: 'Tu sesión expiró' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const id = body?.id
  if (typeof id !== 'string' && typeof id !== 'number') {
    return Response.json({ error: 'Reporte no válido' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  try {
    await payload.delete({ collection: 'reports', id, overrideAccess: false, user })
    return Response.json({ success: true })
  } catch {
    // No existe o pertenece a otra persona: la respuesta es la misma.
    return Response.json({ error: 'No se encontró el reporte' }, { status: 404 })
  }
}
