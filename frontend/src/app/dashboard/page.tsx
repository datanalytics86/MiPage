'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Eye,
  Star,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

// Mock data
const stats = [
  { name: 'Visitas totales', value: '1,250', icon: Eye, change: '+12%', trend: 'up' },
  { name: 'Rating promedio', value: '4.9', icon: Star, change: '+0.1', trend: 'up' },
  { name: 'Total reseñas', value: '47', icon: MessageSquare, change: '+3', trend: 'up' },
  { name: 'Este mes', value: '156', icon: TrendingUp, change: '+24%', trend: 'up' },
]

const recentReviews = [
  {
    id: '1',
    user: 'Carlos M.',
    rating: 5,
    content: 'Excelente profesional, muy recomendada...',
    date: '2024-12-08',
    responded: true,
  },
  {
    id: '2',
    user: 'Andrea P.',
    rating: 5,
    content: 'Ambiente muy agradable y profesional...',
    date: '2024-12-05',
    responded: false,
  },
  {
    id: '3',
    user: 'Miguel T.',
    rating: 4,
    content: 'Muy buen servicio, puntual...',
    date: '2024-11-28',
    responded: false,
  },
]

const alerts = [
  { type: 'warning', message: '2 reseñas pendientes de respuesta' },
]

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 text-warning"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{alert.message}</span>
              <Link href="/dashboard/resenas" className="ml-auto">
                <Button variant="ghost" size="sm" className="text-warning hover:text-warning">
                  Ver reseñas
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-gold/10">
                    <stat.icon className="h-5 w-5 text-gold" />
                  </div>
                  <Badge variant={stat.trend === 'up' ? 'success' : 'destructive'}>
                    {stat.change}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-sm text-foreground-muted mt-1">{stat.name}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Reviews */}
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
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <div
                key={review.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{review.user}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-gold text-gold'
                              : 'fill-muted text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    {!review.responded && (
                      <Badge variant="warning" className="ml-2">Sin responder</Badge>
                    )}
                  </div>
                  <p className="text-sm text-foreground-secondary line-clamp-1">
                    {review.content}
                  </p>
                  <p className="text-xs text-foreground-muted mt-1">
                    {formatDate(review.date)}
                  </p>
                </div>
                <Link href="/dashboard/resenas">
                  <Button variant="outline" size="sm">
                    {review.responded ? 'Ver' : 'Responder'}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/dashboard/perfil">
          <Card className="hover:shadow-soft-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gold/10 group-hover:bg-gold/20 transition-colors">
                  <Calendar className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Actualizar disponibilidad</h3>
                  <p className="text-sm text-foreground-muted">Configura tus horarios</p>
                </div>
                <ArrowRight className="h-5 w-5 text-foreground-muted ml-auto group-hover:text-gold transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/galeria">
          <Card className="hover:shadow-soft-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-rose/10 group-hover:bg-rose/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-rose" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Subir nuevas fotos</h3>
                  <p className="text-sm text-foreground-muted">Actualiza tu galería</p>
                </div>
                <ArrowRight className="h-5 w-5 text-foreground-muted ml-auto group-hover:text-rose transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/servicios">
          <Card className="hover:shadow-soft-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-sage/10 group-hover:bg-sage/20 transition-colors">
                  <MessageSquare className="h-6 w-6 text-sage" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Gestionar servicios</h3>
                  <p className="text-sm text-foreground-muted">Edita precios y duración</p>
                </div>
                <ArrowRight className="h-5 w-5 text-foreground-muted ml-auto group-hover:text-sage transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
