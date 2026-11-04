import type { ReactNode } from 'react'

const variants = {
  primary: 'bg-violet-900 text-white shadow-[0_8px_24px_rgba(76,29,149,.16)] hover:bg-violet-800',
  secondary: 'border border-violet-200 bg-white text-violet-900 hover:bg-violet-50',
  ghost: 'text-violet-800 hover:bg-violet-50',
  danger: 'border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100',
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
}: {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: keyof typeof variants
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
