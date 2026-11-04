const EARTH_RADIUS_KM = 6371

export const DEFAULT_RADIUS_KM = 5
export const RADIUS_OPTIONS_KM = [1, 2, 5, 10, 20]

const toRad = (degrees: number) => (degrees * Math.PI) / 180

/** Distancia en km entre dos coordenadas (fórmula de Haversine). */
export function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Rectángulo que contiene el círculo de `radiusKm`, para filtrar rápido en la base de datos. */
export function boundingBox(latitude: number, longitude: number, radiusKm: number) {
  const dLat = (radiusKm / EARTH_RADIUS_KM) * (180 / Math.PI)
  const dLon = dLat / Math.max(0.01, Math.cos(toRad(latitude)))
  return {
    minLat: latitude - dLat,
    maxLat: latitude + dLat,
    minLon: longitude - dLon,
    maxLon: longitude + dLon,
  }
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m`
  return `${km.toFixed(1).replace('.', ',')} km`
}
