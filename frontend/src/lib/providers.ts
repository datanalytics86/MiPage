import type { ProviderCardData, ProviderCategory } from '@/types'
import type { Provider } from '@/types/database'

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600'

export function getProviderImage(provider: Provider): string {
  return provider.cover_photo || provider.photos?.[0] || PLACEHOLDER_IMAGE
}

export function normalizeCategory(category: string): ProviderCategory {
  const lower = category.toLowerCase()
  if (lower === 'masajes' || lower === 'modelaje') {
    return lower
  }
  return 'masajes'
}

export function toProviderCardData(provider: Provider): ProviderCardData {
  return {
    id: provider.id,
    slug: provider.slug,
    display_name: provider.display_name,
    age: provider.age ?? 0,
    city: provider.city,
    commune: provider.address,
    category: normalizeCategory(provider.category),
    is_verified: provider.is_verified,
    is_featured: provider.is_featured,
    average_rating: Number(provider.rating) || 0,
    review_count: provider.review_count,
    price_from: provider.price_min ?? 0,
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