import { getSupabaseClient } from '@/lib/supabase/client'

export async function syncProviderPriceMin(providerId: string) {
  const supabase = getSupabaseClient()
  const { data: services } = await supabase
    .from('services')
    .select('price')
    .eq('provider_id', providerId)
    .eq('is_active', true)

  const prices = (services || []).map((s) => s.price).filter((p) => p > 0)
  const priceMin = prices.length > 0 ? Math.min(...prices) : null

  await supabase.from('providers').update({ price_min: priceMin }).eq('id', providerId)
}

export async function syncProviderGallery(providerId: string) {
  const supabase = getSupabaseClient()
  const { data: items } = await supabase
    .from('gallery')
    .select('url, is_cover, sort_order')
    .eq('provider_id', providerId)
    .order('sort_order')

  if (!items?.length) return

  const cover = items.find((i) => i.is_cover) || items[0]
  const photos = items.map((i) => i.url)

  await supabase
    .from('providers')
    .update({
      cover_photo: cover.url,
      photos,
    })
    .eq('id', providerId)
}