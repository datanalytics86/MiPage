'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Check,
  X,
  Pause,
  Play,
  Archive,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  PauseCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatPrice, formatDate } from '@/lib/utils'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

type ServiceStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAUSED' | 'ARCHIVED'

interface Listing {
  id: string
  title: string
  description: string
  category: string
  city: string
  price: number
  photos: string[] | string
  coverPhoto: string | null
  status: ServiceStatus
  createdAt: string
  updatedAt: string
  publisher: { id: string; name: string; avatar: string | null } | null
}

const STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string; icon: React.ElementType }> = {
  DRAFT:    { label: 'Borrador',    color: 'bg-gray-500/20 text-gray-400',   icon: Clock },
  PENDING:  { label: 'Pendiente',   color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  APPROVED: { label: 'Publicado',   color: 'bg-green-500/20 text-green-400',  icon: CheckCircle },
  REJECTED: { label: 'Rechazado',   color: 'bg-red-500/20 text-red-400',      icon: XCircle },
  PAUSED:   { label: 'Pausado',     color: 'bg-orange-500/20 text-orange-400', icon: PauseCircle },
  ARCHIVED: { label: 'Archivado',   color: 'bg-gray-700/40 text-gray-500',    icon: Archive },
}

const REJECT_REASONS = [
  'Contenido inapropiado o explícito',
  'Información falsa o engañosa',
  'Fotos de baja calidad o irrelevantes',
  'Precio o descripción incorrectos',
  'Categoría incorrecta',
  'Incumplimiento de términos de uso',
]

const FILTER_TABS: { value: string; label: string }[] = [
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'APPROVED', label: 'Aprobados' },
  { value: 'PAUSED', label: 'Pausados' },
  { value: 'REJECTED', label: 'Rechazados' },
  { value: 'all', label: 'Todos' },
]

function getPrimaryPhoto(listing: Listing): string {
  const photos = Array.isArray(listing.photos)
    ? listing.photos
    : (typeof listing.photos === 'string' ? JSON.parse(listing.photos || '[]') : [])
  return listing.coverPhoto || photos[0] || '/placeholder-service.jpg'
}

function getPrimaryAction(status: ServiceStatus): { label: string; icon: React.ElementType; action: string; variant: string } | null {
  switch (status) {
    case 'PENDING': return { label: 'Aprobar', icon: Check, action: 'approve', variant: 'success' }
    case 'APPROVED': return { label: 'Pausar', icon: Pause, action: 'pause', variant: 'warning' }
    case 'PAUSED': return { label: 'Reactivar', icon: Play, action: 'unpause', variant: 'success' }
    case 'REJECTED': return { label: 'Aprobar', icon: Check, action: 'approve', variant: 'success' }
    default: return null
  }
}

