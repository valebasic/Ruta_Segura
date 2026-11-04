import { useNearbySortController } from '@/controllers/useReportsController'
import type { CommunityReport, Screen } from '@/models/types'
import { Button } from '../components/Button'
import { Notice, PageTitle } from '../components/Display'
import { Field } from '../components/FormControls'
import { FilterBar } from '../components/FilterBar'
import { Icon } from '../components/Icon'
import { ReportCard } from '../components/ReportCard'

export function ReportsPage({
  onNavigate,
  municipality,
  setMunicipality,
  category,
  setCategory,
  reports,
  onClearFilters,
}: {
  onNavigate: (screen: Screen) => void
  municipality: string
  setMunicipality: (v: string) => void
  category: string
  setCategory: (v: string) => void
  reports: CommunityReport[]
  onClearFilters: () => void
}) {
  const { location, setLocation, locationError, showLocation, sort } = useNearbySortController()

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8 lg:pt-12">
      <PageTitle eyebrow="Información comunitaria" title="Reportes recientes">
        <Button onClick={() => onNavigate('new')}>
          <Icon name="plus" size={18} /> Crear reporte
        </Button>
      </PageTitle>
      <Notice />
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-violet-950">
          <Icon name="filter" size={18} /> Filtra los reportes
        </div>
        <FilterBar
          municipality={municipality}
          setMunicipality={setMunicipality}
          category={category}
          setCategory={setCategory}
        />
        <div className="mt-5 border-t border-slate-100 pt-5">
          {!showLocation ? (
            <Button variant="secondary" onClick={sort}>
              <Icon name="route" size={18} /> Ordenar por cercanía
            </Button>
          ) : (
            <div className="max-w-xl">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex-1">
                  <Field
                    label="Tu ubicación de origen"
                    value={location}
                    onChange={setLocation}
                    placeholder="Ej. Parque Santander, Facatativá"
                    icon="location"
                    error={locationError}
                  />
                </div>
                <Button onClick={sort} className="mt-0 sm:mt-7">
                  Calcular cercanía
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="mb-4 mt-8 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">
          {reports.length} {reports.length === 1 ? 'reporte encontrado' : 'reportes encontrados'}
        </p>
        <p className="hidden text-xs text-slate-400 sm:block">
          La identidad de quien reporta nunca se muestra
        </p>
      </div>
      {reports.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((report) => (
            <ReportCard report={report} key={report.id} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-violet-200 bg-white px-6 py-16 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-violet-50 text-violet-700">
            <Icon name="reports" size={26} />
          </span>
          <h2 className="mt-5 text-lg font-bold text-violet-950">
            No hay reportes para los filtros seleccionados
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            Prueba con otro municipio o categoría para ampliar los resultados.
          </p>
          <Button variant="secondary" className="mt-5" onClick={onClearFilters}>
            Limpiar filtros
          </Button>
        </div>
      )}
    </main>
  )
}
