export type UserRole = 'client' | 'provider' | 'admin'

export type ProviderCategory = 'masajes' | 'modelaje'

export type ProviderStatus = 'pending' | 'active' | 'suspended' | 'inactive'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Provider {
  id: string
  user_id: string
  display_name: string
  slug: string
  bio: string | null
  category: ProviderCategory
  age: number
  city: string
  commune: string | null
  address_hint: string | null
  whatsapp: string | null
  instagram: string | null
  height_cm: number | null
  weight_kg: number | null
  measurements: string | null
  status: ProviderStatus
  is_verified: boolean
  is_featured: boolean
  views_count: number
  created_at: string
  updated_at: string
  // Relations
  services?: Service[]
  media?: Media[]
  reviews?: Review[]
  average_rating?: number
  review_count?: number
}

export interface Service {
  id: string
  provider_id: string
  name: string
  description: string | null
  price: number
  duration: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Media {
  id: string
  provider_id: string
  type: 'image' | 'video'
  url: string
  thumbnail_url: string | null
  is_primary: boolean
  is_approved: boolean
  sort_order: number
  created_at: string
}

export interface Review {
  id: string
  provider_id: string
  user_id: string
  rating: number
  title: string | null
  content: string
  is_approved: boolean
  provider_response: string | null
  response_at: string | null
  created_at: string
  // Relations
  user?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

export interface Favorite {
  id: string
  user_id: string
  provider_id: string
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string
  provider_id: string
  reason: string
  description: string | null
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  admin_notes: string | null
  resolved_at: string | null
  created_at: string
}

// UI Types
export interface ProviderCardData {
  id: string
  slug: string
  display_name: string
  age: number
  city: string
  commune: string | null
  category: ProviderCategory
  is_verified: boolean
  is_featured: boolean
  average_rating: number
  review_count: number
  price_from: number
  primary_image: string | null
  is_favorite?: boolean
}

export interface FilterOptions {
  category?: ProviderCategory | 'all'
  city?: string
  min_price?: number
  max_price?: number
  verified_only?: boolean
  sort_by?: 'relevance' | 'rating' | 'price_asc' | 'price_desc' | 'newest'
}
