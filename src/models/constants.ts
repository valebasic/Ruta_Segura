import { REPORT_CATEGORIES } from './categories'

export const municipalities = [
  'Facatativá',
  'Madrid',
  'Mosquera',
  'Funza',
  'Bojacá',
  'Zipacón',
  'El Rosal',
  'Subachoque',
]

export const categories = [...REPORT_CATEGORIES]

export const referencePoints: Record<string, string[]> = {
  Facatativá: [
    'Parque Santander',
    'Terminal de transporte',
    'Calle 15 con carrera 5',
    'Estación del tren',
  ],
  Madrid: ['Parque Pedro Fernández Madrid', 'Puente de La Prosperidad', 'Glorieta de Cartagenita'],
  Mosquera: ['Parque principal', 'Biblioteca San Juan Bosco', 'Sector Ecoplaza'],
  Funza: ['Parque principal', 'Villa Olímpica', 'Biblioteca pública'],
  Bojacá: ['Parque principal', 'Santuario de Nuestra Señora de la Salud'],
  Zipacón: ['Parque principal', 'Estación del ferrocarril'],
  'El Rosal': ['Parque principal', 'Sector Campo Alegre'],
  Subachoque: ['Parque principal', 'Sector La Pradera'],
}

export const moderationStatusLabel: Record<string, string> = {
  pending: 'PENDIENTE',
  approved: 'APROBADO',
  rejected: 'RECHAZADO',
  hidden: 'OCULTO',
}

/** Centro aproximado de cada municipio [latitud, longitud] para centrar el mapa. */
export const municipalityCenters: Record<string, [number, number]> = {
  Facatativá: [4.8143, -74.3545],
  Madrid: [4.7329, -74.265],
  Mosquera: [4.7059, -74.2302],
  Funza: [4.7164, -74.2113],
  Bojacá: [4.7342, -74.3406],
  Zipacón: [4.7569, -74.38],
  'El Rosal': [4.8514, -74.2622],
  Subachoque: [4.9293, -74.1737],
}

export const DEFAULT_MAP_CENTER: [number, number] = municipalityCenters['Facatativá']
export const DEFAULT_MAP_ZOOM = 14
