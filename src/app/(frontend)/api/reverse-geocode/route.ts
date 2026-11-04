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

  try {
    // Nominatim (OpenStreetMap): gratuito y sin clave. Su política exige un User-Agent
    // propio y no más de 1 consulta por segundo.
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=0&accept-language=es&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`,
      {
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'RutaSegura/1.0 (https://github.com/valebasic/Ruta_Segura)' },
      },
    )
    if (!response.ok) throw new Error('Nominatim no respondió correctamente')
    const data = await response.json()
    const address = typeof data?.display_name === 'string' ? data.display_name : null
    return Response.json({ address })
  } catch {
    return Response.json({ error: 'No fue posible obtener la dirección' }, { status: 502 })
  }
}
