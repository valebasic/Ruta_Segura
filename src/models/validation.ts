import { referencePoints } from './constants'
import type { AuthMode, FormErrors, MapPosition } from './types'

export function validateCredentials(mode: AuthMode, email: string, password: string): FormErrors {
  const isRegister = mode === 'register'
  const errors: FormErrors = {}
  if (!email)
    errors.email = isRegister ? 'Ingresa tu correo electrónico' : 'Ingresa tu correo o usuario'
  else if (isRegister && !/\S+@\S+\.\S+/.test(email))
    errors.email = 'Ingresa un correo electrónico válido'
  if (!password) errors.password = 'Ingresa tu contraseña'
  else if (isRegister && password.length < 8) errors.password = 'Usa al menos 8 caracteres'
  if (isRegister && email.toLowerCase() === 'registrado@correo.com')
    errors.email = 'Este correo ya está registrado'
  return errors
}

export function validateNewReport(input: {
  municipality: string
  reference: string
  category: string
  description: string
  position: MapPosition | null
}): FormErrors {
  const errors: FormErrors = {}
  if (!input.municipality) errors.municipality = 'Selecciona un municipio'
  if (!input.reference) errors.reference = 'Selecciona un punto de referencia'
  else if (!referencePoints[input.municipality]?.includes(input.reference))
    errors.reference = 'El punto de referencia no corresponde al municipio'
  if (!input.category) errors.category = 'Selecciona una categoría'
  if (!input.description.trim()) errors.description = 'Cuéntanos brevemente qué percibiste'
  else if (input.description.trim().length < 10)
    errors.description = 'Escribe al menos 10 caracteres'
  if (!input.position)
    errors.location = 'Selecciona la ubicación en el mapa o usa tu ubicación actual'
  return errors
}

export function validateOrigin(origin: string): string {
  return origin.trim().length < 5 ? 'Ingresa una dirección o punto de origen válido' : ''
}
