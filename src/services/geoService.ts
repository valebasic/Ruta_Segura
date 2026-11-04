import type { MapPosition } from '@/models/types'

export async function reverseGeocode(position: MapPosition): Promise<string> {
  const response = await fetch(
    `/api/reverse-geocode?lat=${encodeURIComponent(position.latitude)}&lon=${encodeURIComponent(position.longitude)}`,
  )
  const data = await response.json()
  if (!response.ok || !data.address) throw new Error()
  return data.address
}
