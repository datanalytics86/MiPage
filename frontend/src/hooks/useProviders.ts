import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { sanitizePostgrestSearch } from '@/lib/filters'
import { loadPublicAuthors } from '@/lib/publicProfiles'
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

async function bumpViewOnce(
  supabase: { rpc: (fn: string, args: { p_slug: string }) => PromiseLike<unknown> },
  slug: string
) {
  if (typeof window === 'undefined') return
  const key = `mipage:viewed:${slug}`
  try {
    if (window.sessionStorage.getItem(key)) return
    window.sessionStorage.setItem(key, '1')
  } catch {
    return
  }
  await supabase.rpc('increment_provider_view', { p_slug: slug })
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
        const term = sanitizePostgrestSearch(filters.search)
        if (term) {
          query = query.or(`display_name.ilike.%${term}%,bio.ilike.%${term}%`)
        }
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

      const { data: reviewRows } = await supabase
        .from('reviews')
        .select('*')
        .eq('provider_id', provider.id)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(10)

      const authors = await loadPublicAuthors(
        supabase,
        (reviewRows || []).map((review) => review.user_id as string)
      )
      const reviews = (reviewRows || []).map((review) => ({
        ...review,
        user: authors.get(review.user_id) ?? null,
      }))

      // Fetch gallery
      const { data: gallery } = await supabase
        .from('gallery')
        .select('*')
        .eq('provider_id', provider.id)
        .order('sort_order')

      if (provider.status === 'approved') {
        await bumpViewOnce(supabase, slug)
      }

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
      const categories = Array.from(new Set(data.map(p => p.category)))
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
      const cities = Array.from(new Set(data.map(p => p.city)))
      return cities
    },
  })
}
