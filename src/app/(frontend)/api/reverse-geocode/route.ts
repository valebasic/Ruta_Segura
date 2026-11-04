import 'server-only'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const latitude = Number(url.searchParams.get('lat'))
  const longitude = Number(url.searchParams.get('lon'))

  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return Response.json({ error: 'Coordenadas inválidas' }, { status: 400 })
  }

  const apiKey = process.env.GEOAPIFY_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Geocodificación no configurada' }, { status: 503 })
  }

  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&format=json&apiKey=${encodeURIComponent(apiKey)}`,
      { cache: 'no-store', signal: AbortSignal.timeout(8000) },
    )
    if (!response.ok) throw new Error('Geoapify no respondió correctamente')
    const data = await response.json()
    const address = data?.results?.[0]?.formatted
    if (!address) return Response.json({ address: null })
    return Response.json({ address })
  } catch {
    return Response.json({ error: 'No fue posible obtener la dirección' }, { status: 502 })
  }
}
