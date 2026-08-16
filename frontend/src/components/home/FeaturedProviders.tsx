'use client'

import { ProviderCard } from '@/components/providers/ProviderCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProviderGridSkeleton } from '@/components/ui/Skeleton'
import { useFeaturedProviders } from '@/hooks/useProviders'
import { featuredProviders as mockFeatured } from '@/lib/mockProviders'
import { toProviderCardData } from '@/lib/providers'
import { allowMockCatalog } from '@/lib/supabase/env'
import { Sparkles } from 'lucide-react'

export function FeaturedProviders() {
  const { data: featuredDb = [], isLoading } = useFeaturedProviders(4)
  const useMock = allowMockCatalog()

  if (!useMock && isLoading) {
    return <ProviderGridSkeleton count={4} />
  }

  const displayProviders = useMock
    ? mockFeatured.slice(0, 4)
    : featuredDb.map(toProviderCardData)

  if (displayProviders.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Aún no hay perfiles destacados"
        description="Los Destacados los marca un administrador (o un pago cuando Mercado Pago está activo). Mientras tanto, explora el catálogo completo."
        actionLabel="Ver todos"
        actionHref="/explorar"
        className="py-10"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayProviders.map((provider, index) => (
        <ProviderCard key={provider.id} provider={provider} priority={index < 2} />
      ))}
    </div>
  )
}
