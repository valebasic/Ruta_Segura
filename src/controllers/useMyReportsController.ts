'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CommunityReport } from '@/models/types'
import { deleteMyReport, fetchMyReports } from '@/services/reportService'

/** Controla "Mis reportes": lista los propios y permite eliminarlos con confirmación. */
export function useMyReportsController() {
  const [reports, setReports] = useState<CommunityReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmingId, setConfirmingId] = useState<string | number | null>(null)
  const [deletingId, setDeletingId] = useState<string | number | null>(null)
  const [notice, setNotice] = useState('')
  const deletingRef = useRef(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setReports(await fetchMyReports())
    } catch {
      setReports([])
      setError('No fue posible cargar tus reportes. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const askDelete = (id: string | number) => {
    setNotice('')
    setConfirmingId(id)
  }
  const cancelDelete = () => setConfirmingId(null)

  const confirmDelete = async (id: string | number) => {
    if (deletingRef.current) return
    deletingRef.current = true
    setDeletingId(id)
    setError('')
    const result = await deleteMyReport(id).catch(
      () => ({ ok: false as const, error: 'No hay conexión con el servidor.' }),
    )
    deletingRef.current = false
    setDeletingId(null)
    if (!result.ok) {
      setError(result.error || 'No fue posible eliminar el reporte.')
      return
    }
    setReports((current) => current.filter((report) => report.id !== id))
    setConfirmingId(null)
    setNotice('El reporte fue eliminado.')
    window.setTimeout(() => setNotice(''), 3500)
  }

  return {
    reports,
    loading,
    error,
    notice,
    confirmingId,
    deletingId,
    askDelete,
    cancelDelete,
    confirmDelete,
    reload: load,
  }
}
