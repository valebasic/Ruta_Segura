'use client'

import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, municipalityCenters } from '@/models/constants'
import { DEFAULT_RADIUS_KM } from '@/models/geo'
import { filterReports } from '@/models/report'
import type { CommunityReport } from '@/models/types'
import { fetchNearbyReports, fetchReports } from '@/services/reportService'
import { useGeolocationController } from './useGeolocationController'

const zoomForRadius = (km: number) => (km <= 1 ? 15 : km <= 2 ? 14 : km <= 5 ? 13 : km <= 10 ? 12 : 11)

/**
 * Controla la pantalla del mapa: pide la ubicación al entrar, consulta los reportes
 * dentro del radio (más cercanos primero) y decide hacia dónde se centra el mapa.
 */
export function useMapController(municipality: string, category: string) {
  const geo = useGeolocationController(true)
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM)
  const [reports, setReports] = useState<CommunityReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshNonce, setRefreshNonce] = useState(0)
  const [recenterNonce, setRecenterNonce] = useState(0)

  const position = geo.position
  const waitingForLocation = geo.status === 'idle' || geo.status === 'loading'

  useEffect(() => {
    // Mientras se espera la respuesta del permiso no se consulta nada.
    if (waitingForLocation && !position) return
    let active = true
    setLoading(true)
    setError('')
    const load = position ? fetchNearbyReports(position, radiusKm) : fetchReports()
    load
      .then((rows) => active && setReports(rows))
      .catch(() => {
        if (!active) return
        setReports([])
        setError('No fue posible cargar los reportes. Intenta actualizar el mapa.')
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position?.latitude, position?.longitude, radiusKm, refreshNonce, waitingForLocation])

  const filtered = useMemo(
    () => filterReports(reports, municipality, category),
    [reports, municipality, category],
  )

  const focus = useMemo(() => {
    if (municipality && municipalityCenters[municipality])
      return { center: municipalityCenters[municipality], zoom: DEFAULT_MAP_ZOOM, nonce: recenterNonce }
    if (position)
      return {
        center: [position.latitude, position.longitude] as [number, number],
        zoom: zoomForRadius(radiusKm),
        nonce: recenterNonce,
      }
    return { center: DEFAULT_MAP_CENTER, zoom: DEFAULT_MAP_ZOOM, nonce: recenterNonce }
  }, [municipality, position, radiusKm, recenterNonce])

  /** Vuelve a pedir la ubicación y a consultar los reportes. */
  const refresh = () => {
    geo.request()
    setRefreshNonce((n) => n + 1)
  }

  /** Centra el mapa en la ubicación actual (la pide de nuevo si no la tiene). */
  const recenter = () => {
    if (!position) geo.request()
    setRecenterNonce((n) => n + 1)
  }

  return {
    geo,
    position,
    radiusKm,
    setRadiusKm,
    reports: filtered,
    total: reports.length,
    loading: loading || (waitingForLocation && !position),
    error,
    focus,
    refresh,
    recenter,
  }
}
