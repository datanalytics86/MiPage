'use client'

import React from 'react'
import Link from 'next/link'
import { Heart, Sparkles } from 'lucide-react'
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
      <div className="min-h-[70vh] flex flex-col">
        <EmptyState
          icon={Heart}
          title="Tus favoritos te esperan"
          description="Inicia sesión para guardar perfiles y volver a ellos cuando quieras. Un toque al corazón y quedan aquí."
          actionLabel="Iniciar sesión"
          actionHref="/login?redirect=/favoritos"
          className="flex-1"
        >
          <p className="text-sm text-foreground-muted mb-6 max-w-sm">
            También puedes explorar sin cuenta y registrarte cuando encuentres a alguien.
          </p>
          <Button variant="outline" asChild className="mb-2">
            <Link href="/explorar">Explorar sin iniciar sesión</Link>
          </Button>
        </EmptyState>
      </div>
    )
  }

  const items = favorites.filter((f) => f.provider)

  const cards: ProviderCardData[] = items.map((fav) => {
    const p = fav.provider!
    return toProviderCardData(p as Parameters<typeof toProviderCardData>[0])
  })

  return (
    <div className="container-luxury py-8 min-h-[70vh]">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Mis Favoritos
          </h1>
          <p className="text-foreground-muted mt-1">
            {items.length === 0
              ? 'Tu selección personal de profesionales'
              : `${items.length} ${
                  items.length === 1 ? 'profesional guardado' : 'profesionales guardados'
                }`}
          </p>
        </div>
        {cards.length > 0 && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/explorar">Seguir explorando</Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <ProviderGridSkeleton count={6} />
      ) : cards.length === 0 ? (
        <div className="relative rounded-3xl border border-white/[0.06] bg-card/50 overflow-hidden">
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-gold/10 blur-3xl" />
            <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-rose/10 blur-3xl" />
          </div>
          <EmptyState
            icon={Heart}
            title="Tu lista está vacía"
            description="Explora perfiles con fotos de calidad, guarda los que te gusten con el corazón y vuelve aquí para contactarlos cuando quieras."
            actionLabel="Descubrir profesionales"
            actionHref="/explorar"
            className="relative py-20"
          >
            <div className="flex items-center gap-2 text-sm text-gold/90 mb-6">
              <Sparkles className="h-4 w-4" aria-hidden />
              Tip: los destacados suelen tener más reseñas
            </div>
          </EmptyState>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  )
}
