'use client'

import dynamic from 'next/dynamic'

/** Carga Leaflet solo en el navegador (usa `window`). */
export const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-[420px] place-items-center bg-violet-50 text-sm font-semibold text-violet-700">
      Cargando mapa…
    </div>
  ),
})
