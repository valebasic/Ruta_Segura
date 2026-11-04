'use client'

import { useEffect, useState } from 'react'
import { moderationActionLabel } from '@/models/constants'
import type { CommunityReport } from '@/models/types'
import { fetchModerationReports, updateReportStatus } from '@/services/reportService'

/** Controla la cola de moderación de reportes. */
export function useModerationController() {
  const [items, setItems] = useState<CommunityReport[]>([])
  const [confirmation, setConfirmation] = useState('')
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    fetchModerationReports()
      .then(setItems)
      .catch(() => setLoadError('No fue posible cargar los reportes de moderación'))
  }, [])

  const act = async (id: string | number, status: string) => {
    const ok = await updateReportStatus(id, status)
    if (!ok) {
      setConfirmation('No fue posible actualizar el reporte.')
      return
    }
    setItems(items.map((item) => (item.id === id ? { ...item, status } : item)))
    setConfirmation(`El reporte fue marcado como ${moderationActionLabel[status]}.`)
    window.setTimeout(() => setConfirmation(''), 3000)
  }

  const pendingCount = items.filter((item) => item.status === 'pending').length

  return { items, confirmation, loadError, act, pendingCount }
}
