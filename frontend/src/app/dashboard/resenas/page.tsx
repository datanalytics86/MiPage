'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  MessageSquare,
  Send,
  ThumbsUp,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, formatDate } from '@/lib/utils'

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
}

// Mock reviews data
const mockReviews: Review[] = [
  {
    id: 'r1',
    client_name: 'María González',
    client_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    rating: 5,
    comment: 'Excelente servicio, muy profesional y el ambiente es muy relajante. Definitivamente volveré. El masaje fue increíble y me sentí muy bien atendida.',
    created_at: '2024-12-20T14:30:00Z',
    provider_response: '¡Muchas gracias María! Fue un placer atenderte, te esperamos pronto.',
    response_date: '2024-12-21T10:00:00Z',
    helpful_count: 3,
  },
  {
    id: 'r2',
    client_name: 'Carlos Rodríguez',
    rating: 4,
    comment: 'Muy buen servicio, llegué con mucha tensión y salí renovado. Solo sugeriría un poco más de tiempo para el masaje.',
    created_at: '2024-12-15T16:00:00Z',
    helpful_count: 1,
  },
  {
    id: 'r3',
    client_name: 'Ana Martínez',
    client_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    rating: 5,
    comment: 'Primera vez que visito y quedé encantada. Ambiente muy elegante y el servicio fue de primera calidad.',
    created_at: '2024-12-10T11:00:00Z',
    provider_response: 'Ana, muchas gracias por tu visita y por tomarte el tiempo de escribir. ¡Nos vemos pronto!',
    response_date: '2024-12-11T09:00:00Z',
    helpful_count: 5,
  },
  {
    id: 'r4',
    client_name: 'Pedro Silva',
    rating: 5,
    comment: 'Increíble experiencia, muy recomendado.',
    created_at: '2024-12-05T18:00:00Z',
    helpful_count: 0,
  },
]

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
  }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizes[size],
            star <= rating ? 'text-gold fill-gold' : 'text-muted'
          )}
        />
      ))}
    </div>
  )
}

export default function DashboardResenasPage() {
  const [reviews, setReviews] = useState(mockReviews)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'pending' | 'responded'>('all')

  // Calculate stats
  const totalReviews = reviews.length
  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
  const pendingResponses = reviews.filter(r => !r.provider_response).length
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / totalReviews) * 100,
  }))

  const filteredReviews = reviews.filter(r => {
    if (filter === 'pending') return !r.provider_response
    if (filter === 'responded') return !!r.provider_response
    return true
  })

  const handleSubmitReply = (reviewId: string) => {
    if (!replyText.trim()) return

    setReviews(reviews.map(r =>
      r.id === reviewId
        ? {
            ...r,
            provider_response: replyText,
            response_date: new Date().toISOString(),
          }
        : r
    ))
    setReplyText('')
    setReplyingTo(null)
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedReviews)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedReviews(newExpanded)
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Mis Reseñas
        </h2>
        <p className="text-foreground-muted mt-1">
          Gestiona las reseñas de tus clientes
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Calificación promedio</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-semibold text-foreground">
                    {averageRating.toFixed(1)}
                  </span>
                  <StarRating rating={Math.round(averageRating)} size="md" />
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-gold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Total de reseñas</p>
                <p className="text-2xl font-semibold text-foreground mt-1">{totalReviews}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-sage" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Sin responder</p>
                <p className="text-2xl font-semibold text-foreground mt-1">{pendingResponses}</p>
              </div>
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                pendingResponses > 0 ? 'bg-warning/10' : 'bg-success/10'
              )}>
                <Send className={cn(
                  'h-6 w-6',
                  pendingResponses > 0 ? 'text-warning' : 'text-success'
                )} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-foreground mb-4">Distribución de calificaciones</h3>
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm text-foreground-muted w-12">{rating} stars</span>
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
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-foreground-muted" />
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'Todas' },
            { value: 'pending', label: 'Sin responder' },
            { value: 'responded', label: 'Respondidas' },
          ].map(({ value, label }) => (
            <Button
              key={value}
              variant={filter === value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(value as typeof filter)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <motion.div
            key={review.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-4">
                {/* Review Header */}
                <div className="flex items-start gap-3">
                  <Avatar>
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
                <p className="mt-3 text-foreground-secondary">{review.comment}</p>

                {/* Helpful count */}
                {review.helpful_count > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-sm text-foreground-muted">
                    <ThumbsUp className="h-4 w-4" />
                    {review.helpful_count} personas encontraron útil esta reseña
                  </div>
                )}

                {/* Provider Response */}
                {review.provider_response && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg border-l-2 border-gold">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Tu respuesta</span>
                      {review.response_date && (
                        <span className="text-xs text-foreground-muted">
                          {formatDate(review.response_date)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground-secondary">{review.provider_response}</p>
                  </div>
                )}

                {/* Reply Form */}
                <AnimatePresence>
                  {replyingTo === review.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4"
                    >
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="input-luxury resize-none w-full"
                        rows={3}
                        placeholder="Escribe tu respuesta..."
                        autoFocus
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(review.id)}
                          disabled={!replyText.trim()}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Enviar respuesta
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyText('')
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                {!review.provider_response && replyingTo !== review.id && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReplyingTo(review.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Responder
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReviews.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-foreground-muted" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              {filter === 'pending' ? 'Sin reseñas pendientes' :
               filter === 'responded' ? 'Sin reseñas respondidas' :
               'Sin reseñas'}
            </h3>
            <p className="text-foreground-secondary">
              {filter === 'all'
                ? 'Aún no tienes reseñas. ¡Comparte tu perfil para obtener tus primeras reseñas!'
                : 'No hay reseñas en esta categoría'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
