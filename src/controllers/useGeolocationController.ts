'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type LocationStatus =
  | 'idle'
  | 'loading'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'unsupported'
  | 'insecure'

export type DevicePosition = { latitude: number; longitude: number; accuracy: number | null }

const MESSAGES: Record<Exclude<LocationStatus, 'idle' | 'loading' | 'granted'>, string> = {
  denied:
    'No diste permiso para usar tu ubicación. Actívalo en el navegador (candado junto a la dirección) para ver los reportes cercanos.',
  unavailable: 'No fue posible determinar tu ubicación. Revisa el GPS o la conexión e intenta de nuevo.',
  timeout: 'Tardamos demasiado en obtener tu ubicación. Intenta de nuevo.',
  unsupported: 'Tu navegador no permite obtener la ubicación.',
  insecure: 'La ubicación solo funciona en una conexión segura (HTTPS) o en localhost.',
}

/**
 * Obtiene la ubicación real del dispositivo con la API de geolocalización del navegador.
 * Nunca inventa coordenadas: si falla, `position` queda en null y `message` explica por qué.
 */
export function useGeolocationController(autoRequest = false) {
  const [status, setStatus] = useState<LocationStatus>('idle')
  const [position, setPosition] = useState<DevicePosition | null>(null)
  const mounted = useRef(true)

  const request = useCallback(() => {
    if (typeof window === 'undefined') return
    if (!window.isSecureContext) {
      setStatus('insecure')
      return
    }
    if (!('geolocation' in navigator)) {
      setStatus('unsupported')
      return
    }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (result) => {
        if (!mounted.current) return
        setPosition({
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
          accuracy: result.coords.accuracy,
        })
        setStatus('granted')
      },
      (error) => {
        if (!mounted.current) return
        setStatus(
          error.code === error.PERMISSION_DENIED
            ? 'denied'
            : error.code === error.TIMEOUT
              ? 'timeout'
              : 'unavailable',
        )
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }, [])

  useEffect(() => {
    mounted.current = true
    if (autoRequest) request()
    return () => {
      mounted.current = false
    }
  }, [autoRequest, request])

  const message =
    status === 'idle' || status === 'loading' || status === 'granted' ? '' : MESSAGES[status]

  return { status, position, message, request }
}
