/**
 * Única fuente de verdad de las categorías de reporte.
 * La usan el formulario, el mapa, los filtros, la API y la colección de Payload.
 */
export const REPORT_CATEGORIES = [
  'Acoso callejero',
  'Robo o intento de robo',
  'Violencia o agresión',
  'Zona oscura o con poca iluminación',
  'Zona solitaria o de riesgo',
] as const

export type Category = (typeof REPORT_CATEGORIES)[number]

export const isCategory = (value: unknown): value is Category =>
  typeof value === 'string' && (REPORT_CATEGORIES as readonly string[]).includes(value)

/** Estilo de cada categoría: color del marcador (hex), punto de leyenda y etiqueta. */
export const categoryStyles: Record<Category, { hex: string; dot: string; tag: string }> = {
  'Acoso callejero': {
    hex: '#d946ef',
    dot: 'bg-fuchsia-500',
    tag: 'bg-fuchsia-50 text-fuchsia-800 ring-fuchsia-200',
  },
  'Robo o intento de robo': {
    hex: '#ef4444',
    dot: 'bg-red-500',
    tag: 'bg-red-50 text-red-800 ring-red-200',
  },
  'Violencia o agresión': {
    hex: '#7c3aed',
    dot: 'bg-violet-600',
    tag: 'bg-violet-50 text-violet-800 ring-violet-200',
  },
  'Zona oscura o con poca iluminación': {
    hex: '#f59e0b',
    dot: 'bg-amber-500',
    tag: 'bg-amber-50 text-amber-800 ring-amber-200',
  },
  'Zona solitaria o de riesgo': {
    hex: '#0ea5e9',
    dot: 'bg-sky-500',
    tag: 'bg-sky-50 text-sky-800 ring-sky-200',
  },
}
