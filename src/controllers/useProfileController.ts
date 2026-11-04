'use client'

import { FormEvent, useState } from 'react'
import { deleteAccount } from '@/services/authService'

export const DELETE_CONFIRMATION_WORD = 'ELIMINAR'

/** Controla la eliminación definitiva de la cuenta, con doble validación. */
export function useProfileController(onDeleted: () => void) {
  const [confirming, setConfirming] = useState(false)
  const [word, setWord] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const canSubmit = word === DELETE_CONFIRMATION_WORD && password.length > 0 && !deleting

  const open = () => setConfirming(true)

  const cancel = () => {
    setConfirming(false)
    setWord('')
    setPassword('')
    setError('')
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (word !== DELETE_CONFIRMATION_WORD) {
      setError(`Escribe ${DELETE_CONFIRMATION_WORD} para confirmar`)
      return
    }
    if (!password) {
      setError('Ingresa tu contraseña para confirmar')
      return
    }
    setDeleting(true)
    setError('')
    const result = await deleteAccount(password)
    setDeleting(false)
    if (!result.ok) {
      setError(result.error || 'No fue posible eliminar la cuenta')
      return
    }
    onDeleted()
  }

  return {
    confirming,
    open,
    cancel,
    word,
    setWord,
    password,
    setPassword,
    error,
    deleting,
    canSubmit,
    submit,
  }
}
