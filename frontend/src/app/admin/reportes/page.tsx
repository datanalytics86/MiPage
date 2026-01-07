'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flag,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  User,
  Image,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn, formatDate } from '@/lib/utils'

interface Report {
  id: string
  type: 'profile' | 'review' | 'message' | 'photo'
  reason: string
  description: string
  status: 'pending' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high'
  reporter: {
    name: string
    email: string
    avatar?: string
  }
  reported: {
    type: string
    name: string
    id: string
  }
  created_at: string
  resolved_at?: string
  resolved_by?: string
  resolution_note?: string
}

// Mock reports data
const mockReports: Report[] = [
  {
    id: 'r1',
    type: 'profile',
    reason: 'Contenido inapropiado',
    description: 'El perfil contiene imágenes que violan los términos de servicio. Las fotos parecen ser explícitas.',
    status: 'pending',
    priority: 'high',
    reporter: {
      name: 'Usuario Anónimo',
      email: 'user123@email.com',
    },
    reported: {
      type: 'Proveedor',
      name: 'Proveedor XYZ',
      id: 'p123',
    },
    created_at: '2024-12-28T10:30:00Z',
  },
  {
    id: 'r2',
    type: 'review',
    reason: 'Spam / Publicidad',
    description: 'La reseña contiene enlaces de publicidad a otros sitios web.',
    status: 'pending',
    priority: 'medium',
    reporter: {
      name: 'Valentina Rossi',
      email: 'valentina@email.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
    },
    reported: {
      type: 'Reseña',
      name: 'Reseña #1234',
      id: 'rev123',
    },
    created_at: '2024-12-27T15:45:00Z',
  },
  {
    id: 'r3',
    type: 'message',
    reason: 'Acoso',
    description: 'El usuario está enviando mensajes intimidantes y acosadores repetidamente.',
    status: 'pending',
    priority: 'high',
    reporter: {
      name: 'Isabella Montenegro',
      email: 'isabella@email.com',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100',
    },
    reported: {
      type: 'Usuario',
      name: 'usuario_anonimo',
      id: 'u456',
    },
    created_at: '2024-12-26T09:00:00Z',
  },
  {
    id: 'r4',
    type: 'photo',
    reason: 'Foto falsa',
    description: 'Las fotos del perfil no corresponden a la persona real. Posible catfish.',
    status: 'resolved',
    priority: 'medium',
    reporter: {
      name: 'Carlos Rodríguez',
      email: 'carlos@email.com',
    },
    reported: {
      type: 'Proveedor',
      name: 'Ana López',
      id: 'p789',
    },
    created_at: '2024-12-20T14:00:00Z',
    resolved_at: '2024-12-22T10:00:00Z',
    resolved_by: 'Admin',
    resolution_note: 'Se verificó la identidad del proveedor. Fotos son auténticas.',
  },
  {
    id: 'r5',
    type: 'profile',
    reason: 'Información falsa',
    description: 'El proveedor afirma tener certificaciones que no posee.',
    status: 'dismissed',
    priority: 'low',
    reporter: {
      name: 'Usuario Competidor',
      email: 'comp@email.com',
    },
    reported: {
      type: 'Proveedor',
      name: 'Camila Delgado',
      id: 'p101',
    },
    created_at: '2024-12-15T11:00:00Z',
    resolved_at: '2024-12-16T09:00:00Z',
    resolved_by: 'Admin',
    resolution_note: 'Reporte sin fundamento. El proveedor tiene documentación válida.',
  },
]

const typeIcons: Record<string, React.ElementType> = {
  profile: User,
  review: MessageSquare,
  message: MessageSquare,
  photo: Image,
}

const typeLabels: Record<string, string> = {
  profile: 'Perfil',
  review: 'Reseña',
  message: 'Mensaje',
  photo: 'Foto',
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  resolved: 'bg-success/10 text-success',
  dismissed: 'bg-muted text-foreground-muted',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  resolved: 'Resuelto',
  dismissed: 'Descartado',
}

const priorityColors: Record<string, string> = {
  low: 'bg-blue-500/10 text-blue-500',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-error/10 text-error',
}

const priorityLabels: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
}

