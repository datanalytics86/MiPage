'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  Heart,
  Shield,
  MapPin,
  Phone,
  Instagram,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Flag,
  MessageCircle,
  Share2,
  Grid3X3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, formatPrice, formatDate, getInitials } from '@/lib/utils'
import type { Provider, Service, Review, Media } from '@/types'

// Mock data for a provider
const mockProvider: Provider & {
  services: Service[]
  media: Media[]
  reviews: Review[]
  average_rating: number
  review_count: number
} = {
  id: '1',
  user_id: 'user-1',
  display_name: 'Valentina Reyes',
  slug: 'valentina-reyes',
  bio: 'Terapeuta certificada con más de 5 años de experiencia en masajes relajantes y descontracturantes. Mi objetivo es brindarte un espacio de paz y bienestar donde puedas desconectarte del estrés diario. Trabajo con aceites esenciales y técnicas especializadas para lograr una experiencia única.',
  category: 'masajes',
  age: 28,
  city: 'Santiago',
  commune: 'Las Condes',
  address_hint: 'Sector El Golf',
  whatsapp: '56912345678',
  instagram: 'valentina.wellness',
  height_cm: 165,
  weight_kg: 58,
  measurements: null,
  status: 'active',
  is_verified: true,
  is_featured: true,
  views_count: 1250,
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-12-01T00:00:00Z',
  average_rating: 4.9,
  review_count: 47,
  services: [
    {
      id: 's1',
      provider_id: '1',
      name: 'Masaje Relajante',
      description: 'Masaje corporal completo con aceites esenciales. Ideal para liberar tensiones y mejorar el bienestar general.',
      price: 45000,
      duration: '60 min',
      is_active: true,
      sort_order: 0,
      created_at: '2024-01-15T00:00:00Z',
    },
    {
      id: 's2',
      provider_id: '1',
      name: 'Masaje Descontracturante',
      description: 'Enfocado en zonas de tensión muscular. Perfecto para dolores de espalda, cuello y hombros.',
      price: 55000,
      duration: '60 min',
      is_active: true,
      sort_order: 1,
      created_at: '2024-01-15T00:00:00Z',
    },
    {
      id: 's3',
      provider_id: '1',
      name: 'Masaje con Piedras Calientes',
      description: 'Experiencia premium con piedras volcánicas calientes. Profunda relajación muscular.',
      price: 70000,
      duration: '90 min',
      is_active: true,
      sort_order: 2,
      created_at: '2024-01-15T00:00:00Z',
    },
  ],
  media: [
    { id: 'm1', provider_id: '1', type: 'image', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800', thumbnail_url: null, is_primary: true, is_approved: true, sort_order: 0, created_at: '2024-01-15T00:00:00Z' },
    { id: 'm2', provider_id: '1', type: 'image', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800', thumbnail_url: null, is_primary: false, is_approved: true, sort_order: 1, created_at: '2024-01-15T00:00:00Z' },
    { id: 'm3', provider_id: '1', type: 'image', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800', thumbnail_url: null, is_primary: false, is_approved: true, sort_order: 2, created_at: '2024-01-15T00:00:00Z' },
    { id: 'm4', provider_id: '1', type: 'image', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800', thumbnail_url: null, is_primary: false, is_approved: true, sort_order: 3, created_at: '2024-01-15T00:00:00Z' },
    { id: 'm5', provider_id: '1', type: 'image', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800', thumbnail_url: null, is_primary: false, is_approved: true, sort_order: 4, created_at: '2024-01-15T00:00:00Z' },
  ],
  reviews: [
    {
      id: 'r1',
      provider_id: '1',
      user_id: 'u1',
      rating: 5,
      title: 'Excelente experiencia',
      content: 'El mejor masaje que he tenido. Valentina es muy profesional y el ambiente es súper relajante. Salí como nuevo, definitivamente volveré.',
      is_approved: true,
      provider_response: '¡Muchas gracias Carlos! Me alegra mucho que hayas disfrutado. ¡Te espero pronto!',
      response_at: '2024-12-10T00:00:00Z',
      created_at: '2024-12-08T00:00:00Z',
      user: { id: 'u1', full_name: 'Carlos Mendoza', avatar_url: null },
    },
    {
      id: 'r2',
      provider_id: '1',
      user_id: 'u2',
      rating: 5,
      title: 'Muy recomendada',
      content: 'Ambiente muy agradable y profesional. El masaje descontracturante fue exactamente lo que necesitaba para mi espalda.',
      is_approved: true,
      provider_response: null,
      response_at: null,
      created_at: '2024-12-05T00:00:00Z',
      user: { id: 'u2', full_name: 'Andrea Pizarro', avatar_url: null },
    },
    {
      id: 'r3',
      provider_id: '1',
      user_id: 'u3',
      rating: 4,
      title: 'Buena experiencia',
      content: 'Muy buen servicio, puntual y profesional. El único detalle es que el lugar es un poco difícil de encontrar.',
      is_approved: true,
      provider_response: null,
      response_at: null,
      created_at: '2024-11-28T00:00:00Z',
      user: { id: 'u3', full_name: 'Miguel Torres', avatar_url: null },
    },
  ],
}

interface ProviderPageProps {
  params: { slug: string }
}

export default function ProviderPage({ params }: ProviderPageProps) {
  const provider = mockProvider // TODO: Fetch from API
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  const primaryImage = provider.media.find((m) => m.is_primary) || provider.media[0]
  const otherImages = provider.media.filter((m) => m.id !== primaryImage?.id).slice(0, 4)
  const minPrice = Math.min(...provider.services.map((s) => s.price))

  const whatsappLink = `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(
    `Hola ${provider.display_name}, vi tu perfil en LuxeServices y me gustaría agendar una cita.`
  )}`

  return (
    <div className="min-h-screen bg-background">
      {/* Gallery Section */}
      <section className="relative">
        <div className="container-luxury py-4">
          {/* Desktop Gallery Grid */}
          <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[480px] rounded-2xl overflow-hidden">
            {/* Main Image */}
            <div
              className="col-span-2 row-span-2 relative cursor-pointer group"
              onClick={() => {
                setCurrentImageIndex(0)
                setIsGalleryOpen(true)
              }}
            >
              <Image
                src={primaryImage?.url || ''}
                alt={provider.display_name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>

            {/* Other Images */}
            {otherImages.map((media, index) => (
              <div
                key={media.id}
                className="relative cursor-pointer group"
                onClick={() => {
                  setCurrentImageIndex(index + 1)
                  setIsGalleryOpen(true)
                }}
              >
                <Image
                  src={media.url}
                  alt={`${provider.display_name} - ${index + 2}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                {index === 3 && provider.media.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-medium text-lg">
                      +{provider.media.length - 5} más
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Show All Button */}
            <button
              onClick={() => setIsGalleryOpen(true)}
              className="absolute bottom-4 right-4 bg-white text-foreground px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              Ver todas las fotos
            </button>
          </div>

          {/* Mobile Gallery */}
          <div className="md:hidden relative h-[400px] rounded-2xl overflow-hidden">
            <Image
              src={primaryImage?.url || ''}
              alt={provider.display_name}
              fill
              className="object-cover"
              priority
            />
            <button
              onClick={() => setIsGalleryOpen(true)}
              className="absolute bottom-4 right-4 bg-white text-foreground px-4 py-2 rounded-lg font-medium shadow-lg flex items-center gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              {provider.media.length} fotos
            </button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container-luxury py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
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
                    <span>{provider.age} años</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {provider.commune}, {provider.city}
                    </span>
                    <Badge variant={provider.category === 'masajes' ? 'default' : 'secondary'}>
                      {provider.category === 'masajes' ? 'Masajes' : 'Modelaje'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-gold text-gold" />
                  <span className="font-semibold text-lg">{provider.average_rating.toFixed(1)}</span>
                </div>
                <span className="text-foreground-secondary">·</span>
                <Link href={`/perfil/${provider.slug}/comentarios`} className="text-foreground-secondary hover:text-gold transition-colors">
                  {provider.review_count} reseñas
                </Link>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-border" />

            {/* About */}
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
                Sobre mí
              </h2>
              <p className="text-foreground-secondary leading-relaxed whitespace-pre-line">
                {provider.bio}
              </p>
            </div>

            {/* Divider */}
            <hr className="border-border" />

            {/* Services */}
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
                Servicios
              </h2>
              <div className="space-y-4">
                {provider.services.map((service) => (
                  <Card key={service.id} className="hover:shadow-soft-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">
                            {service.name}
                          </h3>
                          {service.description && (
                            <p className="text-sm text-foreground-secondary mb-2">
                              {service.description}
                            </p>
                          )}
                          {service.duration && (
                            <div className="flex items-center gap-1 text-sm text-foreground-muted">
                              <Clock className="h-4 w-4" />
                              {service.duration}
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-gold text-lg ml-4">
                          {formatPrice(service.price)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Divider */}
            <hr className="border-border" />

            {/* Details */}
            {(provider.height_cm || provider.address_hint) && (
              <>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
                    Detalles
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {provider.height_cm && (
                      <div>
                        <span className="text-foreground-muted text-sm">Altura</span>
                        <p className="text-foreground font-medium">{provider.height_cm} cm</p>
                      </div>
                    )}
                    {provider.address_hint && (
                      <div>
                        <span className="text-foreground-muted text-sm">Ubicación</span>
                        <p className="text-foreground font-medium">{provider.address_hint}</p>
                      </div>
                    )}
                  </div>
                </div>
                <hr className="border-border" />
              </>
            )}

            {/* Reviews Preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-6 w-6 fill-gold text-gold" />
                  <span className="font-display text-2xl font-semibold">
                    {provider.average_rating.toFixed(1)}
                  </span>
                  <span className="text-foreground-secondary">·</span>
                  <span className="text-foreground-secondary">
                    {provider.review_count} reseñas
                  </span>
                </div>
                <Link href={`/perfil/${provider.slug}/comentarios`}>
                  <Button variant="ghost">Ver todas →</Button>
                </Link>
              </div>

              <div className="space-y-4">
                {provider.reviews.slice(0, 3).map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={review.user?.avatar_url || undefined} />
                          <AvatarFallback>
                            {getInitials(review.user?.full_name || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">
                              {review.user?.full_name}
                            </span>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    'h-4 w-4',
                                    i < review.rating
                                      ? 'fill-gold text-gold'
                                      : 'fill-muted text-muted'
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-foreground-muted mb-2">
                            {formatDate(review.created_at)}
                          </p>
                          <p className="text-foreground-secondary">{review.content}</p>
                          {review.provider_response && (
                            <div className="mt-3 pl-4 border-l-2 border-gold/30">
                              <p className="text-sm text-foreground-muted mb-1">
                                Respuesta de {provider.display_name}
                              </p>
                              <p className="text-sm text-foreground-secondary">
                                {review.provider_response}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Write Review Button */}
              <div className="mt-6">
                <Button variant="outline" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Escribir una reseña
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar - Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-soft-lg">
                <CardContent className="p-6">
                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-2xl font-semibold text-foreground">
                      Desde {formatPrice(minPrice)}
                    </span>
                    <span className="text-foreground-secondary">/hora</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-6">
                    <Star className="h-5 w-5 fill-gold text-gold" />
                    <span className="font-medium">{provider.average_rating.toFixed(1)}</span>
                    <span className="text-foreground-secondary">·</span>
                    <span className="text-foreground-secondary">{provider.review_count} reseñas</span>
                  </div>

                  {/* Contact Button */}
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full mb-3" size="lg">
                      <Phone className="h-5 w-5 mr-2" />
                      Contactar por WhatsApp
                    </Button>
                  </a>

                  {/* Secondary Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsFavorite(!isFavorite)}
                    >
                      <Heart
                        className={cn(
                          'h-5 w-5 mr-2',
                          isFavorite && 'fill-error text-error'
                        )}
                      />
                      {isFavorite ? 'Guardado' : 'Guardar'}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Report */}
                  <button className="w-full mt-4 text-sm text-foreground-muted hover:text-error transition-colors flex items-center justify-center gap-1">
                    <Flag className="h-4 w-4" />
                    Reportar perfil
                  </button>

                  {/* Instagram */}
                  {provider.instagram && (
                    <div className="mt-6 pt-4 border-t border-border">
                      <a
                        href={`https://instagram.com/${provider.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-foreground-secondary hover:text-gold transition-colors"
                      >
                        <Instagram className="h-5 w-5" />
                        @{provider.instagram}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Gallery */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-10 text-white font-medium">
              {currentImageIndex + 1} / {provider.media.length}
            </div>

            {/* Main Image */}
            <div className="h-full flex items-center justify-center p-16">
              <Image
                src={provider.media[currentImageIndex].url}
                alt={`${provider.display_name} - ${currentImageIndex + 1}`}
                width={1200}
                height={800}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Navigation */}
            {currentImageIndex > 0 && (
              <button
                onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronLeft className="h-10 w-10" />
              </button>
            )}
            {currentImageIndex < provider.media.length - 1 && (
              <button
                onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronRight className="h-10 w-10" />
              </button>
            )}

            {/* Thumbnails */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4">
              {provider.media.map((media, index) => (
                <button
                  key={media.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all',
                    index === currentImageIndex
                      ? 'ring-2 ring-white opacity-100'
                      : 'opacity-50 hover:opacity-75'
                  )}
                >
                  <Image
                    src={media.url}
                    alt=""
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
