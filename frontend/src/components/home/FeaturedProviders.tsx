'use client'

import { ProviderCard } from '@/components/providers/ProviderCard'
import { useFeaturedProviders } from '@/hooks/useProviders'
import { featuredProviders as mockFeatured } from '@/lib/mockProviders'
import { toProviderCardData } from '@/lib/providers'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import type { ProviderCardData } from '@/types'

export function FeaturedProviders({
  fallback = mockFeatured,
}: {
  fallback?: ProviderCardData[]
}) {
  const { data: featuredDb = [] } = useFeaturedProviders(4)

  const displayProviders =
    hasSupabaseEnv() && featuredDb.length > 0
      ? featuredDb.map(toProviderCardData)
      : fallback

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayProviders.map((provider, index) => (
        <ProviderCard key={provider.id} provider={provider} priority={index < 2} />
      ))}
    </div>
  )
}
