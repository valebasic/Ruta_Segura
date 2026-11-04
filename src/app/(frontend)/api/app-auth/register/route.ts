import config from '@payload-config'
import { getPayload } from 'payload'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  const name =
    typeof body?.name === 'string' && body.name.trim()
      ? body.name.trim().slice(0, 80)
      : email.split('@')[0]

  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    return Response.json(
      { error: 'Revisa el correo y usa una contraseña de al menos 8 caracteres' },
      { status: 400 },
    )
  }

  try {
    const payload = await getPayload({ config })
    const existing = await payload.count({
      collection: 'users',
      where: { email: { equals: email } },
      overrideAccess: true,
    })
    if (existing.totalDocs > 0) {
      return Response.json({ error: 'Este correo ya está registrado' }, { status: 409 })
    }
    await payload.create({
      collection: 'users',
      overrideAccess: false,
      data: { email, password, name },
    })
    return Response.json({ success: true }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    const fields = JSON.stringify((error as { data?: unknown })?.data ?? '')
    const duplicate = /unique|already|duplicate|único|ya existe/i.test(message) || /email/.test(fields)
    return Response.json(
      { error: duplicate ? 'Este correo ya está registrado' : 'No fue posible crear la cuenta' },
      { status: duplicate ? 409 : 400 },
    )
  }
}
