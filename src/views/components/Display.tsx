import type { ReactNode } from 'react'
import { categoryStyles, type Category } from '@/models/categories'
import { Icon } from './Icon'

export function CategoryTag({ category }: { category: Category }) {
  const style = categoryStyles[category]?.tag ?? 'bg-slate-50 text-slate-700 ring-slate-200'
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-[.04em] ring-1 ring-inset ${style}`}
    >
      {category}
    </span>
  )
}

export function Notice() {
  return (
    <div className="flex gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 p-4 text-xs leading-relaxed text-violet-950">
      <span className="mt-0.5 shrink-0 text-violet-700">
        <Icon name="shield" size={18} />
      </span>
      <p>
        <strong>Información comunitaria:</strong> Ruta Segura comparte percepción de riesgo. No es
        un servicio de emergencia ni garantiza que una zona sea segura.
      </p>
    </div>
  )
}

export function PageTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children?: ReactNode
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[.16em] text-violet-600">
          {eyebrow}
        </p>
        <h1 className="text-[28px] font-bold tracking-[-.035em] text-violet-950 sm:text-4xl">
          {title}
        </h1>
      </div>
      {children}
    </div>
  )
}
