'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, MapPin, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useFavorites } from '@/hooks/useFavorites'
import { useAuth } from '@/contexts/AuthContext'
import { formatPrice } from '@/lib/utils'

export default function FavoritosPage() {
  const { isAuthenticated } = useAuth()
  const { favorites, isLoading, toggleFavorite } = useFavorites()

  if (!isAuthenticated) {
    return (
      <div className="container-luxury py-12">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <h1 className="font-display text-2xl font-semibold">Tus favoritos</h1>
            <p className="text-muted-foreground">Inicia sesión para guardar y gestionar perfiles favoritos.</p>
            <Button asChild>
              <Link href="/login?redirect=/favoritos">Iniciar sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return <div className="container-luxury py-12 text-center text-muted-foreground">Cargando favoritos...</div>
  }

  return (
    <div className="container-luxury py-12 space-y-6">
      <h1 className="font-display text-3xl font-semibold">Mis Favoritos</h1>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            Aún no agregas proveedores a favoritos.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => {
            const provider = favorite.provider
            if (!provider) return null

            return (
              <Card key={favorite.id} className="overflow-hidden">
                <div className="relative h-44 bg-muted">
                  {provider.cover_photo ? (
                    <Image src={provider.cover_photo} alt={provider.display_name} fill className="object-cover" />
                  ) : null}
                  <button
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-red-500"
                    onClick={() => toggleFavorite(provider.id)}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>

                <CardContent className="p-4 space-y-2">
                  <h2 className="font-semibold line-clamp-1">{provider.display_name}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">{provider.bio || 'Sin descripción'}</p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {provider.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-gold fill-gold" /> {provider.rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-gold-dark">
                    {provider.price_min ? `Desde ${formatPrice(provider.price_min)}` : 'Consultar precio'}
                  </p>

                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/perfil/${provider.slug}`}>Ver perfil</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
