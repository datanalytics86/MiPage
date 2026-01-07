'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Star,
  ChevronLeft,
  ThumbsUp,
  Calendar,
  User,
  MessageSquare,
  Filter,
  SortAsc
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, formatDate } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Review {
  id: string
  client_name: string
  client_avatar?: string
  rating: number
  comment: string
  created_at: string
  provider_response?: string
  response_date?: string
  helpful_count: number
  is_helpful_by_me?: boolean
}

// Extended mock data with more reviews
const mockReviews: Review[] = [
  {
    id: 'r1',
    client_name: 'María González',
    client_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    rating: 5,
    comment: 'Excelente servicio, muy profesional y el ambiente es muy relajante. Definitivamente volveré. El masaje fue increíble y me sentí muy bien atendida desde el momento que llegué.',
    created_at: '2024-12-20T14:30:00Z',
    provider_response: '¡Muchas gracias María! Fue un placer atenderte, te esperamos pronto.',
    response_date: '2024-12-21T10:00:00Z',
    helpful_count: 8,
  },
  {
    id: 'r2',
    client_name: 'Carlos Rodríguez',
    rating: 4,
    comment: 'Muy buen servicio, llegué con mucha tensión y salí renovado. Solo sugeriría un poco más de tiempo para el masaje de espalda.',
    created_at: '2024-12-15T16:00:00Z',
    helpful_count: 3,
  },
  {
    id: 'r3',
    client_name: 'Ana Martínez',
    client_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    rating: 5,
    comment: 'Primera vez que visito y quedé encantada. Ambiente muy elegante y el servicio fue de primera calidad. Las instalaciones son impecables.',
    created_at: '2024-12-10T11:00:00Z',
    provider_response: 'Ana, muchas gracias por tu visita y por tomarte el tiempo de escribir. ¡Nos vemos pronto!',
    response_date: '2024-12-11T09:00:00Z',
    helpful_count: 12,
  },
  {
    id: 'r4',
    client_name: 'Pedro Silva',
    rating: 5,
    comment: 'Increíble experiencia, muy recomendado. Sin duda el mejor servicio que he recibido.',
    created_at: '2024-12-05T18:00:00Z',
    helpful_count: 2,
  },
  {
    id: 'r5',
    client_name: 'Laura Fernández',
    client_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    rating: 5,
    comment: 'Valentina es una profesional excepcional. Me ayudó mucho con mis contracturas y el ambiente es muy tranquilo.',
    created_at: '2024-11-28T13:00:00Z',
    provider_response: 'Gracias Laura, me alegra mucho que te hayas sentido mejor. ¡Hasta pronto!',
    response_date: '2024-11-29T08:00:00Z',
    helpful_count: 6,
  },
  {
    id: 'r6',
    client_name: 'Roberto Sánchez',
    rating: 4,
    comment: 'Buen servicio en general. El lugar es muy limpio y la atención fue cordial.',
    created_at: '2024-11-20T10:00:00Z',
    helpful_count: 1,
  },
  {
    id: 'r7',
    client_name: 'Carmen Díaz',
    rating: 5,
    comment: 'Maravilloso. Salí flotando después del masaje con piedras calientes. 100% recomendado.',
    created_at: '2024-11-15T15:00:00Z',
    helpful_count: 9,
  },
  {
    id: 'r8',
    client_name: 'Diego Muñoz',
    rating: 3,
    comment: 'El servicio estuvo bien, pero tuve que esperar un poco más de lo esperado. Por lo demás, todo correcto.',
    created_at: '2024-11-10T17:00:00Z',
    provider_response: 'Diego, lamento mucho la espera. Estamos trabajando para mejorar la puntualidad. Gracias por tu feedback.',
    response_date: '2024-11-11T09:00:00Z',
    helpful_count: 4,
  },
]

const mockProvider = {
  name: 'Valentina Rossi',
  slug: 'valentina-rossi',
  photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
  rating: 4.9,
  review_count: mockReviews.length,
}

function StarRating({ rating, size = 'sm', interactive = false, onRatingChange }: {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRatingChange?: (rating: number) => void
}) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRatingChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={cn(
            interactive && 'cursor-pointer hover:scale-110 transition-transform'
          )}
        >
          <Star
            className={cn(
              sizes[size],
              (interactive ? hoverRating || rating : rating) >= star
                ? 'text-gold fill-gold'
                : 'text-muted'
            )}
          />
        </button>
      ))}
    </div>
  )
}

