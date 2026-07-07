'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users,
  UserCheck,
  TrendingUp,
  Flag,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useAdminStats, useAdminProviders, useAdminReports } from '@/hooks/useAdmin'

function buildStats(data: { totalUsers: number; activeProviders: number; pendingReports: number }) {
  return [
    {
      name: 'Total Usuarios',
      value: String(data.totalUsers),
      change: 'en vivo',
      trend: 'up' as const,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      name: 'Proveedores Activos',
      value: String(data.activeProviders),
      change: 'aprobados',
      trend: 'up' as const,
      icon: UserCheck,
      color: 'text-gold',
      bg: 'bg-gold/10',
    },
    {
      name: 'Reportes Pendientes',
      value: String(data.pendingReports),
      change: 'por revisar',
      trend: data.pendingReports > 0 ? ('down' as const) : ('up' as const),
      icon: Flag,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
  ]
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-error/10 text-error',
  resolved: 'bg-muted text-foreground-muted',
  dismissed: 'bg-muted text-foreground-muted',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  resolved: 'Resuelto',
  dismissed: 'Descartado',
}

export default function AdminDashboardPage() {
  const { data: adminStats } = useAdminStats()
  const { data: providers = [] } = useAdminProviders()
  const { data: reports = [] } = useAdminReports()

  const stats = buildStats(
    adminStats ?? { totalUsers: 0, activeProviders: 0, pendingReports: 0 }
  )
  const recentProviders = providers.slice(0, 5)
  const recentReports = reports.slice(0, 5)
  const pendingProviders = providers.filter((p) => p.status === 'pending').length
  const pendingReports = reports.filter((r) => r.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-foreground-muted">{stat.name}</p>
                    <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                    <div
                      className={cn(
                        'flex items-center gap-1 mt-2 text-sm',
                        stat.trend === 'up' ? 'text-success' : 'text-error'
                      )}
                    >
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  <div className={cn('p-3 rounded-xl', stat.bg)}>
                    <stat.icon className={cn('h-6 w-6', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Nuevos Proveedores</CardTitle>
            <Link href="/admin/proveedores">
              <Button variant="ghost" size="sm">Ver todos</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={provider.cover_photo || provider.photos?.[0] || undefined} />
                    <AvatarFallback>{provider.display_name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{provider.display_name}</p>
                    <p className="text-sm text-foreground-muted">{provider.category}</p>
                  </div>
                </div>
                <Badge className={statusColors[provider.status]}>
                  {statusLabels[provider.status]}
                </Badge>
              </div>
            ))}
            {recentProviders.length === 0 && (
              <p className="text-sm text-foreground-muted text-center py-4">Sin proveedores aún</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Reportes Recientes</CardTitle>
            <Link href="/admin/reportes">
              <Button variant="ghost" size="sm">Ver todos</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Flag className="h-5 w-5 text-gold" />
                  <div>
                    <p className="font-medium">{report.reason}</p>
                    <p className="text-sm text-foreground-muted">
                      {report.reported_type} · {report.reported_id}
                    </p>
                  </div>
                </div>
                <Badge className={statusColors[report.status]}>
                  {statusLabels[report.status]}
                </Badge>
              </div>
            ))}
            {recentReports.length === 0 && (
              <p className="text-sm text-foreground-muted text-center py-4">Sin reportes</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/proveedores">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <UserCheck className="h-6 w-6 text-gold" />
                <span>Aprobar proveedores</span>
                <Badge variant="secondary">{pendingProviders} pendientes</Badge>
              </Button>
            </Link>
            <Link href="/admin/reportes">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Flag className="h-6 w-6 text-error" />
                <span>Revisar reportes</span>
                <Badge variant="destructive">{pendingReports} nuevos</Badge>
              </Button>
            </Link>
            <Link href="/admin/usuarios">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Users className="h-6 w-6 text-blue-500" />
                <span>Gestionar usuarios</span>
              </Button>
            </Link>
            <Link href="/admin/configuracion">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <TrendingUp className="h-6 w-6 text-success" />
                <span>Configuración</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}