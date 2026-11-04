import config from '@payload-config'
import { getPayload } from 'payload'
import { setAppSession } from '@/lib/app-auth'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email || !password) {
    return Response.json({ error: 'Correo y contraseña son obligatorios' }, { status: 400 })
  }

  try {
    const payload = await getPayload({ config })
    const result = await payload.login({
      collection: 'users',
      overrideAccess: false,
      data: { email, password },
    })
    if (!result.token || !result.user) throw new Error('No se recibió una sesión válida')
    await setAppSession(result.token)
    return Response.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
    })
  } catch {
    return Response.json({ error: 'Credenciales inválidas' }, { status: 401 })
  }
}
