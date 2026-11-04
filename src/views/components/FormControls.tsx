import type { ReactNode } from 'react'
import type { IconName } from '@/models/types'
import { Icon } from './Icon'

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <span className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-rose-700">
      <span className="size-1.5 rounded-full bg-rose-500" />
      {children}
    </span>
  )
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  icon,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  error?: string
  icon?: IconName
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-800">{label}</span>
      <span className="relative block">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon name={icon} size={18} />
          </span>
        )}
        <input
          value={value}
          type={type}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`min-h-12 w-full rounded-xl border bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 ${
            icon ? 'pl-11' : ''
          } ${error ? 'border-rose-400' : 'border-slate-200'}`}
        />
      </span>
      {error && <ErrorText>{error}</ErrorText>}
    </label>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder: string
  error?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-800">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`min-h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-11 text-[15px] outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 ${
            error ? 'border-rose-400' : 'border-slate-200'
          } ${value ? 'text-slate-900' : 'text-slate-400'}`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 rotate-90 -translate-y-1/2 text-slate-500">
          <Icon name="chevron" size={17} />
        </span>
      </span>
      {error && <ErrorText>{error}</ErrorText>}
    </label>
  )
}
