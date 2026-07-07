'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Heart, MapPin, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn, formatPrice } from '@/lib/utils'
import { useFavorites } from '@/hooks/useFavorites'
import type { ProviderCardData } from '@/types'

interface ProviderCardProps {
  provider: ProviderCardData
  className?: string
}

export function ProviderCard({ provider, className }: ProviderCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(provider.id)

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await toggleFavorite(provider.id)
  }

  return (
    <Link href={`/perfil/${provider.slug}`}>
      <motion.article
        className={cn(
          'group relative bg-card rounded-2xl overflow-hidden shadow-soft',
          'hover:shadow-soft-lg transition-all duration-300',
          className
        )}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative aspect-portrait overflow-hidden">
          <Image
            src={provider.primary_image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600'}
            alt={provider.display_name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {provider.is_featured && (
            <div className="absolute top-3 left-3">
              <Badge variant="gold" className="shadow-lg">
                Destacado
              </Badge>
            </div>
          )}

          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            className={cn(
              'absolute top-3 right-3 p-2 rounded-full transition-all duration-200',
              'bg-white/20 backdrop-blur-sm hover:bg-white/40',
              favorited && 'bg-white/90 hover:bg-white'
            )}
          >
            <Heart
              className={cn(
                'h-5 w-5 transition-colors',
                favorited ? 'fill-error text-error' : 'text-white'
              )}
            />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display text-xl font-semibold text-white truncate">
                {provider.display_name}
              </h3>
              {provider.is_verified && (
                <Shield className="h-5 w-5 text-sage flex-shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
              <span>{provider.age} años</span>
              <span>·</span>
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">
                {provider.commune ? `${provider.commune}, ` : ''}{provider.city}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-gold text-gold" />
              <span className="text-white font-medium">
                {provider.average_rating.toFixed(1)}
              </span>
              <span className="text-white/60 text-sm">
                ({provider.review_count})
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-card">
          <div className="flex items-center justify-between">
            <Badge variant={provider.category === 'masajes' ? 'default' : 'secondary'}>
              {provider.category === 'masajes' ? 'Masajes' : 'Modelaje'}
            </Badge>
            <p className="text-foreground font-medium">
              Desde <span className="text-gold">{formatPrice(provider.price_from)}</span>
            </p>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}