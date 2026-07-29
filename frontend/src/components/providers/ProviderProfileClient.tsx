'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Star,
  Heart,
  Shield,
  MapPin,
  Phone,
  Instagram,
  Clock,
  Grid3X3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { PhotoGridSkeleton } from '@/components/ui/Skeleton'
import { PhotoGrid } from '@/components/ui/PhotoGrid'
import { GalleryLightbox } from '@/components/ui/GalleryLightbox'
import { cn, formatPrice, formatDate, getInitials } from '@/lib/utils'
import { useProvider } from '@/hooks/useProviders'
import { useFavorites } from '@/hooks/useFavorites'
import { getProviderImage, normalizeCategory } from '@/lib/providers'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import type { ProviderFull } from '@/types/database'

interface ProfileMedia {
  id: string
  url: string
  is_primary: boolean
}

interface ProfileReview {
  id: string
  rating: number
  content: string
  created_at: string
  provider_response: string | null
  user?: { full_name: string | null; avatar_url: string | null }
}

interface ProfileView {
  id: string
  slug: string
  display_name: string
  bio: string | null
  category: string
  age: number | null
  city: string
  commune: string | null
  address_hint: string | null
  whatsapp: string | null
  instagram: string | null
  height_cm: number | null
  is_verified: boolean
  average_rating: number
  review_count: number
  media: ProfileMedia[]
  services: ProviderFull['services']
  reviews: ProfileReview[]
}

function buildProfileView(data: ProviderFull): ProfileView {
  const galleryMedia: ProfileMedia[] =
    data.gallery?.length > 0
      ? [...data.gallery]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((g, i) => ({
            id: g.id,
            url: g.url,
            is_primary: g.is_cover || i === 0,
          }))
      : (data.photos || []).map((url, i) => ({
          id: `photo-${i}`,
          url,
          is_primary: i === 0,
        }))

  if (galleryMedia.length === 0 && data.cover_photo) {
    galleryMedia.push({ id: 'cover', url: data.cover_photo, is_primary: true })
  }
  if (galleryMedia.length === 0) {
    galleryMedia.push({ id: 'placeholder', url: getProviderImage(data), is_primary: true })
  }

  return {
    id: data.id,
    slug: data.slug,
    display_name: data.display_name,
    bio: data.bio,
    category: normalizeCategory(data.category),
    age: data.age,
    city: data.city,
    commune: data.address,
    address_hint: data.address,
    whatsapp: data.whatsapp,
    instagram: data.instagram,
    height_cm: data.height,
    is_verified: data.is_verified,
    average_rating: Number(data.rating) || 0,
    review_count: data.review_count,
    media: galleryMedia,
    services: data.services || [],
    reviews: (data.reviews || []).map((r) => ({
      id: r.id,
      rating: r.rating,
      content: r.comment,
      created_at: r.created_at,
      provider_response: r.provider_response,
      user: {
        full_name: r.user?.name ?? 'Usuario',
        avatar_url: r.user?.avatar_url ?? null,
      },
    })),
  }
}

