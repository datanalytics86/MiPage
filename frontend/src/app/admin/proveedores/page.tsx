'use client'

import React, { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Search,
  MoreHorizontal,
  User,
  Mail,
  MapPin,
  Star,
  Eye,
  CheckCircle,
  XCircle,
  Ban,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn, formatDate, formatPrice } from '@/lib/utils'
import { useAdminProviders, useUpdateProvider, type AdminProviderRow } from '@/hooks/useAdmin'
import { getProviderImage } from '@/lib/providers'
import { useToast } from '@/stores/uiStore'
import type { ProviderStatus } from '@/types/database'
import { Textarea } from '@/components/ui/textarea'
import {
  analyzeProviderFlags,
  moderationRiskScore,
  type ModerationFlag,
} from '@/lib/moderation'
import { DARK_BLUR_DATA_URL_CLIENT } from '@/lib/image'
import { ListRowSkeleton } from '@/components/ui/Skeleton'
import { useSearchParams } from 'next/navigation'

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-error/10 text-error',
  suspended: 'bg-muted text-foreground-muted',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  suspended: 'Suspendido',
}

/** Empathetic rejection copy: what to fix, not punishment. */
const REJECT_REASONS = [
  'Las fotos están un poco borrosas o poco nítidas. ¿Puedes subir al menos 3 imágenes claras del servicio y de ti?',
  'Parte del contenido no encaja con la política de MiPage. Revisa las normas y vuelve a enviar con fotos y texto apropiados.',
  'Detectamos datos de contacto o enlaces que parecen spam. Usa los campos de WhatsApp/Instagram y deja la bio limpia.',
  'La categoría o la ciudad no coinciden con el perfil. Corrige esos datos y reenvía para revisión.',
  'El perfil está incompleto (bio corta o sin precio). Completa la información y las fotos; con gusto lo revisamos de nuevo.',
] as const

