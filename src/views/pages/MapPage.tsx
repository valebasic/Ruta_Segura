import { useState } from 'react'
import { categories } from '@/models/constants'
import type { Category, CommunityReport, Screen } from '@/models/types'
import { Button } from '../components/Button'
import { PageTitle } from '../components/Display'
import { FilterBar } from '../components/FilterBar'
import { Icon } from '../components/Icon'
import { LeafletMap } from '../components/LeafletMapLazy'

const markerColors: Record<Category, string> = {
  ACOSO: 'bg-fuchsia-500',
  'ILUMINACIÓN DEFICIENTE': 'bg-amber-500',
  'ZONA DESOLADA': 'bg-sky-500',
}

export function MapPage({
  onNavigate,
  municipality,
  setMunicipality,
  category,
  setCategory,
  reports,
}: {
  onNavigate: (screen: Screen) => void
  municipality: string
  setMunicipality: (v: string) => void
  category: string
  setCategory: (v: string) => void
  reports: CommunityReport[]
}) {
  const [mapError, setMapError] = useState(false)

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8 lg:pt-10">
      <PageTitle eyebrow="Explora el territorio" title="Mapa de reportes" />
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
        <FilterBar
          compact
          municipality={municipality}
          setMunicipality={setMunicipality}
          category={category}
          setCategory={setCategory}
        />
      </div>
      {mapError ? (
        <div className="grid min-h-[520px] place-items-center rounded-3xl border border-slate-200 bg-white p-7 text-center">
          <div>
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-violet-50 text-violet-700">
              <Icon name="map" size={30} />
            </span>
            <h2 className="mt-5 text-xl font-bold text-violet-950">El mapa no está disponible</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              Puedes seguir consultando el listado mientras restablecemos esta vista.
            </p>
            <Button className="mt-6" onClick={() => onNavigate('reports')}>
              Ir al listado
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative min-h-[590px] overflow-hidden rounded-3xl border border-slate-200 bg-[#e7ece4] shadow-sm">
          <LeafletMap
            reports={reports}
            className="min-h-[590px]"
            onError={() => setMapError(true)}
          />
          <div className="pointer-events-none absolute right-4 top-4 z-[500] space-y-2 rounded-2xl bg-white/95 p-3 text-[10px] font-bold text-slate-600 shadow-lg">
            {categories.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${markerColors[item]}`} />
                {item}
              </div>
            ))}
          </div>
          {!reports.length && (
            <div className="pointer-events-none absolute bottom-6 left-1/2 z-[500] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-white/95 p-4 text-center text-sm font-semibold text-slate-600 shadow-lg">
              No hay reportes aprobados con coordenadas para estos filtros.
            </div>
          )}
        </div>
      )}
    </main>
  )
}