export default function AdminReportesPage() {
  const [reports, setReports] = useState(mockReports)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [expandedReport, setExpandedReport] = useState<string | null>(null)

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reason.toLowerCase().includes(search.toLowerCase()) ||
      report.reported.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    const matchesType = typeFilter === 'all' || report.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handleResolve = (id: string, action: 'resolved' | 'dismissed') => {
    setReports(reports.map(r =>
      r.id === id
        ? {
            ...r,
            status: action,
            resolved_at: new Date().toISOString(),
            resolved_by: 'Admin',
          }
        : r
    ))
  }

  const pendingCount = reports.filter(r => r.status === 'pending').length
  const highPriorityCount = reports.filter(r => r.status === 'pending' && r.priority === 'high').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Gestión de Reportes
        </h2>
        <p className="text-foreground-muted mt-1">
          Revisa y gestiona los reportes de usuarios
        </p>
      </div>

      {/* Alert for high priority */}
      {highPriorityCount > 0 && (
        <Card className="border-error/50 bg-error/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-error" />
              <div>
                <p className="font-medium text-foreground">
                  {highPriorityCount} {highPriorityCount === 1 ? 'reporte' : 'reportes'} de alta prioridad
                </p>
                <p className="text-sm text-foreground-muted">
                  Requieren atención inmediata
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-foreground">{reports.length}</p>
            <p className="text-sm text-foreground-muted">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-warning">{pendingCount}</p>
            <p className="text-sm text-foreground-muted">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-success">
              {reports.filter(r => r.status === 'resolved').length}
            </p>
            <p className="text-sm text-foreground-muted">Resueltos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-error">{highPriorityCount}</p>
            <p className="text-sm text-foreground-muted">Alta prioridad</p>
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
                placeholder="Buscar reportes..."
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
                <SelectItem value="resolved">Resuelto</SelectItem>
                <SelectItem value="dismissed">Descartado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="profile">Perfil</SelectItem>
                <SelectItem value="review">Reseña</SelectItem>
                <SelectItem value="message">Mensaje</SelectItem>
                <SelectItem value="photo">Foto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report, index) => {
          const TypeIcon = typeIcons[report.type]
          const isExpanded = expandedReport === report.id

          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                report.status === 'pending' && report.priority === 'high' && 'border-error/50'
              )}>
                <CardContent className="p-4">
                  {/* Report Header */}
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'p-2 rounded-lg',
                      report.status === 'pending' ? 'bg-error/10' : 'bg-muted'
                    )}>
                      <TypeIcon className={cn(
                        'h-5 w-5',
                        report.status === 'pending' ? 'text-error' : 'text-foreground-muted'
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{report.reason}</h3>
                        <Badge className={statusColors[report.status]}>
                          {statusLabels[report.status]}
                        </Badge>
                        <Badge className={priorityColors[report.priority]}>
                          {priorityLabels[report.priority]}
                        </Badge>
                        <Badge variant="secondary">
                          {typeLabels[report.type]}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-foreground-muted">
                        <span>Reportado: {report.reported.name}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(report.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {report.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleResolve(report.id, 'resolved')}
                            className="bg-success hover:bg-success/90"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolve(report.id, 'dismissed')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Descartar
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-border"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Description */}
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">Descripción</h4>
                            <p className="text-sm text-foreground-secondary bg-muted/50 p-3 rounded-lg">
                              {report.description}
                            </p>
                          </div>

                          {/* Reporter Info */}
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">Reportado por</h4>
                            <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
                              <Avatar>
                                <AvatarImage src={report.reporter.avatar} />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {report.reporter.name}
                                </p>
                                <p className="text-xs text-foreground-muted">
                                  {report.reporter.email}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Resolution Info */}
                        {report.status !== 'pending' && (
                          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <h4 className="text-sm font-medium text-foreground mb-2">Resolución</h4>
                            <p className="text-sm text-foreground-secondary">
                              {report.resolution_note}
                            </p>
                            <p className="text-xs text-foreground-muted mt-2">
                              Resuelto por {report.resolved_by} el {formatDate(report.resolved_at!)}
                            </p>
                          </div>
                        )}

                        {/* Actions for pending */}
                        {report.status === 'pending' && (
                          <div className="mt-4 flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver contenido reportado
                            </Button>
                            <Button variant="outline" size="sm">
                              <User className="h-4 w-4 mr-2" />
                              Ver perfil del reportado
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Flag className="h-12 w-12 mx-auto text-foreground-muted mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Sin reportes
            </h3>
            <p className="text-foreground-secondary">
              No hay reportes con los filtros seleccionados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
