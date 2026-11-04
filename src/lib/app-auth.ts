import 'server-only'

import config from '@payload-config'
import { cookies } from 'next/headers'
import { getPayload, JWTAuthentication } from 'payload'

const SESSION_COOKIE = 'app-session'

export async function getCurrentAppUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) return null

  const payload = await getPayload({ config })
  const authHeaders = new Headers({ Authorization: `JWT ${token}` })
  const { user } = await JWTAuthentication({
    headers: authHeaders,
    payload,
    strategyName: 'ruta-segura-users-jwt',
  })

  if (!user || user.collection !== 'users') return null
  return user
}

export async function setAppSession(token: string) {
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearAppSession() {
  const store = await cookies()
  store.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}
