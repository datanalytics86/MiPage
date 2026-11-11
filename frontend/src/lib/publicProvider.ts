import { cache } from 'react'
import { createClient } from '@supabase/supabase-js'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { loadPublicAuthors } from '@/lib/publicProfiles'
import type { GalleryItem, ProviderFull, Service } from '@/types/database'

export const loadApprovedProvider = cache(async (slug: string): Promise<ProviderFull | null> => {
  if (!hasSupabaseEnv() || !slug || slug.length > 160) return null
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: provider, error } = await supabase
    .from('providers')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'approved')
    .maybeSingle()

  if (error || !provider) return null

  const [{ data: services }, { data: gallery }, { data: reviewRows }] = await Promise.all([
    supabase.from('services').select('*').eq('provider_id', provider.id).eq('is_active', true).order('sort_order'),
    supabase.from('gallery').select('*').eq('provider_id', provider.id).order('sort_order'),
    supabase
      .from('reviews')
      .select('*')
      .eq('provider_id', provider.id)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const authors = await loadPublicAuthors(
    supabase,
    (reviewRows || []).map((review) => review.user_id as string)
  )
  const reviews = (reviewRows || []).map((review) => ({
    ...review,
    user: authors.get(review.user_id as string) ?? null,
  }))

  return {
    ...provider,
    services: (services || []) as Service[],
    gallery: (gallery || []) as GalleryItem[],
    reviews,
  } as ProviderFull
})
