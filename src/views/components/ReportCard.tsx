import type { CommunityReport } from '@/models/types'
import { CategoryTag } from './Display'
import { Icon } from './Icon'

export function ReportCard({ report }: { report: CommunityReport }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_18px_rgba(51,35,82,.045)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(51,35,82,.08)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <CategoryTag category={report.category} />
        <span className="shrink-0 text-xs text-slate-400">{report.time}</span>
      </div>
      <div className="mt-4 flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700">
          <Icon name="location" size={18} />
        </span>
        <div>
          <p className="font-bold text-violet-950">{report.reference}</p>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            {report.municipality}, Cundinamarca
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">{report.description}</p>
      <div className="mt-5 border-t border-slate-100 pt-4">
        {report.distance ? (
          <p className="flex items-center gap-2 text-xs font-bold text-violet-700">
            <Icon name="route" size={16} />
            {report.distance}
          </p>
        ) : report.hasCoordinates ? (
          <p className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <Icon name="check" size={16} />
            Coordenadas verificadas
          </p>
        ) : (
          <p className="flex items-center gap-2 text-xs font-semibold text-amber-800">
            <Icon name="location" size={16} />
            Ubicación sin coordenadas verificadas
          </p>
        )}
      </div>
    </article>
  )
}
