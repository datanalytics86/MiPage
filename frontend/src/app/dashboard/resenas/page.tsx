'use client'

import React, { useMemo } from 'react'
import { Star, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useProviderReviews } from '@/hooks/useReviews'
import { formatDate, getInitials } from '@/lib/utils'

export default function DashboardResenasPage() {
  const { provider } = useAuth()
  const providerId = provider?.id || ''
  const { data: reviews = [], isLoading } = useProviderReviews(providerId, 50)

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0
    return reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
  }, [reviews])

  if (!providerId) {
    return (
      <div className="container-luxury py-8">
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Debes completar tu perfil de proveedor para ver reseñas.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container-luxury py-8">
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">Cargando reseñas...</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container-luxury py-8 space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total de reseñas</p>
            <p className="text-2xl font-bold mt-1">{reviews.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Promedio</p>
            <p className="text-2xl font-bold mt-1 flex items-center gap-2">
              {averageRating.toFixed(1)} <Star className="h-5 w-5 text-gold fill-gold" />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Con respuesta</p>
            <p className="text-2xl font-bold mt-1">
              {reviews.filter((r) => Boolean(r.provider_response)).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="font-display text-xl font-semibold">Últimas reseñas</h2>

          {reviews.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
              Aún no tienes reseñas.
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="p-4 rounded-xl border border-border">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.user?.avatar_url || undefined} />
                      <AvatarFallback>{getInitials(review.user?.name || 'Usuario')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{review.user?.name || 'Usuario verificado'}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {review.rating} <Star className="h-3 w-3 text-gold fill-gold" />
                  </Badge>
                </div>

                <p className="mt-3 text-sm text-foreground-secondary">{review.comment}</p>

                {review.provider_response ? (
                  <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
                    <p className="font-medium mb-1">Tu respuesta</p>
                    <p className="text-foreground-secondary">{review.provider_response}</p>
                  </div>
                ) : (
                  <div className="mt-3">
                    <Badge variant="secondary">Sin respuesta del proveedor</Badge>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
