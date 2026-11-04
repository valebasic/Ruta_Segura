import { useState } from 'react'
import { useMapController } from '@/controllers/useMapController'
import { categoryStyles, REPORT_CATEGORIES } from '@/models/categories'
import { RADIUS_OPTIONS_KM } from '@/models/geo'
import type { Screen } from '@/models/types'
import { Button } from '../components/Button'
import { PageTitle } from '../components/Display'
import { FilterBar } from '../components/FilterBar'
import { Icon } from '../components/Icon'
import { LeafletMap } from '../components/LeafletMapLazy'
import { ReportCard } from '../components/ReportCard'

export function MapPage({
  onNavigate,
  municipality,
  setMunicipality,
  category,
  setCategory,
}: {
  onNavigate: (screen: Screen) => void
  municipality: string
  setMunicipality: (v: string) => void
  category: string
  setCategory: (v: string) => void
}) {
  const [mapError, setMapError] = useState(false)
  const map = useMapController(municipality, category)
  const { geo, position } = map

  const status = (() => {
    if (geo.status === 'loading' || geo.status === 'idle')
      return { tone: 'info', text: 'Obteniendo tu ubicación… acepta el permiso del navegador.' }
    if (position)
      return {
        tone: 'ok',
        text: `Mostrando reportes a menos de ${map.radiusKm} km de tu ubicación${
          position.accuracy ? ` (precisión ±${Math.round(position.accuracy)} m)` : ''
        }.`,
      }
    return { tone: 'warn', text: geo.message }
  })()

  const toneClass = {
    info: 'border-violet-100 bg-violet-50 text-violet-900',
    ok: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-950',
  }[status.tone as 'info' | 'ok' | 'warn']

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8 lg:pt-10">
      <PageTitle eyebrow="Explora el territorio" title="Mapa de reportes" />

      <div className={`mb-4 flex flex-col gap-3 rounded-2xl border p-4 text-sm font-semibold sm:flex-row sm:items-center sm:justify-between ${toneClass}`}>
        <p role="status" className="flex items-start gap-2">
          <Icon name="location" size={18} />
          <span>{status.text}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {position && (
            <label className="flex items-center gap-2 text-xs">
              Radio
              <select
                value={map.radiusKm}
                onChange={(event) => map.setRadiusKm(Number(event.target.value))}
                className="min-h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900"
              >
                {RADIUS_OPTIONS_KM.map((km) => (
                  <option key={km} value={km}>
                    {km} km
                  </option>
                ))}
              </select>
            </label>
          )}
          <Button
            variant="secondary"
            className="min-h-10"
            onClick={() => {
              setMunicipality('')
              map.recenter()
            }}
          >
            <Icon name="location" size={16} /> Centrar en mi ubicación
          </Button>
          <Button variant="secondary" className="min-h-10" onClick={map.refresh}>
            <Icon name="route" size={16} /> Actualizar
          </Button>
        </div>
      </div>

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
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={() => setMapError(false)}>Reintentar</Button>
              <Button variant="secondary" onClick={() => onNavigate('reports')}>
                Ir al listado
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative min-h-[590px] overflow-hidden rounded-3xl border border-slate-200 bg-[#e7ece4] shadow-sm">
          <LeafletMap
            reports={map.reports}
            userLocation={position}
            radiusKm={position ? map.radiusKm : null}
            focus={map.focus}
            className="min-h-[590px]"
            onError={() => setMapError(true)}
          />
          <div className="pointer-events-none absolute right-4 top-4 z-[500] space-y-2 rounded-2xl bg-white/95 p-3 text-[10px] font-bold text-slate-600 shadow-lg">
            {REPORT_CATEGORIES.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${categoryStyles[item].dot}`} />
                {item}
              </div>
            ))}
          </div>
          {!map.loading && !map.reports.length && (
            <div className="pointer-events-none absolute bottom-6 left-1/2 z-[500] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-white/95 p-4 text-center text-sm font-semibold text-slate-600 shadow-lg">
              {position
                ? `No se encontraron reportes en esta zona (radio de ${map.radiusKm} km).`
                : 'No hay reportes aprobados para mostrar.'}
            </div>
          )}
        </div>
      )}

      {map.error && (
        <div role="alert" className="mt-4 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          {map.error}
        </div>
      )}

      {map.reports.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-violet-950">
            {position ? 'Reportes cercanos, del más cercano al más lejano' : 'Reportes recientes'}{' '}
            <span className="text-sm font-semibold text-slate-400">({map.reports.length})</span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {map.reports.map((report) => (
              <ReportCard report={report} key={report.id} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
