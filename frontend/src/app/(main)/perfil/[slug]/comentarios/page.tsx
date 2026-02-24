'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, Filter, MessageSquare, SortAsc, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useProvider } from '@/hooks/useProviders'
import { formatDate, getInitials } from '@/lib/utils'

export default function ComentariosPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug || ''
  const { data: provider, isLoading } = useProvider(slug)
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent')
  const [filterRating, setFilterRating] = useState<string>('all')

  const reviews = provider?.reviews || []

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0
    return reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
  }, [reviews])

  const filteredReviews = useMemo(() => {
    const base = reviews.filter((r) => filterRating === 'all' || r.rating === parseInt(filterRating, 10))

    return base.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [reviews, filterRating, sortBy])

  if (isLoading) {
    return <div className="container-luxury py-8 text-center text-muted-foreground">Cargando comentarios...</div>
  }

  if (!provider) {
    return (
      <div className="container-luxury py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="font-semibold">No se encontró este perfil.</p>
            <Button asChild className="mt-4">
              <Link href="/explorar">Volver a explorar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container-luxury py-8 space-y-6">
      <Link
        href={`/perfil/${provider.slug}`}
        className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al perfil
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="font-display text-xl font-semibold">{provider.display_name}</h2>
                <p className="text-sm text-muted-foreground">{reviews.length} reseñas</p>
              </div>

              <div className="text-center py-3">
                <div className="text-5xl font-display font-semibold">{averageRating.toFixed(1)}</div>
                <div className="flex justify-center items-center gap-1 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.round(averageRating) ? 'text-gold fill-gold' : 'text-muted-foreground/30'}`}
                    />
                  ))}
                </div>
              </div>

              <Button className="w-full" asChild>
                <Link href={`/login?next=/perfil/${provider.slug}/comentarios`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Inicia sesión para dejar una reseña
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="font-display text-2xl font-semibold">Todas las reseñas</h1>

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

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'recent' | 'rating')}>
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

          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">No hay reseñas para mostrar.</CardContent>
              </Card>
            ) : (
              filteredReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.user?.avatar_url || undefined} />
                          <AvatarFallback>{getInitials(review.user?.name || 'Usuario')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{review.user?.name || 'Usuario'}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'text-gold fill-gold' : 'text-muted-foreground/30'}`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-foreground-secondary">{review.comment}</p>

                    {review.provider_response ? (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Respuesta del proveedor</p>
                        <p className="text-sm text-foreground-secondary">{review.provider_response}</p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
