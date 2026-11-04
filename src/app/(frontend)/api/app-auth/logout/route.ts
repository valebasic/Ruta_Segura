import { clearAppSession } from '@/lib/app-auth'

export async function POST() {
  await clearAppSession()
  return Response.json({ success: true })
}
