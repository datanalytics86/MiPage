import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import type { Provider, ProviderFull, Service, GalleryItem } from '@/types/database'

// Query keys
export const providerKeys = {
  all: ['providers'] as const,
  lists: () => [...providerKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...providerKeys.lists(), filters] as const,
  details: () => [...providerKeys.all, 'detail'] as const,
  detail: (slug: string) => [...providerKeys.details(), slug] as const,
  featured: () => [...providerKeys.all, 'featured'] as const,
}

interface ProvidersFilters {
  category?: string
  city?: string
  is_verified?: boolean
  search?: string
  sort?: 'rating' | 'price_low' | 'price_high' | 'newest'
  limit?: number
  offset?: number
}

export interface ProvidersListResult {
  items: Provider[]
  total: number
}

// Fetch providers list
export function useProviders(filters: ProvidersFilters = {}) {
  const supabase = getSupabaseClient()

  return useQuery({
    queryKey: providerKeys.list(filters),
    enabled: hasSupabaseEnv(),
    queryFn: async (): Promise<ProvidersListResult> => {
      let query = supabase
        .from('providers')
        .select('*', { count: 'exact' })
        .eq('status', 'approved')

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.city) {
        query = query.eq('city', filters.city)
      }
      if (filters.is_verified !== undefined) {
        query = query.eq('is_verified', filters.is_verified)
      }
      if (filters.search) {
        query = query.or(`display_name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`)
      }

      // Apply sorting
      switch (filters.sort) {
        case 'rating':
          query = query.order('rating', { ascending: false })
          break
        case 'price_low':
          query = query.order('price_min', { ascending: true, nullsFirst: false })
          break
        case 'price_high':
          query = query.order('price_min', { ascending: false })
          break
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        default:
          query = query.order('is_featured', { ascending: false }).order('rating', { ascending: false })
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit)
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { items: (data || []) as Provider[], total: count ?? 0 }
    },
  })
}

// Fetch featured providers
export function useFeaturedProviders(limit = 8) {
  const supabase = getSupabaseClient()

  return useQuery({
    queryKey: providerKeys.featured(),
    enabled: hasSupabaseEnv(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('status', 'approved')
        .eq('is_featured', true)
        .order('rating', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data as Provider[]
    },
  })
}

// Fetch single provider by slug
export function useProvider(slug: string) {
  const supabase = getSupabaseClient()

  return useQuery({
    queryKey: providerKeys.detail(slug),
    enabled: hasSupabaseEnv() && !!slug,
    queryFn: async () => {
      // Fetch provider
      const { data: provider, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('slug', slug)
        .single()

      if (providerError) throw providerError

      // Fetch services
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', provider.id)
        .eq('is_active', true)
        .order('sort_order')

      // Fetch reviews with user info
      const { data: reviews } = await supabase
        .from('reviews')
        .select(`
          *,
          user:profiles!reviews_user_id_fkey (name, avatar_url)
        `)
        .eq('provider_id', provider.id)
        .order('created_at', { ascending: false })
        .limit(10)

      // Fetch gallery
      const { data: gallery } = await supabase
        .from('gallery')
        .select('*')
        .eq('provider_id', provider.id)
        .order('sort_order')

      // Increment view count
      await supabase
        .from('providers')
        .update({ view_count: provider.view_count + 1 })
        .eq('id', provider.id)

      return {
        ...provider,
        services: services || [],
        reviews: reviews || [],
        gallery: gallery || [],
      } as ProviderFull
    },
  })
}

export function useUpdateOwnProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Record<string, unknown>
    }) => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('providers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Provider
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: providerKeys.detail(data.slug) })
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() })
    },
  })
}

// Get unique categories
export function useCategories() {
  const supabase = getSupabaseClient()

  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('providers')
        .select('category')
        .eq('status', 'approved')

      if (error) throw error

      // Get unique categories
      const categories = [...new Set(data.map(p => p.category))]
      return categories
    },
  })
}

// Get unique cities
export function useCities() {
  const supabase = getSupabaseClient()

  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('providers')
        .select('city')
        .eq('status', 'approved')

      if (error) throw error

      // Get unique cities
      const cities = [...new Set(data.map(p => p.city))]
      return cities
    },
  })
}
