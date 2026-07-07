'use client'

import React, { useState } from 'react'
import Link from 'next/link'
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
import { useAdminProviders, useUpdateProvider } from '@/hooks/useAdmin'
import { getProviderImage } from '@/lib/providers'
import { useToast } from '@/stores/uiStore'
import type { ProviderStatus } from '@/types/database'

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

export default function AdminProveedoresPage() {
  const toast = useToast()
  const { data: providers = [], isLoading, error } = useAdminProviders()
  const updateProvider = useUpdateProvider()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const mutate = async (id: string, updates: Record<string, unknown>, message: string) => {
    try {
      await updateProvider.mutateAsync({ id, updates })
      toast.success(message)
    } catch {
      toast.error('Error', 'No se pudo actualizar el proveedor')
    }
  }

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.display_name.toLowerCase().includes(search.toLowerCase()) ||
      provider.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || provider.status === statusFilter
    const matchesCategory =
      categoryFilter === 'all' ||
      provider.category.toLowerCase() === categoryFilter.toLowerCase()
    return matchesSearch && matchesStatus && matchesCategory
  })

  const categories = [...new Set(providers.map((p) => p.category))]

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error">Error al cargar proveedores. Verifica la conexión a Supabase.</p>
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

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
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
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
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
                      {provider.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              mutate(provider.id, { status: 'approved' }, 'Proveedor aprobado')
                            }
                            className="bg-success hover:bg-success/90"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              mutate(provider.id, { status: 'rejected' }, 'Proveedor rechazado')
                            }
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
    </div>
  )
}