function RatingDistribution({ reviews }: { reviews: Review[] }) {
  const distribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100,
  }))

  return (
    <div className="space-y-2">
      {distribution.map(({ rating, count, percentage }) => (
        <div key={rating} className="flex items-center gap-2">
          <span className="text-sm text-foreground-muted w-16 flex items-center gap-1">
            {rating} <Star className="h-3 w-3 text-gold fill-gold" />
          </span>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm text-foreground-secondary w-8 text-right">{count}</span>
        </div>
      ))}
    </div>
  )
}

export default function ComentariosPage() {
  const params = useParams()
  const [reviews, setReviews] = useState(mockReviews)
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent')
  const [filterRating, setFilterRating] = useState<string>('all')

  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(r => filterRating === 'all' || r.rating === parseInt(filterRating))
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'helpful':
          return b.helpful_count - a.helpful_count
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  const handleHelpful = (reviewId: string) => {
    setReviews(reviews.map(r =>
      r.id === reviewId
        ? {
            ...r,
            helpful_count: r.is_helpful_by_me ? r.helpful_count - 1 : r.helpful_count + 1,
            is_helpful_by_me: !r.is_helpful_by_me,
          }
        : r
    ))
  }

  return (
    <div className="container-luxury py-8">
      {/* Back Link */}
      <Link
        href={`/perfil/${params.slug}`}
        className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al perfil
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - Rating Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              {/* Provider Info */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <img
                  src={mockProvider.photo}
                  alt={mockProvider.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    {mockProvider.name}
                  </h2>
                  <p className="text-sm text-foreground-muted">
                    {mockProvider.review_count} reseñas
                  </p>
                </div>
              </div>

              {/* Overall Rating */}
              <div className="text-center mb-6">
                <div className="text-5xl font-display font-semibold text-foreground mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <StarRating rating={Math.round(averageRating)} size="lg" />
                <p className="text-sm text-foreground-muted mt-2">
                  Basado en {reviews.length} reseñas
                </p>
              </div>

              {/* Rating Distribution */}
              <RatingDistribution reviews={reviews} />

              {/* Write Review CTA */}
              <Button className="w-full mt-6">
                <MessageSquare className="h-4 w-4 mr-2" />
                Escribir una reseña
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="font-display text-2xl font-semibold text-foreground">
              Todas las reseñas
            </h1>

            <div className="flex items-center gap-3">
              {/* Filter by rating */}
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="5">5 estrellas</SelectItem>
                  <SelectItem value="4">4 estrellas</SelectItem>
                  <SelectItem value="3">3 estrellas</SelectItem>
                  <SelectItem value="2">2 estrellas</SelectItem>
                  <SelectItem value="1">1 estrella</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort by */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-[160px]">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Más recientes</SelectItem>
                  <SelectItem value="rating">Mayor calificación</SelectItem>
                  <SelectItem value="helpful">Más útiles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reviews */}
          <div className="space-y-4">
            {filteredReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-5">
                    {/* Review Header */}
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={review.client_avatar} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground">{review.client_name}</h4>
                          <div className="flex items-center gap-2 text-sm text-foreground-muted">
                            <Calendar className="h-4 w-4" />
                            {formatDate(review.created_at)}
                          </div>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                    </div>

                    {/* Review Content */}
                    <p className="mt-4 text-foreground-secondary leading-relaxed">
                      {review.comment}
                    </p>

                    {/* Provider Response */}
                    {review.provider_response && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg border-l-2 border-gold">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={mockProvider.photo} />
                              <AvatarFallback>V</AvatarFallback>
                            </Avatar>
                            Respuesta de {mockProvider.name}
                          </span>
                          {review.response_date && (
                            <span className="text-xs text-foreground-muted">
                              {formatDate(review.response_date)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground-secondary">{review.provider_response}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <button
                        onClick={() => handleHelpful(review.id)}
                        className={cn(
                          'flex items-center gap-2 text-sm transition-colors',
                          review.is_helpful_by_me
                            ? 'text-gold'
                            : 'text-foreground-muted hover:text-foreground'
                        )}
                      >
                        <ThumbsUp className={cn(
                          'h-4 w-4',
                          review.is_helpful_by_me && 'fill-current'
                        )} />
                        Útil ({review.helpful_count})
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredReviews.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-foreground-muted mb-4" />
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  Sin reseñas
                </h3>
                <p className="text-foreground-secondary">
                  No hay reseñas con los filtros seleccionados
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
