import type { Category } from './types'

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

export const categories: Category[] = ['ACOSO', 'ILUMINACIÓN DEFICIENTE', 'ZONA DESOLADA']

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

export const moderationActionLabel: Record<string, string> = {
  approved: 'aprobado',
  rejected: 'rechazado',
  hidden: 'oculto',
}
