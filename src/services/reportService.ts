import { normalizeReport } from '@/models/report'
import type {
  CommunityReport,
  NewReportPayload,
  ServiceResult,
  Taxonomy,
} from '@/models/types'

export async function fetchReports(): Promise<CommunityReport[]> {
  const response = await fetch('/api/community-reports')
  if (!response.ok) throw new Error()
  const data = await response.json()
  return data.reports.map(normalizeReport)
}

export async function fetchTaxonomy(): Promise<Taxonomy> {
  const response = await fetch('/api/taxonomies')
  return response.json()
}

export async function submitReport(payload: NewReportPayload): Promise<ServiceResult> {
  const response = await fetch('/api/community-reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) return { ok: false, error: data.error }
  return { ok: true }
}

export async function fetchModerationReports(): Promise<CommunityReport[]> {
  const response = await fetch('/api/moderation-reports')
  const data = await response.json()
  if (!response.ok) throw new Error(data.error)
  return data.reports.map(normalizeReport)
}

export async function updateReportStatus(id: string | number, status: string): Promise<boolean> {
  const response = await fetch('/api/moderation-reports', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status }),
  })
  return response.ok
}
