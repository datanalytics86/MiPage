'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Heart, MapPin, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn, formatPrice } from '@/lib/utils'
import { DARK_BLUR_DATA_URL_CLIENT } from '@/lib/image'
import { useFavorites } from '@/hooks/useFavorites'
import type { ProviderCardData } from '@/types'

interface ProviderCardProps {
  provider: ProviderCardData
  className?: string
  priority?: boolean
}

/** Premium service / provider card — photography-first. */
export function ProviderCard({ provider, className, priority }: ProviderCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(provider.id)

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await toggleFavorite(provider.id)
  }

  return (
    <Link href={`/perfil/${provider.slug}`} className="block h-full">
      <motion.article
        className={cn(
          'group relative h-full bg-card rounded-2xl overflow-hidden',
          'border border-white/[0.06] shadow-soft',
          'hover:border-gold/25 hover:shadow-soft-lg hover:shadow-glow',
          'transition-colors duration-base',
          className
        )}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative aspect-portrait overflow-hidden bg-muted">
          <Image
            src={
              provider.primary_image ||
              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600'
            }
            alt={provider.display_name}
            fill
            className="object-cover transition-transform duration-500 ease-premium group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
            placeholder="blur"
            blurDataURL={DARK_BLUR_DATA_URL_CLIENT}
          />

          <div className="scrim-bottom" />

          {provider.is_featured && (
            <div className="absolute top-3 left-3">
              <Badge variant="gold" className="shadow-gold">
                Destacado
              </Badge>
            </div>
          )}

          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            className={cn(
              'absolute top-3 right-3 p-2.5 rounded-full transition-all duration-fast',
              'glass hover:bg-white/15 active:scale-95',
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
              <h3 className="font-display text-xl font-semibold text-white truncate drop-shadow-sm">
                {provider.display_name}
              </h3>
              {provider.is_verified && (
                <Shield
                  className="h-4.5 w-4.5 text-sage flex-shrink-0 drop-shadow"
                  aria-label="Verificado"
                />
              )}
            </div>

            <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
              <span>{provider.age} años</span>
              <span className="text-white/40">·</span>
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden />
              <span className="truncate">
                {provider.commune ? `${provider.commune}, ` : ''}
                {provider.city}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-gold text-gold" aria-hidden />
              <span className="text-white font-medium">
                {provider.average_rating.toFixed(1)}
              </span>
              <span className="text-white/55 text-sm">
                ({provider.review_count})
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-card/95 border-t border-white/[0.04]">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant={provider.category === 'masajes' ? 'default' : 'secondary'}
            >
              {provider.category === 'masajes' ? 'Masajes' : 'Modelaje'}
            </Badge>
            <p className="text-foreground-secondary text-sm font-medium">
              Desde{' '}
              <span className="text-gold font-semibold">
                {formatPrice(provider.price_from)}
              </span>
            </p>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}

/** Alias for design-system naming (ServiceCard = ProviderCard). */
export const ServiceCard = ProviderCard
