'use client'

import React, { useState } from 'react'
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
  ExternalLink
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
import { demoProviders, type AdminProvider } from '@/lib/admin/demo-data'

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
  const [providers, setProviders] = useState<AdminProvider[]>(demoProviders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(search.toLowerCase()) ||
      provider.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || provider.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || provider.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleApprove = (id: string) => {
    setProviders(providers.map(p =>
      p.id === id ? { ...p, status: 'approved' as const } : p
    ))
  }

  const handleReject = (id: string) => {
    setProviders(providers.map(p =>
      p.id === id ? { ...p, status: 'rejected' as const } : p
    ))
  }

  const handleToggleVerified = (id: string) => {
    setProviders(providers.map(p =>
      p.id === id ? { ...p, is_verified: !p.is_verified } : p
    ))
  }

  const categories = Array.from(new Set(providers.map((p) => p.category)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Gestión de Proveedores
        </h2>
        <p className="text-foreground-muted mt-1">
          Aprueba, verifica y administra los proveedores de la plataforma
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-foreground">{providers.length}</p>
            <p className="text-sm text-foreground-muted">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-warning">
              {providers.filter(p => p.status === 'pending').length}
            </p>
            <p className="text-sm text-foreground-muted">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-success">
              {providers.filter(p => p.status === 'approved').length}
            </p>
            <p className="text-sm text-foreground-muted">Aprobados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-gold">
              {providers.filter(p => p.is_verified).length}
            </p>
            <p className="text-sm text-foreground-muted">Verificados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-error">
              {providers.filter(p => p.status === 'suspended').length}
            </p>
            <p className="text-sm text-foreground-muted">Suspendidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Providers List */}
      <div className="space-y-4">
        {filteredProviders.map((provider, index) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={cn(
              provider.status === 'pending' && 'border-warning/50'
            )}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Provider Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={provider.photo} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{provider.name}</h3>
                        {provider.is_verified && (
                          <Badge className="bg-gold/10 text-gold">Verificado</Badge>
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

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <p className="text-lg font-semibold text-foreground">{provider.services_count}</p>
                      <p className="text-xs text-foreground-muted">Servicios</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">{formatPrice(provider.price_min)}</p>
                      <p className="text-xs text-foreground-muted">Desde</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground-secondary">{formatDate(provider.created_at)}</p>
                      <p className="text-xs text-foreground-muted">Registro</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {provider.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(provider.id)}
                          className="bg-success hover:bg-success/90"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(provider.id)}
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
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver perfil público
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Enviar email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleVerified(provider.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {provider.is_verified ? 'Quitar verificación' : 'Verificar'}
                        </DropdownMenuItem>
                        {provider.status !== 'suspended' ? (
                          <DropdownMenuItem className="text-error">
                            <Ban className="h-4 w-4 mr-2" />
                            Suspender
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-success">
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

      {/* Empty State */}
      {filteredProviders.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 mx-auto text-foreground-muted mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Sin resultados
            </h3>
            <p className="text-foreground-secondary">
              No se encontraron proveedores con los filtros seleccionados
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {filteredProviders.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-foreground-muted">
            Mostrando {filteredProviders.length} de {providers.length} proveedores
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">1</Button>
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
