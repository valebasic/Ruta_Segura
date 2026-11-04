import { useMyReportsController } from '@/controllers/useMyReportsController'
import { moderationStatusLabel } from '@/models/constants'
import type { Screen } from '@/models/types'
import { Button } from '../components/Button'
import { CategoryTag, PageTitle } from '../components/Display'
import { Icon } from '../components/Icon'

const statusStyle: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800',
  approved: 'bg-emerald-50 text-emerald-800',
  rejected: 'bg-rose-50 text-rose-800',
  hidden: 'bg-slate-100 text-slate-700',
}

const statusHelp: Record<string, string> = {
  pending: 'Aún no es visible para la comunidad.',
  approved: 'Publicado: la comunidad puede verlo en la lista y el mapa.',
  rejected: 'Retirado por la administración.',
  hidden: 'Oculto por la administración.',
}

export function MyReportsPage({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const c = useMyReportsController()

  return (
    <main className="mx-auto max-w-5xl px-4 pb-28 pt-8 sm:px-6 lg:px-8 lg:pt-12">
      <PageTitle eyebrow="Tu actividad" title="Mis reportes">
        <Button onClick={() => onNavigate('new')}>
          <Icon name="plus" size={18} /> Crear reporte
        </Button>
      </PageTitle>

      {c.notice && (
        <div
          role="status"
          className="fixed right-5 top-24 z-50 flex items-center gap-2 rounded-xl bg-violet-950 px-4 py-3 text-sm font-semibold text-white shadow-xl"
        >
          <Icon name="check" size={17} />
          {c.notice}
        </div>
      )}
      {c.error && (
        <div role="alert" className="mb-4 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          {c.error}{' '}
          <button className="underline" onClick={c.reload}>
            Reintentar
          </button>
        </div>
      )}

      {c.loading ? (
        <p className="text-sm font-semibold text-slate-500">Cargando tus reportes…</p>
      ) : c.reports.length === 0 && !c.error ? (
        <div className="rounded-3xl border border-dashed border-violet-200 bg-white px-6 py-16 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-violet-50 text-violet-700">
            <Icon name="reports" size={26} />
          </span>
          <h2 className="mt-5 text-lg font-bold text-violet-950">Aún no has creado reportes</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            Cuando envíes uno aparecerá aquí con su estado de revisión.
          </p>
          <Button className="mt-5" onClick={() => onNavigate('new')}>
            Crear mi primer reporte
          </Button>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm font-bold text-slate-700">
            {c.reports.length} {c.reports.length === 1 ? 'reporte' : 'reportes'}
          </p>
          <div className="space-y-4">
            {c.reports.map((report) => {
              const status = report.status || 'pending'
              const confirming = c.confirmingId === report.id
              const deleting = c.deletingId === report.id
              return (
                <article
                  key={report.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <CategoryTag category={report.category} />
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${statusStyle[status]}`}
                      >
                        {moderationStatusLabel[status]}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{report.time}</span>
                  </div>
                  <h2 className="mt-4 font-bold text-violet-950">
                    {report.reference} · {report.municipality}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{report.description}</p>
                  <p className="mt-3 text-xs font-semibold text-slate-400">{statusHelp[status]}</p>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    {confirming ? (
                      <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-semibold text-rose-900">
                          ¿Eliminar este reporte? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="danger"
                            className="bg-white"
                            disabled={deleting}
                            onClick={() => c.confirmDelete(report.id)}
                          >
                            {deleting ? 'Eliminando…' : 'Sí, eliminar'}
                          </Button>
                          <Button variant="secondary" disabled={deleting} onClick={c.cancelDelete}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="danger" onClick={() => c.askDelete(report.id)}>
                        <Icon name="close" size={17} /> Eliminar reporte
                      </Button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </>
      )}
    </main>
  )
}
