'use client'

import type {
  DivIcon,
  LayerGroup,
  Map as LeafletMapInstance,
  Marker as LeafletMarker,
} from 'leaflet'
import { useEffect, useRef } from 'react'
import type { MapPosition, MapReport } from '@/models/types'

const FACATATIVA: [number, number] = [4.8143, -74.3545]

const colors = {
  ACOSO: '#d946ef',
  'ILUMINACIÓN DEFICIENTE': '#f59e0b',
  'ZONA DESOLADA': '#0ea5e9',
}

export default function LeafletMap({
  reports = [],
  selectedPosition,
  onPositionChange,
  onError,
  className = '',
}: {
  reports?: MapReport[]
  selectedPosition?: MapPosition | null
  onPositionChange?: (position: MapPosition) => void
  onError?: () => void
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMapInstance | null>(null)
  const reportsLayerRef = useRef<LayerGroup | null>(null)
  const selectionMarkerRef = useRef<LeafletMarker | null>(null)
  const leafletRef = useRef<typeof import('leaflet') | null>(null)
  const reportsRef = useRef(reports)
  const onPositionChangeRef = useRef(onPositionChange)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onPositionChangeRef.current = onPositionChange
    onErrorRef.current = onError
    reportsRef.current = reports
  }, [onPositionChange, onError, reports])

  useEffect(() => {
    let active = true

    async function initialize() {
      const L = await import('leaflet')
      if (!active || !containerRef.current || mapRef.current) return
      leafletRef.current = L

      const map = L.map(containerRef.current, {
        center: FACATATIVA,
        zoom: 14,
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
      const reportsLayer = L.layerGroup().addTo(map)
      reportsLayerRef.current = reportsLayer
      renderReports(L, reportsLayer, reportsRef.current)
    }

    void initialize()
    return () => {
      active = false
      mapRef.current?.remove()
      mapRef.current = null
      reportsLayerRef.current = null
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

function renderReports(L: typeof import('leaflet'), layer: LayerGroup, reports: MapReport[]) {
  layer.clearLayers()
  for (const report of reports) {
    if (!Number.isFinite(report.latitude) || !Number.isFinite(report.longitude)) continue
    const marker = L.marker([report.latitude, report.longitude], {
      icon: createMarkerIcon(L, colors[report.category]),
    })
    marker.bindPopup(createReportPopup(report))
    marker.addTo(layer)
  }
}

function createReportPopup(report: MapReport) {
  const container = document.createElement('div')
  container.className = 'ruta-popup'
  const fields: Array<[keyof HTMLElementTagNameMap, string, string?]> = [
    ['strong', report.reference],
    ['span', report.municipality],
    ['b', report.category],
    ['p', report.description],
  ]
  if (report.address) fields.push(['small', report.address])
  for (const [tag, text] of fields) {
    const element = document.createElement(tag)
    element.textContent = text
    container.appendChild(element)
  }
  return container
}
