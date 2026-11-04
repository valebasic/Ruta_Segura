import config from '@payload-config'
import { getPayload } from 'payload'
import { clearAppSession, getCurrentAppUser } from '@/lib/app-auth'

export async function DELETE(request: Request) {
  const user = await getCurrentAppUser()
  if (!user) return Response.json({ error: 'Sesión no válida' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const password = typeof body?.password === 'string' ? body.password : ''
  if (!password) {
    return Response.json({ error: 'Ingresa tu contraseña para confirmar' }, { status: 400 })
  }

  const payload = await getPayload({ config })

  // Revalida la identidad: la contraseña debe corresponder a la cuenta de la sesión.
  try {
    await payload.login({ collection: 'users', data: { email: user.email, password } })
  } catch {
    return Response.json({ error: 'La contraseña es incorrecta' }, { status: 403 })
  }

  try {
    // Los reportes exigen un dueño, así que se eliminan junto con la cuenta.
    await payload.delete({
      collection: 'reports',
      where: { owner: { equals: user.id } },
      overrideAccess: true,
    })
    await payload.delete({ collection: 'users', id: user.id, overrideAccess: true })
  } catch {
    return Response.json({ error: 'No fue posible eliminar la cuenta' }, { status: 500 })
  }

  await clearAppSession()
  return Response.json({ success: true })
}
