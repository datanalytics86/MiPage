'use client'

import React, { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, Star, MessageSquare, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import type { Provider } from '@/types/database'
import { useProviderReviews } from '@/hooks/useReviews'
import { FeaturedUpgradeCard } from '@/components/dashboard/FeaturedUpgradeCard'

function FeaturedPaymentNotice() {
  const params = useSearchParams()
  const featured = params.get('featured')
  if (featured === 'success') {
    return (
      <p className="text-sm text-success bg-success/10 rounded-lg p-3">
        Pago de Destacado recibido. El badge aparece cuando el admin lo confirma.
      </p>
    )
  }
  if (featured === 'failure') {
    return (
      <p className="text-sm text-error bg-error/10 rounded-lg p-3">
        El pago de Destacado no se completó. Puedes reintentar o pedirle al admin que te marque.
      </p>
    )
  }
  if (featured === 'pending') {
    return (
      <p className="text-sm text-foreground-secondary bg-muted/50 rounded-lg p-3">
        Pago de Destacado pendiente de confirmación en Mercado Pago.
      </p>
    )
  }
  return null
}

function FeaturedExpiry({ until }: { until: string }) {
  const [active] = useState(() => Date.parse(until) > Date.now())
  return (
    <p className="text-sm text-foreground-secondary">
      {active
        ? `Destacado vigente hasta ${formatDate(until)}.`
        : `El Destacado venció el ${formatDate(until)}. Pídele al admin que lo renueve.`}
    </p>
  )
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'En revisión',
    approved: 'Publicado',
    rejected: 'Rechazado',
    suspended: 'Suspendido',
  }
  return labels[status] || status
}

function ListingGaps({ provider }: { provider: Provider }) {
  const missing: string[] = []
  if (!provider.display_name || provider.display_name.trim().length < 2) missing.push('Nombre público')
  if (!provider.bio || provider.bio.trim().length < 40) missing.push('Descripción de al menos 40 caracteres')
  if (!provider.city) missing.push('Ciudad')
  if (!provider.price_min) missing.push('Precio desde')
  if (!provider.photos || provider.photos.length < 3) missing.push('Al menos 3 fotos')
  if (missing.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Qué falta para publicar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-foreground-secondary">Estado actual: {statusLabel(provider.status)}.</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          {missing.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Button size="sm" variant="outline" asChild>
          <Link href="/dashboard/avisos/nuevo">Completar aviso</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default function DashboardOverviewPage() {
  return (
    <Suspense fallback={<p className="text-foreground-muted">Cargando dashboard…</p>}>
      <DashboardOverviewInner />
    </Suspense>
  )
}

function DashboardOverviewInner() {
  const { provider } = useAuth()
  const { data: reviews = [] } = useProviderReviews(provider?.id || '', 5)

  if (!provider) {
    return (
      <Card>
        <CardContent className="p-6 space-y-3">
          <p className="text-foreground-secondary">
            Aún no tienes un aviso. Publica fotos y un precio para entrar en revisión.
          </p>
          <Button asChild>
            <Link href="/dashboard/avisos/nuevo">Publicar aviso</Link>
          </Button>
        </CardContent>
      </Card>
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
      <FeaturedPaymentNotice />
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

      {provider.status === 'pending' && (
        <Card className="border-gold/30 bg-gold/5">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-gold/15 shrink-0">
                <AlertCircle className="h-5 w-5 text-gold" aria-hidden />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground flex flex-wrap items-center gap-2">
                  Estado <Badge variant="warning">PENDING</Badge>
                  <span className="text-foreground-secondary font-normal text-sm">
                    — es un paso normal
                  </span>
                </p>
                <p className="text-sm text-foreground-secondary leading-relaxed">
                  Recibimos tu aviso y un administrador revisará las fotos y los datos.
                  No es un error: cuando se apruebe, aparecerás en Explorar. Mientras tanto
                  puedes seguir editando perfil, galería y servicios.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" variant="outline" asChild>
                <Link href="/dashboard/avisos/nuevo">Mejorar mi aviso</Link>
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <Link href="/dashboard/galeria">Subir más fotos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {provider.status === 'approved' && (
        <div className="space-y-3">
          <FeaturedUpgradeCard providerId={provider.id} isFeatured={!!provider.is_featured} />
          {provider.featured_until && <FeaturedExpiry until={provider.featured_until} />}
        </div>
      )}

      {provider.status !== 'approved' && <ListingGaps provider={provider} />}

      {provider.status !== 'approved' && provider.status !== 'pending' && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="p-4 text-sm text-foreground-secondary space-y-3">
            <p>
              Tu perfil está en estado{' '}
              <strong className="text-foreground">{statusLabel(provider.status)}</strong>.
            </p>
            {provider.status === 'rejected' && (
              <>
                <p className="text-foreground">
                  Motivo: {provider.rejection_reason || 'Sin detalle. Corrige fotos y texto y vuelve a enviar.'}
                </p>
                <Button size="sm" asChild>
                  <Link href="/dashboard/avisos/nuevo">Corregir y reenviar</Link>
                </Button>
              </>
            )}
            {provider.status === 'suspended' && <p>Contacta soporte si crees que es un error.</p>}
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