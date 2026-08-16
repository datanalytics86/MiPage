'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Star, ChevronLeft, Calendar, User, MessageSquare, Filter, SortAsc } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DARK_BLUR_DATA_URL_CLIENT } from '@/lib/image'
import { useProvider } from '@/hooks/useProviders'
import { useCreateReview, useProviderReviews } from '@/hooks/useReviews'
import { useAuth } from '@/contexts/AuthContext'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { getProviderImage } from '@/lib/providers'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { StarRating } from '@/components/reviews/StarRating'
import { useToast } from '@/stores/uiStore'

function RatingDistribution({
  reviews,
}: {
  reviews: { rating: number }[]
}) {
  const total = reviews.length || 1
  const distribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: (reviews.filter((r) => r.rating === rating).length / total) * 100,
  }))

  return (
    <div className="space-y-2">
      {distribution.map(({ rating, count, percentage }) => (
        <div key={rating} className="flex items-center gap-2">
          <span className="text-sm text-foreground-muted w-16 flex items-center gap-1">
            {rating} <Star className="h-3 w-3 text-gold fill-gold" />
          </span>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full" style={{ width: `${percentage}%` }} />
          </div>
          <span className="text-sm text-foreground-secondary w-8 text-right">{count}</span>
        </div>
      ))}
    </div>
  )
}

export default function ComentariosPage() {
  const params = useParams()
  const slug = String(params.slug || '')
  const toast = useToast()
  const { isAuthenticated } = useAuth()
  const { data: provider, isLoading: loadingProvider } = useProvider(slug)
  const { data: reviews = [], isLoading: loadingReviews } = useProviderReviews(
    provider?.id || '',
    50
  )
  const createReview = useCreateReview()
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent')
  const [filterRating, setFilterRating] = useState<string>('all')
  const [formOpen, setFormOpen] = useState(false)

  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => filterRating === 'all' || r.rating === parseInt(filterRating, 10))
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [reviews, filterRating, sortBy])

  if (!hasSupabaseEnv()) {
    return (
      <EmptyState
        title="Supabase no configurado"
        description="Las reseñas se leen de la base de datos. En producción no mostramos comentarios de ejemplo."
        actionLabel="Volver a explorar"
        actionHref="/explorar"
        className="min-h-[50vh]"
      />
    )
  }

  if (loadingProvider) {
    return <p className="container-luxury py-16 text-foreground-muted">Cargando reseñas…</p>
  }

  if (!provider) {
    return (
      <EmptyState
        title="Perfil no encontrado"
        description="Este profesional no existe o aún no está publicado."
        actionLabel="Explorar"
        actionHref="/explorar"
        className="min-h-[50vh]"
      />
    )
  }

  const average =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : Number(provider.rating) || 0
  const photo = getProviderImage(provider)

  const openReview = () => {
    if (!isAuthenticated) {
      toast.info('Inicia sesión', 'Necesitas una cuenta para dejar una reseña')
      return
    }
    setFormOpen(true)
  }

  return (
    <div className="container-luxury py-8">
      <Link
        href={`/perfil/${slug}`}
        className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al perfil
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="relative h-16 w-16 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={photo}
                    alt={provider.display_name}
                    fill
                    className="object-cover"
                    sizes="64px"
                    placeholder="blur"
                    blurDataURL={DARK_BLUR_DATA_URL_CLIENT}
                  />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    {provider.display_name}
                  </h2>
                  <p className="text-sm text-foreground-muted">
                    {reviews.length === 0 ? 'Sin reseñas aún' : `${reviews.length} reseñas`}
                  </p>
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="text-5xl font-display font-semibold text-foreground mb-2">
                  {reviews.length === 0 ? '—' : average.toFixed(1)}
                </div>
                {reviews.length > 0 && <StarRating rating={Math.round(average)} size="lg" />}
                <p className="text-sm text-foreground-muted mt-2">
                  {reviews.length === 0
                    ? 'Todavía no hay calificaciones'
                    : `Basado en ${reviews.length} reseñas reales`}
                </p>
              </div>

              {reviews.length > 0 && <RatingDistribution reviews={reviews} />}

              {isAuthenticated ? (
                <Button className="w-full mt-6" onClick={openReview}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Escribir una reseña
                </Button>
              ) : (
                <Button className="w-full mt-6" asChild>
                  <Link href={`/login?redirect=/perfil/${slug}/comentarios`}>
                    Inicia sesión para reseñar
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="font-display text-2xl font-semibold text-foreground">
              Todas las reseñas
            </h1>
            <div className="flex items-center gap-3">
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
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-[160px]">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Más recientes</SelectItem>
                  <SelectItem value="rating">Mayor calificación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loadingReviews ? (
            <p className="text-foreground-muted">Cargando…</p>
          ) : filteredReviews.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title={reviews.length === 0 ? 'Aún no hay reseñas' : 'Sin resultados'}
              description={
                reviews.length === 0
                  ? 'Sé el primero en dejar una opinión después de contactar al profesional.'
                  : 'No hay reseñas con los filtros seleccionados.'
              }
              actionLabel={isAuthenticated ? 'Escribir reseña' : 'Iniciar sesión'}
              actionHref={isAuthenticated ? undefined : `/login?redirect=/perfil/${slug}/comentarios`}
              onAction={isAuthenticated ? openReview : undefined}
            />
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={review.user?.avatar_url || undefined} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground">
                            {review.user?.name || 'Cliente'}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-foreground-muted">
                            <Calendar className="h-4 w-4" />
                            {formatDate(review.created_at)}
                          </div>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                    </div>
                    <p className="mt-4 text-foreground-secondary leading-relaxed">
                      {review.comment}
                    </p>
                    {review.provider_response && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg border-l-2 border-gold">
                        <span className="text-sm font-medium text-foreground">
                          Respuesta de {provider.display_name}
                        </span>
                        <p className="text-sm text-foreground-secondary mt-1">
                          {review.provider_response}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <ReviewForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        providerName={provider.display_name}
        providerPhoto={photo}
        onSubmit={async ({ rating, comment }) => {
          await createReview.mutateAsync({
            provider_id: provider.id,
            rating,
            comment,
          })
          toast.success('Reseña publicada')
        }}
      />
    </div>
  )
}
