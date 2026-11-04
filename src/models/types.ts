export type Screen =
  | 'register'
  | 'login'
  | 'reports'
  | 'map'
  | 'new'
  | 'profile'
  | 'moderation'

export type Category = 'ACOSO' | 'ILUMINACIÓN DEFICIENTE' | 'ZONA DESOLADA'

export type IconName =
  | 'arrow'
  | 'check'
  | 'chevron'
  | 'close'
  | 'eye'
  | 'filter'
  | 'location'
  | 'lock'
  | 'map'
  | 'menu'
  | 'plus'
  | 'reports'
  | 'route'
  | 'shield'
  | 'user'

export type MapPosition = {
  latitude: number
  longitude: number
}

export type MapReport = {
  id: string | number
  latitude: number
  longitude: number
  municipality: string
  category: Category
  reference: string
  description: string
  address?: string | null
}

export type CommunityReport = MapReport & {
  distance: string | null
  hasCoordinates: boolean
  time: string
  status?: string
}

export type UserSummary = {
  email: string
  name: string
  role: 'community' | 'moderator'
}

export type TaxonomyItem = { id: string | number; name: string }

export type Taxonomy = {
  municipalities: TaxonomyItem[]
  categories: TaxonomyItem[]
}

export type LocationSource = 'gps' | 'manual'

export type AuthMode = 'register' | 'login'

export type FormErrors = Record<string, string>

export type NewReportPayload = {
  latitude: number
  longitude: number
  accuracy_m: number | null
  address: string
  municipality_id: string | number
  category_id: string | number
  description: string
  location_source: LocationSource
  reference_point: string
}

export type ServiceResult = { ok: true } | { ok: false; error?: string }