export default function AdminAvisosPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<Listing | null>(null)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [customReason, setCustomReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Preview drawer
  const [previewListing, setPreviewListing] = useState<Listing | null>(null)

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
        ...(search ? { search } : {}),
      })
      const res = await fetch(`${API}/admin/listings?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setListings(data.listings || [])
      setTotalPages(data.pagination?.pages || 1)
      setTotal(data.pagination?.total || 0)
    } catch {
      // En modo dev sin backend, usar datos de muestra
      setListings([])
      setTotalPages(1)
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, search])

  useEffect(() => { fetchListings() }, [fetchListings])
  useEffect(() => { setPage(1) }, [statusFilter, search])

  const doAction = async (listing: Listing, action: string, body?: object) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/admin/listings/${listing.id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!res.ok) throw new Error()

      // Optimistic update
      const nextStatus: Record<string, ServiceStatus> = {
        approve: 'APPROVED', reject: 'REJECTED',
        pause: 'PAUSED', unpause: 'APPROVED', archive: 'ARCHIVED',
      }
      setListings(prev =>
        prev.map(l => l.id === listing.id ? { ...l, status: nextStatus[action] } : l)
      )

      const labels: Record<string, string> = {
        approve: 'Aviso aprobado', reject: 'Aviso rechazado',
        pause: 'Aviso pausado', unpause: 'Aviso reactivado', archive: 'Aviso archivado',
      }
      showToast(labels[action] || 'Acción completada')
    } catch {
      showToast('Error al realizar la acción', 'error')
    }
  }

  const handleRejectSubmit = async () => {
    if (!rejectTarget) return
    const allReasons = [...selectedReasons, ...(customReason ? [customReason] : [])]
    if (allReasons.length === 0) return

    setSubmitting(true)
    await doAction(rejectTarget, 'reject', { reason: allReasons.join('. ') })
    setSubmitting(false)
    setRejectTarget(null)
    setSelectedReasons([])
    setCustomReason('')
  }

  const pendingCount = listings.filter(l => l.status === 'PENDING').length

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2',
              toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            )}
          >
            {toast.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de avisos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {total} avisos en total
            {pendingCount > 0 && statusFilter !== 'PENDING' && (
              <span className="ml-2 text-yellow-400 font-medium">· {pendingCount} pendientes</span>
            )}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título o publicador..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide bg-background-secondary rounded-xl p-1">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              statusFilter === tab.value
                ? 'bg-background text-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-px">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                  <div className="h-12 w-12 rounded-lg bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-3" />
              <p className="text-foreground font-medium">Todo al día</p>
              <p className="text-muted-foreground text-sm">No hay avisos en este estado</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {listings.map(listing => {
                const cfg = STATUS_CONFIG[listing.status]
                const StatusIcon = cfg.icon
                const primaryAction = getPrimaryAction(listing.status)
                const photo = getPrimaryPhoto(listing)

                return (
                  <div key={listing.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                    {/* Thumbnail */}
                    <button
                      onClick={() => setPreviewListing(listing)}
                      className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0 group"
                    >
                      <Image src={photo} alt={listing.title} fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="h-4 w-4 text-white" />
                      </div>
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{listing.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {listing.publisher?.name || 'Publicador desconocido'} · {listing.city}
                      </p>
                    </div>

                    {/* Category badge */}
                    <span className="hidden sm:block text-xs text-muted-foreground shrink-0">
                      {listing.category === 'MASAJES_PROFESIONALES' ? 'Masajes' : 'Modelaje'}
                    </span>

                    {/* Status */}
                    <span className={cn('hidden md:flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shrink-0', cfg.color)}>
                      <StatusIcon className="h-3 w-3" />
                      {cfg.label}
                    </span>

                    {/* Price */}
                    <span className="hidden lg:block text-sm text-foreground shrink-0">
                      {formatPrice(listing.price)}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {primaryAction && (
                        <Button
                          size="sm"
                          variant={primaryAction.action === 'approve' || primaryAction.action === 'unpause' ? 'default' : 'outline'}
                          className={cn(
                            'h-8 text-xs',
                            (primaryAction.action === 'approve' || primaryAction.action === 'unpause') && 'bg-green-600 hover:bg-green-700 text-white border-0',
                            primaryAction.action === 'pause' && 'text-orange-400 border-orange-400/50 hover:bg-orange-400/10'
                          )}
                          onClick={() => doAction(listing, primaryAction.action)}
                        >
                          <primaryAction.icon className="h-3.5 w-3.5 mr-1" />
                          {primaryAction.label}
                        </Button>
                      )}

                      {/* More menu */}
                      <div className="relative group">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        <div className="absolute right-0 top-full mt-1 w-44 bg-background-secondary border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                          <div className="p-1">
                            <button
                              onClick={() => setPreviewListing(listing)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                            >
                              <Eye className="h-4 w-4" /> Ver preview
                            </button>
                            {listing.status !== 'APPROVED' && (
                              <button
                                onClick={() => doAction(listing, 'approve')}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-green-400"
                              >
                                <Check className="h-4 w-4" /> Aprobar
                              </button>
                            )}
                            {listing.status !== 'REJECTED' && (
                              <button
                                onClick={() => setRejectTarget(listing)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-red-400"
                              >
                                <X className="h-4 w-4" /> Rechazar
                              </button>
                            )}
                            {listing.status === 'APPROVED' && (
                              <button
                                onClick={() => doAction(listing, 'pause')}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-orange-400"
                              >
                                <Pause className="h-4 w-4" /> Pausar
                              </button>
                            )}
                            {listing.status === 'PAUSED' && (
                              <button
                                onClick={() => doAction(listing, 'unpause')}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-green-400"
                              >
                                <Play className="h-4 w-4" /> Reactivar
                              </button>
                            )}
                            {listing.status !== 'ARCHIVED' && (
                              <button
                                onClick={() => doAction(listing, 'archive')}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                              >
                                <Archive className="h-4 w-4" /> Archivar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Reject modal */}
      <AnimatePresence>
        {rejectTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50"
              onClick={() => setRejectTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-background-secondary border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
                <h3 className="text-lg font-semibold text-foreground mb-1">Rechazar aviso</h3>
                <p className="text-muted-foreground text-sm mb-5 truncate">"{rejectTarget.title}"</p>

                <p className="text-sm font-medium text-foreground mb-3">Motivo del rechazo</p>
                <div className="space-y-2 mb-4">
                  {REJECT_REASONS.map(reason => (
                    <label key={reason} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedReasons.includes(reason)}
                        onChange={e => {
                          setSelectedReasons(prev =>
                            e.target.checked ? [...prev, reason] : prev.filter(r => r !== reason)
                          )
                        }}
                        className="mt-0.5 rounded border-border text-gold focus:ring-gold"
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{reason}</span>
                    </label>
                  ))}
                </div>

                <textarea
                  placeholder="Motivo adicional (opcional)..."
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl bg-background border border-border px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-gold/50 mb-5"
                />

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setRejectTarget(null)}>
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
                    disabled={selectedReasons.length === 0 && !customReason || submitting}
                    onClick={handleRejectSubmit}
                  >
                    {submitting ? 'Rechazando...' : 'Confirmar rechazo'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Preview drawer */}
      <AnimatePresence>
        {previewListing && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setPreviewListing(null)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-background-secondary border-l border-border z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-background-secondary border-b border-border px-5 py-4 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Preview del aviso</h3>
                <button onClick={() => setPreviewListing(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Photo */}
                <div className="relative h-52 rounded-xl overflow-hidden bg-muted">
                  <Image src={getPrimaryPhoto(previewListing)} alt={previewListing.title} fill className="object-cover" />
                </div>

                {/* Status badge */}
                {(() => {
                  const cfg = STATUS_CONFIG[previewListing.status]
                  const Icon = cfg.icon
                  return (
                    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium', cfg.color)}>
                      <Icon className="h-3.5 w-3.5" />
                      {cfg.label}
                    </span>
                  )
                })()}

                {/* Details */}
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">{previewListing.title}</h2>
                  <p className="text-muted-foreground text-sm">{previewListing.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-background rounded-xl p-3">
                    <p className="text-muted-foreground text-xs mb-1">Publicador</p>
                    <p className="font-medium text-foreground">{previewListing.publisher?.name || '—'}</p>
                  </div>
                  <div className="bg-background rounded-xl p-3">
                    <p className="text-muted-foreground text-xs mb-1">Ciudad</p>
                    <p className="font-medium text-foreground">{previewListing.city}</p>
                  </div>
                  <div className="bg-background rounded-xl p-3">
                    <p className="text-muted-foreground text-xs mb-1">Precio</p>
                    <p className="font-medium text-foreground">{formatPrice(previewListing.price)}</p>
                  </div>
                  <div className="bg-background rounded-xl p-3">
                    <p className="text-muted-foreground text-xs mb-1">Publicado</p>
                    <p className="font-medium text-foreground">{formatDate(previewListing.createdAt)}</p>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="border-t border-border pt-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Acciones</p>
                  {previewListing.status !== 'APPROVED' && (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white border-0"
                      onClick={() => { doAction(previewListing, 'approve'); setPreviewListing(null) }}
                    >
                      <Check className="h-4 w-4 mr-2" /> Aprobar aviso
                    </Button>
                  )}
                  {previewListing.status === 'APPROVED' && (
                    <Button
                      variant="outline"
                      className="w-full text-orange-400 border-orange-400/50"
                      onClick={() => { doAction(previewListing, 'pause'); setPreviewListing(null) }}
                    >
                      <Pause className="h-4 w-4 mr-2" /> Pausar aviso
                    </Button>
                  )}
                  {previewListing.status === 'PAUSED' && (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white border-0"
                      onClick={() => { doAction(previewListing, 'unpause'); setPreviewListing(null) }}
                    >
                      <Play className="h-4 w-4 mr-2" /> Reactivar aviso
                    </Button>
                  )}
                  {previewListing.status !== 'REJECTED' && (
                    <Button
                      variant="outline"
                      className="w-full text-red-400 border-red-400/50"
                      onClick={() => { setRejectTarget(previewListing); setPreviewListing(null) }}
                    >
                      <X className="h-4 w-4 mr-2" /> Rechazar con motivo
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
