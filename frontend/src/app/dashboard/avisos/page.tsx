'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Edit2,
  Pause,
  Play,
  Trash2,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  PauseCircle,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatPrice, formatDate } from '@/lib/utils'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

type ServiceStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAUSED' | 'ARCHIVED'

interface MyListing {
  id: string
  title: string
  description: string
  category: string
  city: string
  price: number
  photos: string[] | string
  coverPhoto: string | null
  status: ServiceStatus
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

const STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string; icon: React.ElementType; description: string }> = {
  DRAFT:    { label: 'Borrador',        color: 'bg-gray-500/20 text-gray-400',    icon: FileText,    description: 'No publicado aún' },
  PENDING:  { label: 'En revisión',     color: 'bg-yellow-500/20 text-yellow-400', icon: Clock,       description: 'Lo revisamos en menos de 24h' },
  APPROVED: { label: 'Publicado',       color: 'bg-green-500/20 text-green-400',   icon: CheckCircle, description: 'Visible para todos' },
  REJECTED: { label: 'Rechazado',       color: 'bg-red-500/20 text-red-400',       icon: XCircle,     description: 'Ver motivo' },
  PAUSED:   { label: 'Pausado por ti',  color: 'bg-orange-500/20 text-orange-400', icon: PauseCircle, description: 'Oculto temporalmente' },
  ARCHIVED: { label: 'Archivado',       color: 'bg-gray-700/40 text-gray-500',     icon: FileText,    description: 'No activo' },
}

function getPhoto(listing: MyListing): string {
  const photos = Array.isArray(listing.photos)
    ? listing.photos
    : (typeof listing.photos === 'string' ? JSON.parse(listing.photos || '[]') : [])
  return listing.coverPhoto || photos[0] || ''
}

// Mock data for development
const MOCK_LISTINGS: MyListing[] = [
  { id: '1', title: 'Masaje Relajante Completo', description: 'Masaje con aceites esenciales.', category: 'MASAJES_PROFESIONALES', city: 'Santiago', price: 45000, photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'], coverPhoto: null, status: 'APPROVED', createdAt: '2024-11-01T00:00:00Z', updatedAt: '2024-11-01T00:00:00Z' },
  { id: '2', title: 'Sesión de Modelaje Profesional', description: 'Sesión fotográfica.', category: 'MODELAJE', city: 'Santiago', price: 80000, photos: ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400'], coverPhoto: null, status: 'PENDING', createdAt: '2024-11-10T00:00:00Z', updatedAt: '2024-11-10T00:00:00Z' },
  { id: '3', title: 'Masaje Deportivo', description: 'Para deportistas.', category: 'MASAJES_PROFESIONALES', city: 'Santiago', price: 55000, photos: [], coverPhoto: null, status: 'PAUSED', createdAt: '2024-10-15T00:00:00Z', updatedAt: '2024-11-05T00:00:00Z' },
]

export default function DashboardAvisosPage() {
  const [listings, setListings] = useState<MyListing[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API}/services/my`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setListings(Array.isArray(data) ? data : [])
        } else {
          setListings(MOCK_LISTINGS)
        }
      } catch {
        setListings(MOCK_LISTINGS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const doAction = async (id: string, action: 'pause' | 'unpause' | 'delete') => {
    try {
      const token = localStorage.getItem('token')
      const endpoint = action === 'delete' ? `${API}/services/${id}` : `${API}/services/${id}/${action}`
      const method = action === 'delete' ? 'DELETE' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      })

      if (action === 'delete') {
        setListings(prev => prev.filter(l => l.id !== id))
        showToast('Aviso eliminado')
        return
      }

      if (res.ok) {
        const nextStatus: Record<string, ServiceStatus> = { pause: 'PAUSED', unpause: 'APPROVED' }
        setListings(prev => prev.map(l => l.id === id ? { ...l, status: nextStatus[action] } : l))
        showToast(action === 'pause' ? 'Aviso pausado' : 'Aviso reactivado')
      }
    } catch {
      // Optimistic update anyway for demo
      if (action === 'delete') {
        setListings(prev => prev.filter(l => l.id !== id))
        showToast('Aviso eliminado')
      } else {
        const nextStatus: Record<string, ServiceStatus> = { pause: 'PAUSED', unpause: 'APPROVED' }
        setListings(prev => prev.map(l => l.id === id ? { ...l, status: nextStatus[action] } : l))
        showToast(action === 'pause' ? 'Aviso pausado' : 'Aviso reactivado')
      }
    }
  }

  const approved = listings.filter(l => l.status === 'APPROVED').length
  const pending = listings.filter(l => l.status === 'PENDING').length

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis avisos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {approved > 0 && <span className="text-green-400">{approved} publicados</span>}
            {approved > 0 && pending > 0 && <span className="text-muted-foreground"> · </span>}
            {pending > 0 && <span className="text-yellow-400">{pending} en revisión</span>}
            {approved === 0 && pending === 0 && listings.length === 0 && 'Aún no tienes avisos'}
          </p>
        </div>
        <Link href="/dashboard/avisos/nuevo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo aviso
          </Button>
        </Link>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <FileText className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Aún no tienes avisos</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Publica tu primer aviso en menos de 2 minutos y empieza a recibir clientes.
          </p>
          <Link href="/dashboard/avisos/nuevo">
            <Button className="mt-2">
              <Plus className="h-4 w-4 mr-2" /> Crear mi primer aviso
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map(listing => {
            const cfg = STATUS_CONFIG[listing.status]
            const StatusIcon = cfg.icon
            const photo = getPhoto(listing)

            return (
              <motion.div
                key={listing.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="overflow-hidden group hover:shadow-soft-lg transition-shadow">
                  {/* Thumbnail */}
                  <div className="relative h-44 bg-muted">
                    {photo ? (
                      <Image src={photo} alt={listing.title} fill className="object-cover" />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <FileText className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    {/* Status overlay */}
                    <div className="absolute top-3 left-3">
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm', cfg.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground truncate">{listing.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{cfg.description}</p>
                      {listing.status === 'REJECTED' && listing.rejectionReason && (
                        <div className="mt-2 flex items-start gap-1.5 text-xs text-red-400">
                          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>{listing.rejectionReason}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{formatPrice(listing.price)}</span>
                      <span className="text-xs text-muted-foreground">{listing.city}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <Link href={`/dashboard/avisos/${listing.id}/editar`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1">
                          <Edit2 className="h-3.5 w-3.5" /> Editar
                        </Button>
                      </Link>

                      {listing.status === 'APPROVED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-orange-400 border-orange-400/40 hover:bg-orange-400/10"
                          onClick={() => doAction(listing.id, 'pause')}
                        >
                          <Pause className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {listing.status === 'PAUSED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-green-400 border-green-400/40 hover:bg-green-400/10"
                          onClick={() => doAction(listing.id, 'unpause')}
                        >
                          <Play className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                        onClick={() => {
                          if (window.confirm('¿Eliminar este aviso? Esta acción no se puede deshacer.')) {
                            doAction(listing.id, 'delete')
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
