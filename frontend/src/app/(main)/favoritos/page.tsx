'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MapPin, Star, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { useFavorites } from '@/hooks/useFavorites'
import { useAuth } from '@/contexts/AuthContext'
import { getProviderImage, normalizeCategory } from '@/lib/providers'

export default function FavoritosPage() {
  const { isAuthenticated } = useAuth()
  const { favorites, isLoading, toggleFavorite } = useFavorites()

  if (!isAuthenticated) {
    return (
      <div className="container-luxury py-16 text-center">
        <Heart className="h-12 w-12 mx-auto text-foreground-muted mb-4" />
        <h1 className="font-display text-2xl font-semibold mb-2">Inicia sesión</h1>
        <p className="text-foreground-secondary mb-6">
          Debes iniciar sesión para ver tus favoritos
        </p>
        <Link href="/login?redirect=/favoritos">
          <Button>Iniciar sesión</Button>
        </Link>
      </div>
    )
  }

  const items = favorites.filter((f) => f.provider)

  return (
    <div className="container-luxury py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold">Mis Favoritos</h1>
        <p className="text-foreground-muted mt-1">
          {items.length} {items.length === 1 ? 'profesional guardado' : 'profesionales guardados'}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Heart className="h-12 w-12 mx-auto text-foreground-muted mb-4" />
            <p className="text-foreground-secondary mb-4">Aún no has guardado ningún profesional</p>
            <Link href="/explorar">
              <Button>Explorar profesionales</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((fav) => {
            const p = fav.provider!
            const category = normalizeCategory(p.category)
            return (
              <Card key={fav.id} className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={getProviderImage(p)}
                    alt={p.display_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{p.display_name}</h3>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(p.id)}
                      className="text-error"
                    >
                      <Heart className="h-5 w-5 fill-error" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground-secondary mb-2">
                    <MapPin className="h-3 w-3" />
                    {p.city}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-gold text-gold" />
                      <span className="text-sm">{Number(p.rating).toFixed(1)}</span>
                    </div>
                    <Badge>{category === 'masajes' ? 'Masajes' : 'Modelaje'}</Badge>
                  </div>
                  {p.price_min && (
                    <p className="text-sm mt-2">
                      Desde <span className="text-gold font-medium">{formatPrice(p.price_min)}</span>
                    </p>
                  )}
                  <Link href={`/perfil/${p.slug}`} className="block mt-4">
                    <Button variant="outline" className="w-full">
                      Ver perfil
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}