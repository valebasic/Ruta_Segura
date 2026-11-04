'use client'

import { useEffect, useMemo, useState } from 'react'
import { filterReports } from '@/models/report'
import type { CommunityReport, Screen } from '@/models/types'
import { validateOrigin } from '@/models/validation'
import { fetchReports } from '@/services/reportService'

/** Carga los reportes y administra los filtros compartidos por lista y mapa. */
export function useReportsController(screen: Screen) {
  const [municipality, setMunicipality] = useState('')
  const [category, setCategory] = useState('')
  const [reports, setReports] = useState<CommunityReport[]>([])

  useEffect(() => {
    if (screen !== 'reports') return
    fetchReports()
      .then(setReports)
      .catch(() => setReports([]))
  }, [screen])

  const filtered = useMemo(
    () => filterReports(reports, municipality, category),
    [reports, municipality, category],
  )

  const clearFilters = () => {
    setMunicipality('')
    setCategory('')
  }

  return { municipality, setMunicipality, category, setCategory, filtered, clearFilters }
}

/** Controla el formulario de "ordenar por cercanía" de la lista de reportes. */
export function useNearbySortController() {
  const [location, setLocationValue] = useState('')
  const [locationError, setLocationError] = useState('')
  const [showLocation, setShowLocation] = useState(false)

  const setLocation = (value: string) => {
    setLocationValue(value)
    setLocationError('')
  }

  const sort = () => {
    if (!showLocation) {
      setShowLocation(true)
      return
    }
    setLocationError(validateOrigin(location))
  }

  return { location, setLocation, locationError, showLocation, sort }
}
