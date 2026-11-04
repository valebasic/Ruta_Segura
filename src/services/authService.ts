import type { AuthMode, ServiceResult, UserSummary } from '@/models/types'

export async function fetchCurrentUser(): Promise<UserSummary | null> {
  const response = await fetch('/api/app-auth/me')
  if (!response.ok) return null
  const data = await response.json()
  return data.user
}

export async function authenticate(
  mode: AuthMode,
  email: string,
  password: string,
): Promise<ServiceResult> {
  const endpoint = mode === 'register' ? '/api/app-auth/register' : '/api/app-auth/login'
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) return { ok: false, error: result.error }
  return { ok: true }
}

export async function deleteAccount(password: string): Promise<ServiceResult> {
  const response = await fetch('/api/app-auth/delete-account', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) return { ok: false, error: result.error }
  return { ok: true }
}

async function postJson(url: string, body: unknown): Promise<ServiceResult> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) return { ok: false, error: result.error }
  return { ok: true }
}


export async function logout(): Promise<void> {
  await fetch('/api/app-auth/logout', { method: 'POST' })
}