function AdminProveedoresInner() {
  const toast = useToast()
  const searchParams = useSearchParams()
  const { data: providers = [], isLoading, error } = useAdminProviders()
  const updateProvider = useUpdateProvider()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get('status') || 'all'
  )
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [preview, setPreview] = useState<AdminProviderRow | null>(null)
  const [rejectTarget, setRejectTarget] = useState<AdminProviderRow | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)

  useEffect(() => {
    const s = searchParams.get('status')
    if (s) setStatusFilter(s)
  }, [searchParams])

  const mutate = async (
    id: string,
    updates: Record<string, unknown>,
    message: string,
    notify?: {
      type: 'provider_approved' | 'provider_rejected'
      email?: string
      displayName?: string
      reason?: string
    }
  ) => {
    try {
      await updateProvider.mutateAsync({ id, updates, notify })
      toast.success(message)
    } catch {
      toast.error('Error', 'No se pudo actualizar el proveedor')
    }
  }

  const confirmReject = async () => {
    if (!rejectTarget) return
    const reason = rejectReason.trim() || 'No cumple políticas de contenido'
    await mutate(
      rejectTarget.id,
      { status: 'rejected', rejection_reason: reason },
      'Proveedor rechazado',
      {
        type: 'provider_rejected',
        email: rejectTarget.email,
        displayName: rejectTarget.display_name,
        reason,
      }
    )
    setRejectTarget(null)
    setRejectReason('')
  }

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const matchesSearch =
        provider.display_name.toLowerCase().includes(search.toLowerCase()) ||
        provider.email.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || provider.status === statusFilter
      const matchesCategory =
        categoryFilter === 'all' ||
        provider.category.toLowerCase() === categoryFilter.toLowerCase()
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [providers, search, statusFilter, categoryFilter])

  const flagsById = useMemo(() => {
    const map = new Map<string, ModerationFlag[]>()
    for (const p of filteredProviders) {
      map.set(
        p.id,
        analyzeProviderFlags({
          display_name: p.display_name,
          city: p.city,
          category: p.category,
          photos: p.photos,
          cover_photo: p.cover_photo,
          price_min: p.price_min,
        })
      )
    }
    return map
  }, [filteredProviders])

  const categories = Array.from(new Set(providers.map((p) => p.category)))

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectVisiblePending = () => {
    const ids = filteredProviders
      .filter((p) => p.status === 'pending')
      .map((p) => p.id)
    setSelected(new Set(ids))
  }

  const clearSelection = () => setSelected(new Set())

  const bulkApprove = async () => {
    if (selected.size === 0) return
    setBulkBusy(true)
    let ok = 0
    for (const id of Array.from(selected)) {
      const p = providers.find((x) => x.id === id)
      if (!p || p.status !== 'pending') continue
      try {
        await updateProvider.mutateAsync({
          id,
          updates: { status: 'approved', rejection_reason: null },
          notify: {
            type: 'provider_approved',
            email: p.email,
            displayName: p.display_name,
          },
        })
        ok += 1
      } catch {
        /* continue batch */
      }
    }
    setBulkBusy(false)
    clearSelection()
    toast.success('Lote completado', `${ok} aprobado(s)`)
  }

  const bulkReject = async () => {
    if (selected.size === 0) return
    const reason = rejectReason.trim() || 'No cumple políticas de contenido'
    setBulkBusy(true)
    let ok = 0
    for (const id of Array.from(selected)) {
      const p = providers.find((x) => x.id === id)
      if (!p || p.status !== 'pending') continue
      try {
        await updateProvider.mutateAsync({
          id,
          updates: { status: 'rejected', rejection_reason: reason },
          notify: {
            type: 'provider_rejected',
            email: p.email,
            displayName: p.display_name,
            reason,
          },
        })
        ok += 1
      } catch {
        /* continue */
      }
    }
    setBulkBusy(false)
    clearSelection()
    setRejectReason('')
    toast.success('Lote completado', `${ok} rechazado(s)`)
  }

  if (error) {
    return (
      <div className="py-8">
        <p className="text-center text-error mb-2">Error al cargar proveedores</p>
        <p className="text-center text-foreground-secondary text-sm">
          Verifica la conexión a Supabase y que tu rol sea admin.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Gestión de Proveedores
        </h2>
        <p className="text-foreground-muted mt-1">
          Aprueba, verifica y administra los proveedores de la plataforma
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: providers.length, className: 'text-foreground' },
          { label: 'Pendientes', value: providers.filter((p) => p.status === 'pending').length, className: 'text-warning' },
          { label: 'Aprobados', value: providers.filter((p) => p.status === 'approved').length, className: 'text-success' },
          { label: 'Verificados', value: providers.filter((p) => p.is_verified).length, className: 'text-gold' },
          { label: 'Suspendidos', value: providers.filter((p) => p.status === 'suspended').length, className: 'text-error' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <p className={cn('text-2xl font-semibold', stat.className)}>{stat.value}</p>
              <p className="text-sm text-foreground-muted">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected.size > 0 && (
        <Card className="border-gold/30 bg-gold/5">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <p className="text-sm text-foreground">
              <span className="font-semibold text-gold">{selected.size}</span> seleccionado(s)
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={bulkBusy} onClick={bulkApprove}>
                Aprobar lote
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={bulkBusy}
                onClick={bulkReject}
              >
                Rechazar lote
              </Button>
              <Button size="sm" variant="ghost" onClick={clearSelection}>
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={selectVisiblePending}>
              Seleccionar pendientes visibles
            </Button>
            {statusFilter !== 'pending' && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setStatusFilter('pending')}
              >
                Ver solo pendientes
              </Button>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                aria-label="Buscar proveedores"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="approved">Aprobado</SelectItem>
                <SelectItem value="rejected">Rechazado</SelectItem>
                <SelectItem value="suspended">Suspendido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <ListRowSkeleton count={4} />
      ) : (
        <div className="space-y-4">
          {filteredProviders.map((provider, index) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className={cn(provider.status === 'pending' && 'border-warning/50')}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border accent-gold"
                        checked={selected.has(provider.id)}
                        onChange={() => toggleSelect(provider.id)}
                        aria-label={`Seleccionar ${provider.display_name}`}
                      />
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={getProviderImage(provider)} />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{provider.display_name}</h3>
                          {provider.is_verified && (
                            <Badge className="bg-gold/10 text-gold">Verificado</Badge>
                          )}
                          {provider.is_featured && (
                            <Badge variant="gold">Destacado</Badge>
                          )}
                          <Badge className={statusColors[provider.status]}>
                            {statusLabels[provider.status]}
                          </Badge>
                          {(flagsById.get(provider.id) || [])
                            .filter((f) => f.severity !== 'info')
                            .slice(0, 2)
                            .map((f) => (
                              <Badge
                                key={f.code}
                                variant={f.severity === 'high' ? 'destructive' : 'warning'}
                                title={f.message}
                              >
                                {f.severity === 'high' ? '⚠' : '·'} {f.code}
                              </Badge>
                            ))}
                          {moderationRiskScore(flagsById.get(provider.id) || []) >= 5 && (
                            <Badge variant="destructive">Revisar primero</Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground-muted">{provider.email}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-foreground-secondary">
                          <span>{provider.category}</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {provider.city}
                          </span>
                          {provider.rating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-gold fill-gold" />
                              {provider.rating} ({provider.review_count})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-center text-sm">
                      <div>
                        <p className="font-semibold">{provider.services_count}</p>
                        <p className="text-xs text-foreground-muted">Servicios</p>
                      </div>
                      <div>
                        <p className="font-semibold">
                          {provider.price_min ? formatPrice(provider.price_min) : '—'}
                        </p>
                        <p className="text-xs text-foreground-muted">Desde</p>
                      </div>
                      <div>
                        <p>{formatDate(provider.created_at)}</p>
                        <p className="text-xs text-foreground-muted">Registro</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setPreview(provider)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Fotos
                      </Button>
                      {provider.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              mutate(
                                provider.id,
                                { status: 'approved', rejection_reason: null },
                                'Proveedor aprobado',
                                {
                                  type: 'provider_approved',
                                  email: provider.email,
                                  displayName: provider.display_name,
                                }
                              )
                            }
                            className="bg-success hover:bg-success/90"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setRejectTarget(provider)
                              setRejectReason('')
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/perfil/${provider.slug}`} target="_blank">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver perfil público
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`mailto:${provider.email}`}>
                              <Mail className="h-4 w-4 mr-2" />
                              Enviar email
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              mutate(
                                provider.id,
                                { is_verified: !provider.is_verified },
                                provider.is_verified ? 'Verificación removida' : 'Proveedor verificado'
                              )
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {provider.is_verified ? 'Quitar verificación' : 'Verificar'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              mutate(
                                provider.id,
                                { is_featured: !provider.is_featured },
                                provider.is_featured ? 'Ya no es destacado' : 'Marcado como destacado'
                              )
                            }
                          >
                            <Star className="h-4 w-4 mr-2" />
                            {provider.is_featured ? 'Quitar destacado' : 'Destacar'}
                          </DropdownMenuItem>
                          {provider.status !== 'suspended' ? (
                            <DropdownMenuItem
                              className="text-error"
                              onClick={() =>
                                mutate(provider.id, { status: 'suspended' }, 'Proveedor suspendido')
                              }
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Suspender
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-success"
                              onClick={() =>
                                mutate(provider.id, { status: 'approved' as ProviderStatus }, 'Proveedor reactivado')
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Reactivar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {filteredProviders.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 mx-auto text-foreground-muted mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">Sin resultados</h3>
            <p className="text-foreground-secondary">
              No hay proveedores registrados o no coinciden con los filtros
            </p>
          </CardContent>
        </Card>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto border-gold/20 shadow-soft-lg">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-semibold">{preview.display_name}</h3>
                  <p className="text-sm text-foreground-muted">
                    {preview.category} · {preview.city} · {preview.email}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setPreview(null)}>
                  Cerrar
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(preview.photos?.length
                  ? preview.photos
                  : preview.cover_photo
                    ? [preview.cover_photo]
                    : []
                ).map((url) => (
                  <div
                    key={url}
                    className="relative aspect-portrait rounded-xl overflow-hidden border border-white/10 shadow-soft"
                  >
                    <Image
                      src={url}
                      alt={`Foto de ${preview.display_name}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 200px"
                      placeholder="blur"
                      blurDataURL={DARK_BLUR_DATA_URL_CLIENT}
                    />
                  </div>
                ))}
                {!preview.photos?.length && !preview.cover_photo && (
                  <p className="text-sm text-foreground-muted col-span-full">Sin fotos</p>
                )}
              </div>
              {preview.status === 'pending' && (
                <div className="flex gap-2 justify-end">
                  <Button
                    className="bg-success hover:bg-success/90"
                    onClick={async () => {
                      await mutate(
                        preview.id,
                        { status: 'approved', rejection_reason: null },
                        'Proveedor aprobado',
                        {
                          type: 'provider_approved',
                          email: preview.email,
                          displayName: preview.display_name,
                        }
                      )
                      setPreview(null)
                    }}
                  >
                    Aprobar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setRejectTarget(preview)
                      setPreview(null)
                    }}
                  >
                    Rechazar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">
                Ayudar a {rejectTarget.display_name} a mejorar
              </h3>
              <p className="text-sm text-foreground-muted">
                Elige un motivo claro: se lo enviaremos para que pueda corregir y volver a enviar.
                (Email si Resend está configurado.)
              </p>
              <div className="flex flex-wrap gap-2">
                {REJECT_REASONS.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setRejectReason(reason)}
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-full border transition-colors',
                      rejectReason === reason
                        ? 'border-gold bg-gold/15 text-gold'
                        : 'border-border text-foreground-secondary hover:border-gold/40'
                    )}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Motivo del rechazo (elige uno o escribe personalizado…)"
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setRejectTarget(null)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={confirmReject}>
                  Confirmar rechazo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function AdminProveedoresPage() {
  return (
    <Suspense fallback={<ListRowSkeleton count={4} />}>
      <AdminProveedoresInner />
    </Suspense>
  )
}