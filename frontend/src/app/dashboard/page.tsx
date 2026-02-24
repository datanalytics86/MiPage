'use client'

import Link from 'next/link'
import { Eye, Star, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useProvider } from '@/hooks/useProviders'
import { formatDate } from '@/lib/utils'

export default function DashboardOverviewPage() {
  const { provider } = useAuth()
  const { data, isLoading } = useProvider(provider?.slug || '')

  if (!provider) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Debes completar tu perfil de proveedor para ver tu dashboard.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading || !data) {
    return <div className="p-8 text-muted-foreground">Cargando dashboard...</div>
  }

  const totalViews = data.view_count || 0
  const avgRating = data.rating || 0
  const totalReviews = data.review_count || data.reviews.length
  const activeServices = data.services.filter((s) => s.is_active).length

  const stats = [
    { name: 'Visitas totales', value: String(totalViews), icon: Eye },
    { name: 'Rating promedio', value: avgRating.toFixed(1), icon: Star },
    { name: 'Total reseñas', value: String(totalReviews), icon: MessageSquare },
    { name: 'Servicios activos', value: String(activeServices), icon: TrendingUp },
  ]

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-gold/10">
                  <stat.icon className="h-5 w-5 text-gold" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-semibold text-foreground">{stat.value}</p>
                <p className="text-sm text-foreground-muted mt-1">{stat.name}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-xl">Reseñas recientes</CardTitle>
          <Link href="/dashboard/resenas">
            <Button variant="ghost" size="sm">
              Ver todas
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {data.reviews.length === 0 ? (
            <p className="text-muted-foreground">Aún no tienes reseñas.</p>
          ) : (
            <div className="space-y-4">
              {data.reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{review.user?.name || 'Usuario'}</span>
                      <Badge variant="outline">{review.rating}★</Badge>
                      {!review.provider_response && <Badge variant="warning">Sin responder</Badge>}
                    </div>
                    <p className="text-sm text-foreground-secondary line-clamp-1">{review.comment}</p>
                    <p className="text-xs text-foreground-muted mt-1">{formatDate(review.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
