'use client'

import type {
  Circle as LeafletCircle,
  DivIcon,
  LayerGroup,
  Map as LeafletMapInstance,
  Marker as LeafletMarker,
} from 'leaflet'
import { useEffect, useRef } from 'react'
import { categoryStyles } from '@/models/categories'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/models/constants'
import type { MapPosition, MapReport } from '@/models/types'

export type MapFocus = {
  center: [number, number]
  zoom: number
  /** Cambia para forzar el desplazamiento aunque el centro sea el mismo. */
  nonce?: number
}

export type UserLocation = MapPosition & { accuracy?: number | null }

export default function LeafletMap({
  reports = [],
  selectedPosition,
  userLocation,
  radiusKm,
  focus,
  onPositionChange,
  onError,
  className = '',
}: {
  reports?: MapReport[]
  selectedPosition?: MapPosition | null
  /** Ubicación real del dispositivo (nunca una ubicación inventada). */
  userLocation?: UserLocation | null
  /** Si se indica junto con `userLocation`, dibuja el radio de búsqueda. */
  radiusKm?: number | null
  /** Vista a mostrar; al cambiar, el mapa se desplaza hasta ahí. */
  focus?: MapFocus | null
  onPositionChange?: (position: MapPosition) => void
  onError?: () => void
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMapInstance | null>(null)
  const reportsLayerRef = useRef<LayerGroup | null>(null)
  const userLayerRef = useRef<LayerGroup | null>(null)
  const selectionMarkerRef = useRef<LeafletMarker | null>(null)
  const leafletRef = useRef<typeof import('leaflet') | null>(null)
  const reportsRef = useRef(reports)
  const userRef = useRef({ userLocation, radiusKm })
  const onPositionChangeRef = useRef(onPositionChange)
  const onErrorRef = useRef(onError)
  const focusRef = useRef(focus)

  useEffect(() => {
    onPositionChangeRef.current = onPositionChange
    onErrorRef.current = onError
    reportsRef.current = reports
    focusRef.current = focus
    userRef.current = { userLocation, radiusKm }
  }, [onPositionChange, onError, reports, focus, userLocation, radiusKm])

  useEffect(() => {
    let active = true

    async function initialize() {
      const L = await import('leaflet')
      if (!active || !containerRef.current || mapRef.current) return
      leafletRef.current = L

      const map = L.map(containerRef.current, {
        center: focusRef.current?.center ?? DEFAULT_MAP_CENTER,
        zoom: focusRef.current?.zoom ?? DEFAULT_MAP_ZOOM,
        zoomControl: true,
        scrollWheelZoom: true,
      })
      // Un mosaico suelto puede fallar por red lenta o límites del proveedor. Solo se
      // declara el mapa caído si fallan varios seguidos y no ha cargado ninguno.
      let loadedTiles = 0
      let failedTiles = 0
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      })
        .on('tileload', () => {
          loadedTiles += 1
          failedTiles = 0
        })
        .on('tileerror', () => {
          failedTiles += 1
          if (loadedTiles === 0 && failedTiles >= 6) onErrorRef.current?.()
        })
        .addTo(map)

      map.on('click', (event) => {
        onPositionChangeRef.current?.({
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
        })
      })

      mapRef.current = map
      reportsLayerRef.current = L.layerGroup().addTo(map)
      userLayerRef.current = L.layerGroup().addTo(map)
      renderReports(L, reportsLayerRef.current, reportsRef.current)
      renderUser(L, userLayerRef.current, userRef.current.userLocation, userRef.current.radiusKm)
    }

    void initialize()
    return () => {
      active = false
      mapRef.current?.remove()
      mapRef.current = null
      reportsLayerRef.current = null
      userLayerRef.current = null
      selectionMarkerRef.current = null
    }
  }, [])

  useEffect(() => {
    const L = leafletRef.current
    const layer = reportsLayerRef.current
    if (!L || !layer) return
    renderReports(L, layer, reports)
  }, [reports])

  useEffect(() => {
    const L = leafletRef.current
    const layer = userLayerRef.current
    if (!L || !layer) return
    renderUser(L, layer, userLocation, radiusKm)
  }, [userLocation, radiusKm])

  // Al cambiar el foco (municipio, ubicación del usuario, "centrar") el mapa se desplaza.
  const focusKey = focus
    ? `${focus.center[0]},${focus.center[1]},${focus.zoom},${focus.nonce ?? 0}`
    : ''
  useEffect(() => {
    const map = mapRef.current
    if (!map || !focus) return
    map.flyTo(focus.center, focus.zoom, { duration: 0.8 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey])

  useEffect(() => {
    const L = leafletRef.current
    const map = mapRef.current
    if (!L || !map) return

    if (!selectedPosition) {
      if (selectionMarkerRef.current) {
        selectionMarkerRef.current.remove()
        selectionMarkerRef.current = null
      }
      return
    }

    const point: [number, number] = [selectedPosition.latitude, selectedPosition.longitude]
    if (!selectionMarkerRef.current) {
      selectionMarkerRef.current = L.marker(point, {
        draggable: true,
        icon: createMarkerIcon(L, '#3e216d', true),
      })
        .on('dragend', (event) => {
          const position = event.target.getLatLng()
          onPositionChangeRef.current?.({
            latitude: position.lat,
            longitude: position.lng,
          })
        })
        .bindPopup('Ubicación seleccionada. Puedes arrastrar este marcador.')
        .addTo(map)
    } else {
      selectionMarkerRef.current.setLatLng(point)
    }
    map.flyTo(point, 17, { duration: 0.8 })
  }, [selectedPosition])

  return (
    <div
      ref={containerRef}
      className={`h-full min-h-[420px] w-full ${className}`}
      aria-label="Mapa interactivo de OpenStreetMap"
    />
  )
}

function createMarkerIcon(L: typeof import('leaflet'), color: string, selected = false): DivIcon {
  return L.divIcon({
    className: '',
    html: `<span class="ruta-map-marker${selected ? ' ruta-map-marker--selected' : ''}" style="--marker-color:${color}"><span></span></span>`,
    iconSize: [34, 42],
    iconAnchor: [17, 39],
    popupAnchor: [0, -36],
  })
}

function renderUser(
  L: typeof import('leaflet'),
  layer: LayerGroup,
  location?: UserLocation | null,
  radiusKm?: number | null,
) {
  layer.clearLayers()
  if (!location) return
  const point: [number, number] = [location.latitude, location.longitude]
  if (radiusKm) {
    const circle: LeafletCircle = L.circle(point, {
      radius: radiusKm * 1000,
      color: '#6d28d9',
      weight: 1.5,
      dashArray: '6 6',
      fillColor: '#8b5cf6',
      fillOpacity: 0.06,
      interactive: false,
    })
    circle.addTo(layer)
  }
  if (location.accuracy && location.accuracy > 0 && location.accuracy < 5000) {
    L.circle(point, {
      radius: location.accuracy,
      color: '#2563eb',
      weight: 1,
      fillColor: '#3b82f6',
      fillOpacity: 0.12,
      interactive: false,
    }).addTo(layer)
  }
  L.marker(point, {
    icon: L.divIcon({
      className: '',
      html: '<span class="ruta-user-dot"></span>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    }),
    zIndexOffset: 1000,
  })
    .bindPopup('Tu ubicación actual')
    .addTo(layer)
}

function renderReports(L: typeof import('leaflet'), layer: LayerGroup, reports: MapReport[]) {
  layer.clearLayers()
  for (const report of reports) {
    if (!Number.isFinite(report.latitude) || !Number.isFinite(report.longitude)) continue
    const marker = L.marker([report.latitude, report.longitude], {
      icon: createMarkerIcon(L, categoryStyles[report.category]?.hex ?? '#6d28d9'),
    })
    marker.bindPopup(createReportPopup(report))
    marker.addTo(layer)
  }
}

function createReportPopup(report: MapReport) {
  const container = document.createElement('div')
  container.className = 'ruta-popup'
  const fields: Array<[keyof HTMLElementTagNameMap, string]> = [
    ['b', report.category],
    ['p', report.description],
  ]
  if (report.time) fields.push(['small', `Fecha: ${report.time}`])
  if (report.distance) fields.push(['small', `Distancia: ${report.distance}`])
  fields.push(['span', `${report.reference} · ${report.municipality}`])
  if (report.address) fields.push(['small', report.address])
  for (const [tag, text] of fields) {
    const element = document.createElement(tag)
    element.textContent = text
    container.appendChild(element)
  }
  return container
}