export function ProviderProfileClient({ slug }: { slug: string }) {
  const { data, isLoading, error } = useProvider(slug)
  const { isFavorite, toggleFavorite } = useFavorites()
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const provider = useMemo(() => (data ? buildProfileView(data) : null), [data])

  if (!hasSupabaseEnv()) {
    return (
      <EmptyState
        title="Supabase no configurado"
        description="Conecta Supabase para ver perfiles en vivo con fotos optimizadas."
        actionLabel="Volver a explorar"
        actionHref="/explorar"
        className="min-h-[50vh]"
      />
    )
  }

  if (isLoading) {
    return (
      <div className="container-luxury py-8">
        <PhotoGridSkeleton count={5} />
        <div className="mt-8 space-y-3 max-w-xl">
          <div className="h-8 w-64 rounded-xl bg-muted overflow-hidden relative before:absolute before:inset-0 before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent" />
          <div className="h-4 w-full rounded-lg bg-muted overflow-hidden relative before:absolute before:inset-0 before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent" />
          <div className="h-4 w-3/4 rounded-lg bg-muted overflow-hidden relative before:absolute before:inset-0 before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent" />
        </div>
      </div>
    )
  }

  if (error || !provider) {
    return (
      <EmptyState
        title="Perfil no encontrado"
        description="Este profesional no existe o aún no está publicado."
        actionLabel="Explorar profesionales"
        actionHref="/explorar"
        className="min-h-[50vh]"
      />
    )
  }

  const favorited = isFavorite(provider.id)
  const minPrice =
    provider.services.length > 0
      ? Math.min(...provider.services.map((s) => s.price))
      : 0

  const whatsappLink =
    buildWhatsAppLink(provider.whatsapp, provider.display_name, {
      source: 'MiPage',
    }) || '#'

  const galleryPhotos = provider.media.map((m) => ({
    id: m.id,
    url: m.url,
    alt: provider.display_name,
  }))

  return (
    <div className="min-h-screen bg-background">
      <section className="relative">
        <div className="container-luxury py-4">
          <div className="relative rounded-2xl overflow-hidden">
            <PhotoGrid
              photos={galleryPhotos}
              featuredLayout
              priorityCount={1}
              onSelect={(index) => {
                setCurrentImageIndex(index)
                setIsGalleryOpen(true)
              }}
              className="md:min-h-[420px]"
            />
            <button
              type="button"
              onClick={() => {
                setCurrentImageIndex(0)
                setIsGalleryOpen(true)
              }}
              className="absolute bottom-4 right-4 glass-strong text-foreground px-4 py-2 rounded-xl font-medium shadow-soft-lg flex items-center gap-2 hover:bg-white/15 transition-colors z-10"
            >
              <Grid3X3 className="h-4 w-4 text-gold" aria-hidden />
              Ver todas las fotos ({galleryPhotos.length})
            </button>
          </div>
        </div>
      </section>

      <section className="container-luxury py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
                  {provider.display_name}
                </h1>
                {provider.is_verified && (
                  <div className="flex items-center gap-1 text-sage">
                    <Shield className="h-5 w-5" />
                    <span className="text-sm font-medium">Verificada</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-foreground-secondary">
                {provider.age && <span>{provider.age} años</span>}
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {provider.commune ? `${provider.commune}, ` : ''}
                  {provider.city}
                </span>
                <Badge variant={provider.category === 'masajes' ? 'default' : 'secondary'}>
                  {provider.category === 'masajes' ? 'Masajes' : 'Modelaje'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Star className="h-5 w-5 fill-gold text-gold" />
                <span className="font-semibold text-lg">{provider.average_rating.toFixed(1)}</span>
                <span className="text-foreground-secondary">·</span>
                <Link
                  href={`/perfil/${provider.slug}/comentarios`}
                  className="text-foreground-secondary hover:text-gold"
                >
                  {provider.review_count} reseñas
                </Link>
              </div>
            </div>

            <hr className="border-border" />

            {provider.bio && (
              <>
                <div>
                  <h2 className="font-display text-2xl font-semibold mb-4">Sobre mí</h2>
                  <p className="text-foreground-secondary leading-relaxed whitespace-pre-line">
                    {provider.bio}
                  </p>
                </div>
                <hr className="border-border" />
              </>
            )}

            {provider.services.length > 0 && (
              <>
                <div>
                  <h2 className="font-display text-2xl font-semibold mb-4">Servicios</h2>
                  <div className="space-y-4">
                    {provider.services.map((service) => (
                      <Card key={service.id}>
                        <CardContent className="p-4 flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{service.name}</h3>
                            {service.description && (
                              <p className="text-sm text-foreground-secondary mt-1">
                                {service.description}
                              </p>
                            )}
                            {service.duration && (
                              <div className="flex items-center gap-1 text-sm text-foreground-muted mt-2">
                                <Clock className="h-4 w-4" />
                                {service.duration}
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-gold">{formatPrice(service.price)}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                <hr className="border-border" />
              </>
            )}

            {provider.reviews.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-semibold mb-4">Reseñas</h2>
                <div className="space-y-4">
                  {provider.reviews.slice(0, 3).map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <Avatar>
                            <AvatarImage src={review.user?.avatar_url || undefined} />
                            <AvatarFallback>
                              {getInitials(review.user?.full_name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.user?.full_name}</p>
                            <p className="text-sm text-foreground-muted">
                              {formatDate(review.created_at)}
                            </p>
                            <p className="text-foreground-secondary mt-2">{review.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-soft-lg">
                <CardContent className="p-6">
                  {minPrice > 0 && (
                    <p className="text-2xl font-semibold mb-4">
                      Desde {formatPrice(minPrice)}
                    </p>
                  )}
                  {provider.whatsapp && (
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full mb-3" size="lg">
                        <Phone className="h-5 w-5 mr-2" />
                        Contactar por WhatsApp
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => toggleFavorite(provider.id)}
                  >
                    <Heart
                      className={cn('h-5 w-5 mr-2', favorited && 'fill-error text-error')}
                    />
                    {favorited ? 'Guardado' : 'Guardar'}
                  </Button>
                  {provider.instagram && (
                    <a
                      href={`https://instagram.com/${provider.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 mt-6 text-foreground-secondary hover:text-gold"
                    >
                      <Instagram className="h-5 w-5" />@{provider.instagram}
                    </a>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <GalleryLightbox
        photos={provider.media.map((m) => ({
          id: m.id,
          url: m.url,
          alt: provider.display_name,
        }))}
        index={isGalleryOpen ? currentImageIndex : null}
        onClose={() => setIsGalleryOpen(false)}
        onChange={setCurrentImageIndex}
      />
    </div>
  )
}