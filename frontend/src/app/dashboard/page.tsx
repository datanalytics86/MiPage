'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, Star, MessageSquare, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useProviderReviews } from '@/hooks/useReviews'

export default function DashboardOverviewPage() {
  const { provider } = useAuth()
  const { data: reviews = [] } = useProviderReviews(provider?.id || '', 5)

  if (!provider) {
    return (
      <p className="text-foreground-secondary">Completa tu perfil de proveedor para ver estadísticas.</p>
    )
  }

  const pendingResponses = reviews.filter((r) => !r.provider_response).length

  const stats = [
    { name: 'Visitas totales', value: String(provider.view_count), icon: Eye },
    { name: 'Rating promedio', value: Number(provider.rating).toFixed(1), icon: Star },
    { name: 'Total reseñas', value: String(provider.review_count), icon: MessageSquare },
    {
      name: 'Precio desde',
      value: provider.price_min ? `$${provider.price_min.toLocaleString('es-CL')}` : '—',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-8">
      {pendingResponses > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 text-warning"
        >
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">
            {pendingResponses} reseña(s) pendiente(s) de respuesta
          </span>
          <Link href="/dashboard/resenas" className="ml-auto">
            <Button variant="ghost" size="sm">
              Ver reseñas
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </motion.div>
      )}

      {provider.status !== 'approved' && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="p-4 text-sm">
            Tu perfil está en estado <strong>{provider.status}</strong>. Un administrador debe aprobarlo
            para que aparezca en Explorar.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gold/10">
                  <stat.icon className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-foreground-muted">{stat.name}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reseñas recientes</CardTitle>
          <Link href="/dashboard/resenas">
            <Button variant="ghost" size="sm">Ver todas</Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-foreground-muted text-center py-6">Aún no tienes reseñas</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{review.user?.name || 'Cliente'}</span>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-gold text-gold" />
                    <span>{review.rating}</span>
                    {!review.provider_response && (
                      <Badge variant="warning">Sin respuesta</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-foreground-secondary line-clamp-2">{review.comment}</p>
                <p className="text-xs text-foreground-muted mt-2">{formatDate(review.created_at)}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/perfil">
          <Card className="hover:shadow-soft-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-1">Editar perfil</h3>
              <p className="text-sm text-foreground-muted">Actualiza tu bio y contacto</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/servicios">
          <Card className="hover:shadow-soft-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-1">Mis servicios</h3>
              <p className="text-sm text-foreground-muted">Gestiona precios y duración</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/galeria">
          <Card className="hover:shadow-soft-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-1">Mi galería</h3>
              <p className="text-sm text-foreground-muted">Sube fotos de tu trabajo</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}