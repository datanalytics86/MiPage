'use client'

import React, { useState } from 'react'
import { Flag, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { useAdminReports, useUpdateReport } from '@/hooks/useAdmin'
import { useToast } from '@/stores/uiStore'

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  resolved: 'Resuelto',
  dismissed: 'Descartado',
}

const typeLabels: Record<string, string> = {
  profile: 'Perfil',
  review: 'Reseña',
  message: 'Mensaje',
  photo: 'Foto',
}

export default function AdminReportesPage() {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(0)
  const { data, isLoading } = useAdminReports({
    q: search,
    status: statusFilter,
    page,
    pageSize: 20,
  })
  const reports = data?.rows ?? []
  const updateReport = useUpdateReport()

  const handleAction = async (
    id: string,
    action: 'dismiss' | 'suspend_profile' | 'hide_review'
  ) => {
    if (action !== 'dismiss' && !window.confirm('¿Aplicar esta acción sobre lo reportado?')) return
    try {
      await updateReport.mutateAsync({ id, action })
      toast.success('Reporte actualizado')
    } catch {
      toast.error('Error', 'No se pudo actualizar el reporte')
    }
  }

  const pendingCount = statusFilter === 'pending' ? data?.total ?? 0 : reports.filter((r) => r.status === 'pending').length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Gestión de Reportes</h2>
        <p className="text-foreground-muted mt-1">Revisa y resuelve reportes de usuarios</p>
      </div>

      {pendingCount > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <p className="font-medium">{pendingCount} reportes pendientes de revisión</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="resolved">Resuelto</SelectItem>
              <SelectItem value="dismissed">Descartado</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="h-32 rounded-xl bg-muted overflow-hidden relative before:absolute before:inset-0 before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent" />
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Flag className="h-4 w-4 text-gold" />
                      <Badge>{typeLabels[report.reported_type] || report.reported_type}</Badge>
                      <Badge variant="secondary">{statusLabels[report.status]}</Badge>
                      <Badge variant="outline">Prioridad: {report.priority}</Badge>
                    </div>
                    <h3 className="font-semibold">{report.reason}</h3>
                    {report.description && (
                      <p className="text-sm text-foreground-secondary mt-2">{report.description}</p>
                    )}
                    <p className="text-xs text-foreground-muted mt-3">
                      Reportado por {report.reporter?.name || report.reporter?.email || 'usuario'} ·{' '}
                      {formatDate(report.created_at)} · ID: {report.reported_id}
                    </p>
                    {report.reported_type === 'profile' && (
                      <Link className="text-sm text-gold" href={`/perfil/${report.reported_id}`}>
                        Ver perfil reportado
                      </Link>
                    )}
                  </div>
                  {report.status === 'pending' && (
                    <div className="flex flex-wrap gap-2">
                      {report.reported_type === 'profile' && (
                        <Button size="sm" variant="destructive" onClick={() => handleAction(report.id, 'suspend_profile')}>
                          Suspender perfil
                        </Button>
                      )}
                      {report.reported_type === 'review' && (
                        <Button size="sm" onClick={() => handleAction(report.id, 'hide_review')}>
                          <CheckCircle className="h-4 w-4 mr-1" />Ocultar reseña
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleAction(report.id, 'dismiss')}>
                        <XCircle className="h-4 w-4 mr-1" />Descartar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {reports.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-foreground-muted">
                No hay reportes que mostrar
              </CardContent>
            </Card>
          )}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>
          Anterior
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={(page + 1) * 20 >= (data?.total ?? 0)}
          onClick={() => setPage((value) => value + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}