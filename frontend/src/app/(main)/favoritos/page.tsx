'use client'

import React from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProviderCard } from '@/components/providers/ProviderCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProviderGridSkeleton } from '@/components/ui/Skeleton'
import { useFavorites } from '@/hooks/useFavorites'
import { useAuth } from '@/contexts/AuthContext'
import { toProviderCardData } from '@/lib/providers'
import type { ProviderCardData } from '@/types'

export default function FavoritosPage() {
  const { isAuthenticated } = useAuth()
  const { favorites, isLoading } = useFavorites()

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={Heart}
        title="Inicia sesión"
        description="Debes iniciar sesión para ver y gestionar tus favoritos."
        actionLabel="Iniciar sesión"
        actionHref="/login?redirect=/favoritos"
        className="min-h-[60vh]"
      />
    )
  }

  const items = favorites.filter((f) => f.provider)

  const cards: ProviderCardData[] = items.map((fav) => {
    const p = fav.provider!
    return toProviderCardData(p as Parameters<typeof toProviderCardData>[0])
  })

  return (
    <div className="container-luxury py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-foreground">Mis Favoritos</h1>
        <p className="text-foreground-muted mt-1">
          {items.length}{' '}
          {items.length === 1 ? 'profesional guardado' : 'profesionales guardados'}
        </p>
      </div>

      {isLoading ? (
        <ProviderGridSkeleton count={6} />
      ) : cards.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Aún no tienes favoritos"
          description="Explora perfiles y toca el corazón para guardar profesionales aquí."
          actionLabel="Explorar profesionales"
          actionHref="/explorar"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}

      {cards.length > 0 && (
        <div className="mt-10 text-center">
          <Button variant="outline" asChild>
            <Link href="/explorar">Seguir explorando</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
