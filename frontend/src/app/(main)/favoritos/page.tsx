'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Heart,
  MapPin,
  Star,
  Grid3X3,
  List,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, cn } from '@/lib/utils'

interface FavoriteProvider {
  id: string
  name: string
  slug: string
  category: string
  city: string
  photo: string
  rating: number
  review_count: number
  price_min: number
  is_verified: boolean
  added_at: string
}

// Mock favorites
const mockFavorites: FavoriteProvider[] = [
  {
    id: '1',
    name: 'Valentina Rossi',
    slug: 'valentina-rossi',
    category: 'Masajes',
    city: 'Santiago',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop',
    rating: 4.9,
    review_count: 127,
    price_min: 45000,
    is_verified: true,
    added_at: '2024-12-20T10:00:00Z',
  },
  {
    id: '2',
    name: 'Isabella Montenegro',
    slug: 'isabella-montenegro',
    category: 'Modelaje',
    city: 'Viña del Mar',
    photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop',
    rating: 4.8,
    review_count: 89,
    price_min: 60000,
    is_verified: true,
    added_at: '2024-12-18T14:00:00Z',
  },
  {
    id: '3',
    name: 'Camila Delgado',
    slug: 'camila-delgado',
    category: 'Fotografía',
    city: 'Providencia',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop',
    rating: 5.0,
    review_count: 45,
    price_min: 55000,
    is_verified: false,
    added_at: '2024-12-15T09:00:00Z',
  },
]

export default function FavoritosPage() {
  const [favorites, setFavorites] = useState(mockFavorites)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleRemoveFavorite = (id: string) => {
    setFavorites(favorites.filter(f => f.id !== id))
  }

  return (
    <div className="container-luxury py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Mis Favoritos
          </h1>
          <p className="text-foreground-muted mt-1">
            {favorites.length} {favorites.length === 1 ? 'proveedor guardado' : 'proveedores guardados'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && favorites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {favorites.map((provider) => (
              <motion.div
                key={provider.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group"
              >
                <Card className="overflow-hidden h-full">
                  <div className="relative aspect-[3/4]">
                    <img
                      src={provider.photo}
                      alt={provider.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveFavorite(provider.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-error hover:bg-white transition-colors"
                      title="Quitar de favoritos"
                    >
                      <Heart className="h-5 w-5 fill-current" />
                    </button>

                    {/* Verified badge */}
                    {provider.is_verified && (
                      <Badge className="absolute top-3 left-3 bg-gold text-white">
                        Verificado
                      </Badge>
                    )}

                    {/* Info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <Link href={`/perfil/${provider.slug}`}>
                        <h3 className="font-display text-xl font-semibold hover:text-gold transition-colors">
                          {provider.name}
                        </h3>
                      </Link>
                      <p className="text-white/80 text-sm mb-2">
                        {provider.category}
                      </p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {provider.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-gold fill-gold" />
                          {provider.rating}
                        </span>
                      </div>
                      <p className="mt-2 text-gold font-medium">
                        Desde {formatPrice(provider.price_min)}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && favorites.length > 0 && (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {favorites.map((provider) => (
              <motion.div
                key={provider.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Photo */}
                      <Link href={`/perfil/${provider.slug}`} className="shrink-0">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden">
                          <img
                            src={provider.photo}
                            alt={provider.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link href={`/perfil/${provider.slug}`}>
                              <h3 className="font-display text-lg font-semibold text-foreground hover:text-gold transition-colors">
                                {provider.name}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">{provider.category}</Badge>
                              {provider.is_verified && (
                                <Badge className="bg-gold/10 text-gold">Verificado</Badge>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFavorite(provider.id)}
                            className="p-2 rounded-full hover:bg-error/10 text-error transition-colors"
                            title="Quitar de favoritos"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-foreground-muted">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {provider.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-gold fill-gold" />
                            {provider.rating} ({provider.review_count} reseñas)
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <p className="text-gold font-semibold">
                            Desde {formatPrice(provider.price_min)}
                          </p>
                          <Link href={`/perfil/${provider.slug}`}>
                            <Button variant="outline" size="sm">
                              Ver perfil
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {favorites.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rose/10 flex items-center justify-center">
              <Heart className="h-10 w-10 text-rose" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
              Sin favoritos
            </h2>
            <p className="text-foreground-secondary max-w-md mx-auto mb-6">
              Guarda tus proveedores favoritos para acceder a ellos rápidamente.
              Haz clic en el corazón en cualquier perfil para agregarlo aquí.
            </p>
            <Link href="/explorar">
              <Button>
                Explorar proveedores
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
