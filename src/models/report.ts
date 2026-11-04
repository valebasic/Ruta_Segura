import { formatDistance } from './geo'
import type { Category, CommunityReport } from './types'

export function normalizeReport(value: Record<string, any>): CommunityReport {
  const municipality =
    typeof value.municipality === 'object'
      ? value.municipality?.name
      : value.municipality || 'Municipio no disponible'
  const category = typeof value.category === 'object' ? value.category?.name : value.category
  return {
    id: value.id,
    latitude: Number(value.latitude),
    longitude: Number(value.longitude),
    municipality,
    category: category as Category,
    reference:
      value.referencePoint || value.reference_point || value.address || 'Punto seleccionado',
    description: value.description || '',
    address: value.address,
    distance: typeof value.distance_km === 'number' ? formatDistance(value.distance_km) : null,
    distanceKm: typeof value.distance_km === 'number' ? value.distance_km : null,
    hasCoordinates:
      Number.isFinite(Number(value.latitude)) && Number.isFinite(Number(value.longitude)),
    time:
      value.createdAt || value.created_at
        ? new Intl.DateTimeFormat('es-CO', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(new Date(value.createdAt || value.created_at))
        : 'Reciente',
    createdAt: value.createdAt || value.created_at || null,
    status: value.status,
  }
}

export function filterReports(
  reports: CommunityReport[],
  municipality: string,
  category: string,
): CommunityReport[] {
  return reports.filter(
    (report) =>
      (!municipality || report.municipality === municipality) &&
      (!category || report.category === category),
  )
}
