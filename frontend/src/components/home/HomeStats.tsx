'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { formatStatValue, type PublicMarketplaceStats, EMPTY_PUBLIC_STATS } from '@/lib/stats'
import { siteConfig } from '@/lib/site'

async function fetchPublicStats(): Promise<PublicMarketplaceStats> {
  const supabase = getSupabaseClient()

  const [{ count: providerCount }, { data: reviewRows }, { data: cityRows }] =
    await Promise.all([
      supabase
        .from('providers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved'),
      supabase.from('reviews').select('rating'),
      supabase.from('providers').select('city').eq('status', 'approved'),
    ])

  const ratings = (reviewRows || [])
    .map((r) => Number(r.rating))
    .filter((n) => Number.isFinite(n) && n > 0)
  const cities = new Set(
    (cityRows || []).map((r) => (r.city || '').trim()).filter(Boolean)
  )

  return {
    activeProviders: providerCount ?? 0,
    reviews: ratings.length,
    averageRating: ratings.length
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : null,
    cities: cities.size,
  }
}

export function HomeStats() {
  const { data = EMPTY_PUBLIC_STATS } = useQuery({
    queryKey: ['public-marketplace-stats'],
    queryFn: fetchPublicStats,
    enabled: hasSupabaseEnv(),
    staleTime: 60_000,
  })

  const values: Record<string, string> = {
    activeProviders: formatStatValue(data.activeProviders),
    reviews: formatStatValue(data.reviews),
    averageRating: formatStatValue(data.averageRating, { decimals: 1 }),
    cities: formatStatValue(data.cities),
  }

  return (
    <section className="border-y border-border bg-background-secondary/60">
      <div className="container-luxury py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {siteConfig.statLabels.map((stat) => (
            <div key={stat.key} className="text-center">
              <p className="font-display text-3xl md:text-4xl font-semibold text-gold mb-1">
                {values[stat.key] ?? '—'}
              </p>
              <p className="text-sm text-foreground-secondary">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
