'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  Heart,
  Shield,
  MapPin,
  Instagram,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, formatPrice, formatDate, getInitials } from '@/lib/utils'
import { useProvider } from '@/hooks/useProviders'

interface ProviderPageProps {
  params: { slug: string }
}

export default function ProviderPage({ params }: ProviderPageProps) {
  const { data: provider, isLoading, isError } = useProvider(params.slug)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  const gallery = useMemo(() => {
    if (!provider) return []

    const fromGallery = (provider.gallery || []).map((item) => ({
      id: item.id,
      url: item.url,
      is_primary: item.is_cover,
    }))

    if (fromGallery.length > 0) {
      return fromGallery
    }

    return (provider.photos || []).map((url, index) => ({
      id: `photo-${index}`,
      url,
      is_primary: index === 0,
    }))
  }, [provider])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Cargando perfil del proveedor...
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError || !provider) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-lg font-semibold">No encontramos este perfil.</p>
            <p className="text-muted-foreground">Puede haber sido despublicado o no está disponible.</p>
            <Button asChild>
              <Link href="/explorar">Volver a explorar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const primaryImage = gallery.find((m) => m.is_primary) || gallery[0]
  const otherImages = gallery.filter((m) => m.id !== primaryImage?.id).slice(0, 4)
  const minPrice = provider.services.length > 0 ? Math.min(...provider.services.map((s) => s.price)) : 0
  const whatsappLink = provider.whatsapp
    ? `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(
        `Hola ${provider.display_name}, vi tu perfil en LuxeServices y me gustaría agendar una cita.`
      )}`
    : null

  return (
    <div className="min-h-screen bg-background">
      <section className="relative">
        <div className="container-luxury py-4">
          <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[480px] rounded-2xl overflow-hidden">
            {primaryImage && (
              <button
                onClick={() => {
                  setCurrentImageIndex(0)
                  setIsGalleryOpen(true)
                }}
                className="col-span-2 row-span-2 relative group"
              >
                <Image
                  src={primaryImage.url}
                  alt={provider.display_name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </button>
            )}

            {otherImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => {
                  setCurrentImageIndex(index + 1)
                  setIsGalleryOpen(true)
                }}
                className="relative group"
              >
                <Image
                  src={image.url}
                  alt={`${provider.display_name} ${index + 2}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {index === 3 && gallery.length > 5 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-semibold">+{gallery.length - 5} fotos</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container-luxury py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-gold/20">
                      <AvatarImage src={provider.cover_photo || undefined} />
                      <AvatarFallback className="bg-gold/10 text-gold-dark font-semibold">
                        {getInitials(provider.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-bold">{provider.display_name}</h1>
                        {provider.is_verified && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-0">
                            <Shield className="w-3 h-3 mr-1" /> Verificada
                          </Badge>
                        )}
                        {provider.is_featured && (
                          <Badge className="bg-gradient-to-r from-gold to-gold-dark text-black border-0">
                            Destacada
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {provider.city}
                        </span>
                        {provider.age ? <span>{provider.age} años</span> : null}
                        <Badge variant="outline" className="capitalize">
                          {provider.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className={cn('rounded-full', isFavorite && 'text-red-500 border-red-200')}
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
                  </Button>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Star className="w-5 h-5 fill-gold text-gold" />
                  <span className="text-xl font-semibold">{provider.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-muted-foreground">({provider.review_count || 0} reseñas)</span>
                </div>

                {provider.bio && <p className="mt-4 text-muted-foreground leading-relaxed">{provider.bio}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Servicios</h2>
                {provider.services.length === 0 ? (
                  <p className="text-muted-foreground">Este proveedor aún no tiene servicios publicados.</p>
                ) : (
                  <div className="space-y-4">
                    {provider.services.map((service) => (
                      <div key={service.id} className="p-4 rounded-xl border border-border bg-card">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">{service.name}</h3>
                            {service.description && (
                              <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                            )}
                            {service.duration && (
                              <span className="inline-flex items-center text-xs text-muted-foreground mt-2">
                                <Clock className="w-3 h-3 mr-1" /> {service.duration}
                              </span>
                            )}
                          </div>
                          <span className="text-lg font-bold text-gold-dark">{formatPrice(service.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Reseñas recientes</h2>
                {provider.reviews.length === 0 ? (
                  <p className="text-muted-foreground">Aún no hay reseñas publicadas.</p>
                ) : (
                  <div className="space-y-4">
                    {provider.reviews.map((review) => (
                      <div key={review.id} className="pb-4 border-b border-border last:border-0">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={review.user?.avatar_url || undefined} />
                              <AvatarFallback>{getInitials(review.user?.name || 'Usuario')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{review.user?.name || 'Usuario verificado'}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  'w-4 h-4',
                                  i < review.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30'
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm mt-2 text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 h-fit">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Desde</p>
                  <p className="text-2xl font-bold text-gold-dark">
                    {minPrice > 0 ? formatPrice(minPrice) : 'Consultar'}
                  </p>
                </div>

                {whatsappLink && (
                  <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-4 h-4 mr-2" /> Contactar por WhatsApp
                    </a>
                  </Button>
                )}

                {provider.instagram && (
                  <Button variant="outline" asChild className="w-full">
                    <a href={`https://instagram.com/${provider.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                      <Instagram className="w-4 h-4 mr-2" /> @{provider.instagram.replace('@', '')}
                    </a>
                  </Button>
                )}

                <div className="pt-2 text-xs text-muted-foreground">
                  {provider.view_count || 0} visitas · Actualizado {formatDate(provider.updated_at)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isGalleryOpen && gallery.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          >
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={() => setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length)}
              className="absolute left-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="relative w-full h-full max-w-5xl max-h-[85vh] mx-20">
              <Image
                src={gallery[currentImageIndex].url}
                alt={`${provider.display_name} ${currentImageIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            <button
              onClick={() => setCurrentImageIndex((prev) => (prev + 1) % gallery.length)}
              className="absolute right-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
