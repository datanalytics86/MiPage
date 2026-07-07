export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'provider' | 'admin'
export type ProviderStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type ReportStatus = 'pending' | 'resolved' | 'dismissed'
export type ReportType = 'profile' | 'review' | 'message' | 'photo'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          role: UserRole
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          role?: UserRole
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          role?: UserRole
          phone?: string | null
          updated_at?: string
        }
      }
      providers: {
        Row: {
          id: string
          user_id: string
          slug: string
          display_name: string
          bio: string | null
          category: string
          city: string
          address: string | null
          whatsapp: string | null
          instagram: string | null
          cover_photo: string | null
          photos: string[]
          status: ProviderStatus
          is_verified: boolean
          is_featured: boolean
          rating: number
          review_count: number
          price_min: number | null
          price_max: number | null
          age: number | null
          height: number | null
          weight: number | null
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          slug: string
          display_name: string
          bio?: string | null
          category: string
          city: string
          address?: string | null
          whatsapp?: string | null
          instagram?: string | null
          cover_photo?: string | null
          photos?: string[]
          status?: ProviderStatus
          is_verified?: boolean
          is_featured?: boolean
          rating?: number
          review_count?: number
          price_min?: number | null
          price_max?: number | null
          age?: number | null
          height?: number | null
          weight?: number | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          display_name?: string
          bio?: string | null
          category?: string
          city?: string
          address?: string | null
          whatsapp?: string | null
          instagram?: string | null
          cover_photo?: string | null
          photos?: string[]
          status?: ProviderStatus
          is_verified?: boolean
          is_featured?: boolean
          rating?: number
          review_count?: number
          price_min?: number | null
          price_max?: number | null
          age?: number | null
          height?: number | null
          weight?: number | null
          view_count?: number
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          provider_id: string
          name: string
          description: string | null
          price: number
          duration: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          name: string
          description?: string | null
          price: number
          duration?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          price?: number
          duration?: string | null
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          provider_id: string
          user_id: string
          rating: number
          comment: string
          provider_response: string | null
          response_date: string | null
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          user_id: string
          rating: number
          comment: string
          provider_response?: string | null
          response_date?: string | null
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          rating?: number
          comment?: string
          provider_response?: string | null
          response_date?: string | null
          helpful_count?: number
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          provider_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider_id: string
          created_at?: string
        }
        Update: never
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_type: ReportType
          reported_id: string
          reason: string
          description: string | null
          status: ReportStatus
          priority: 'low' | 'medium' | 'high'
          resolved_by: string | null
          resolution_note: string | null
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_type: ReportType
          reported_id: string
          reason: string
          description?: string | null
          status?: ReportStatus
          priority?: 'low' | 'medium' | 'high'
          resolved_by?: string | null
          resolution_note?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          status?: ReportStatus
          priority?: 'low' | 'medium' | 'high'
          resolved_by?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
        }
      }
      site_settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          key: string
          value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          value?: Json
          updated_at?: string
          updated_by?: string | null
        }
      }
      gallery: {
        Row: {
          id: string
          provider_id: string
          type: 'image' | 'video'
          url: string
          thumbnail_url: string | null
          is_cover: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          type: 'image' | 'video'
          url: string
          thumbnail_url?: string | null
          is_cover?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          type?: 'image' | 'video'
          url?: string
          thumbnail_url?: string | null
          is_cover?: boolean
          sort_order?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      provider_status: ProviderStatus
      report_status: ReportStatus
      report_type: ReportType
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Provider = Database['public']['Tables']['providers']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
export type GalleryItem = Database['public']['Tables']['gallery']['Row']

// Extended types with relations
export interface ProviderWithServices extends Provider {
  services: Service[]
}

export interface ProviderWithReviews extends Provider {
  reviews: (Review & { user: Pick<Profile, 'name' | 'avatar_url'> })[]
}

export interface ProviderFull extends Provider {
  services: Service[]
  reviews: (Review & { user: Pick<Profile, 'name' | 'avatar_url'> })[]
  gallery: GalleryItem[]
}

export interface ReviewWithUser extends Review {
  user: Pick<Profile, 'name' | 'avatar_url'>
}

export interface FavoriteWithProvider extends Favorite {
  provider: Provider
}
