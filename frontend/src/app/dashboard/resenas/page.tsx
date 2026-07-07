'use client'

import React, { useState } from 'react'
import { Star, MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useProviderReviews, useRespondToReview } from '@/hooks/useReviews'
import { useToast } from '@/stores/uiStore'

export default function DashboardResenasPage() {
  const toast = useToast()
  const { provider } = useAuth()
  const { data: reviews = [], isLoading } = useProviderReviews(provider?.id || '', 50)
  const respondToReview = useRespondToReview()
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')

  if (!provider) {
    return <p className="text-foreground-secondary">No tienes perfil de proveedor.</p>
  }

  const handleRespond = async (reviewId: string) => {
    if (!responseText.trim()) return
    try {
      await respondToReview.mutateAsync({
        reviewId,
        response: responseText.trim(),
        providerId: provider.id,
      })
      setRespondingId(null)
      setResponseText('')
      toast.success('Respuesta publicada')
    } catch {
      toast.error('Error', 'No se pudo publicar la respuesta')
    }
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '—'

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Mis Reseñas</h2>
        <p className="text-foreground-muted mt-1">
          {reviews.length} reseñas · Promedio {avgRating}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-4 text-foreground-muted" />
            <p className="text-foreground-secondary">Cuando recibas reseñas aparecerán aquí</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={review.user?.avatar_url || undefined} />
                    <AvatarFallback>{review.user?.name?.[0] || 'C'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{review.user?.name || 'Cliente'}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'fill-gold text-gold' : 'text-muted'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-foreground-muted mb-2">{formatDate(review.created_at)}</p>
                    <p className="text-foreground-secondary">{review.comment}</p>

                    {review.provider_response ? (
                      <div className="mt-3 pl-4 border-l-2 border-gold/30">
                        <p className="text-xs text-foreground-muted mb-1">Tu respuesta</p>
                        <p className="text-sm">{review.provider_response}</p>
                      </div>
                    ) : respondingId === review.id ? (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          className="input-luxury resize-none w-full"
                          rows={3}
                          placeholder="Escribe tu respuesta..."
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleRespond(review.id)} disabled={respondToReview.isPending}>
                            <Send className="h-4 w-4 mr-1" />
                            Publicar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setRespondingId(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => setRespondingId(review.id)}
                      >
                        Responder
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}