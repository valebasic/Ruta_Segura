import { Icon } from './Icon'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-violet-900 text-white shadow-sm">
        <Icon name="route" size={21} />
      </span>
      {!compact && (
        <div>
          <p className="text-[17px] font-bold leading-none tracking-tight text-violet-950">
            Ruta Segura
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[.16em] text-violet-500">
            Cundinamarca
          </p>
        </div>
      )}
    </div>
  )
}
