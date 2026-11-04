import { normalizeReport } from '@/models/report'
import type {
  CommunityReport,
  MapPosition,
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

export async function fetchNearbyReports(
  origin: MapPosition,
  radiusKm: number,
): Promise<CommunityReport[]> {
  const query = new URLSearchParams({
    lat: String(origin.latitude),
    lon: String(origin.longitude),
    radius_km: String(radiusKm),
  })
  const response = await fetch(`/api/community-reports?${query}`)
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

export async function fetchMyReports(): Promise<CommunityReport[]> {
  const response = await fetch('/api/my-reports')
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error)
  return data.reports.map(normalizeReport)
}

export async function deleteMyReport(id: string | number): Promise<ServiceResult> {
  const response = await fetch('/api/my-reports', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) return { ok: false, error: data.error }
  return { ok: true }
}
