import { getCurrentAppUser } from '@/lib/app-auth'

export async function GET() {
  const user = await getCurrentAppUser()
  if (!user) return Response.json({ user: null }, { status: 401 })
  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  })
}
