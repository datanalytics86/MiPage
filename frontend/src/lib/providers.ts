import type { ProviderCardData, ProviderCategory } from '@/types'
import type { Provider } from '@/types/database'

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600'

export function getProviderImage(provider: {
  cover_photo?: string | null
  photos?: string[] | null
}): string {
  return provider.cover_photo || provider.photos?.[0] || PLACEHOLDER_IMAGE
}

export function normalizeCategory(category: string): ProviderCategory {
  const lower = category.toLowerCase()
  if (lower === 'masajes' || lower === 'modelaje') {
    return lower
  }
  return 'masajes'
}

/** MIP-022: one rule for «Desde $» — price_min, else min active service price. */
export function listingFromPrice(
  priceMin: number | null | undefined,
  servicePrices?: Array<number | null | undefined>
): number | null {
  if (priceMin != null && priceMin > 0) return priceMin
  const positives = (servicePrices || []).filter(
    (p): p is number => typeof p === 'number' && Number.isFinite(p) && p > 0
  )
  if (positives.length === 0) return null
  return Math.min(...positives)
}

export function yearsExperienceFrom(provider: Provider): number | null {
  const raw = provider.metadata?.years_experience
  const n = typeof raw === 'number' ? raw : Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function toProviderCardData(provider: Provider): ProviderCardData {
  return {
    id: provider.id,
    slug: provider.slug,
    display_name: provider.display_name,
    age: provider.age && provider.age > 0 ? provider.age : 0,
    years_experience: yearsExperienceFrom(provider),
    city: provider.city,
    commune: provider.address,
    category: normalizeCategory(provider.category),
    is_verified: provider.is_verified,
    is_featured: provider.is_featured,
    average_rating: Number(provider.rating) || 0,
    review_count: provider.review_count,
    price_from: listingFromPrice(provider.price_min) ?? 0,
    primary_image: getProviderImage(provider),
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}