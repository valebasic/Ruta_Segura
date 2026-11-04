import { useModerationController } from '@/controllers/useModerationController'
import { moderationStatusLabel } from '@/models/constants'
import { Button } from '../components/Button'
import { CategoryTag, PageTitle } from '../components/Display'
import { Icon } from '../components/Icon'

const statusStyle: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800',
  approved: 'bg-emerald-50 text-emerald-800',
  rejected: 'bg-rose-50 text-rose-800',
  hidden: 'bg-slate-100 text-slate-700',
}

export function ModerationPage() {
  const { items, confirmation, loadError, act, pendingCount } = useModerationController()

  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 lg:px-8 lg:pt-12">
      <PageTitle eyebrow="Acceso de moderación" title="Reportes pendientes">
        <span className="rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
          {pendingCount} por revisar
        </span>
      </PageTitle>
      {confirmation && (
        <div className="fixed right-5 top-24 z-50 flex items-center gap-2 rounded-xl bg-violet-950 px-4 py-3 text-sm font-semibold text-white shadow-xl">
          <Icon name="check" size={17} />
          {confirmation}
        </div>
      )}
      {loadError && (
        <div className="mb-4 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          {loadError}
        </div>
      )}
      <div className="space-y-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryTag category={item.category} />
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${statusStyle[item.status || 'pending']}`}
                >
                  {moderationStatusLabel[item.status || 'pending']}
                </span>
              </div>
              <span className="text-xs text-slate-400">Recibido {item.time.toLowerCase()}</span>
            </div>
            <h2 className="mt-4 font-bold text-violet-950">
              {item.reference} · {item.municipality}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <Button onClick={() => act(item.id, 'approved')}>
                <Icon name="check" size={17} /> Aprobar
              </Button>
              <Button variant="danger" onClick={() => act(item.id, 'rejected')}>
                <Icon name="close" size={17} /> Rechazar
              </Button>
              <Button variant="secondary" onClick={() => act(item.id, 'hidden')}>
                <Icon name="eye" size={17} /> Ocultar
              </Button>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
