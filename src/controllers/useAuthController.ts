'use client'

import { FormEvent, useState } from 'react'
import { validateCredentials } from '@/models/validation'
import type { AuthMode, FormErrors, Screen } from '@/models/types'
import { authenticate } from '@/services/authService'

/** Controla los formularios de registro e inicio de sesión. */
export function useAuthController(
  mode: AuthMode,
  onNavigate: (screen: Screen) => void,
  onRegistered?: () => void,
) {
  const [email, setEmailValue] = useState('')
  const [password, setPasswordValue] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const isRegister = mode === 'register'

  const setEmail = (value: string) => {
    setEmailValue(value)
    setErrors({})
  }

  const setPassword = (value: string) => {
    setPasswordValue(value)
    setErrors({})
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (locked) return
    const validation = validateCredentials(mode, email, password)
    if (Object.keys(validation).length) {
      setErrors(validation)
      return
    }
    const result = await authenticate(mode, email, password)
    if (!result.ok) {
      if (!isRegister) {
        const nextAttempts = attempts + 1
        setAttempts(nextAttempts)
        if (nextAttempts >= 3) setLocked(true)
      }
      setErrors({
        form:
          result.error ||
          (isRegister ? 'No fue posible crear la cuenta' : 'Credenciales inválidas'),
      })
      return
    }
    if (isRegister) onRegistered?.()
    onNavigate(isRegister ? 'login' : 'reports')
  }

  return { isRegister, email, setEmail, password, setPassword, errors, locked, submit }
}
