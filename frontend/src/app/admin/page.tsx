'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users,
  UserCheck,
  DollarSign,
  TrendingUp,
  Eye,
  Star,
  Flag,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, formatPrice } from '@/lib/utils'

// Mock stats
const stats = [
  {
    name: 'Total Usuarios',
    value: '2,543',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    name: 'Proveedores Activos',
    value: '186',
    change: '+8.2%',
    trend: 'up',
    icon: UserCheck,
    color: 'text-gold',
    bg: 'bg-gold/10',
  },
  {
    name: 'Ingresos del Mes',
    value: formatPrice(12450000),
    change: '+23.1%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    name: 'Reportes Pendientes',
    value: '3',
    change: '-2',
    trend: 'down',
    icon: Flag,
    color: 'text-error',
    bg: 'bg-error/10',
  },
]

// Mock recent providers
const recentProviders = [
  {
    id: '1',
    name: 'Valentina Rossi',
    email: 'valentina@email.com',
    category: 'Masajes',
    status: 'pending',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
    created_at: '2024-12-28',
  },
  {
    id: '2',
    name: 'Isabella Montenegro',
    email: 'isabella@email.com',
    category: 'Modelaje',
    status: 'approved',
    photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100',
    created_at: '2024-12-27',
  },
  {
    id: '3',
    name: 'Camila Delgado',
    email: 'camila@email.com',
    category: 'Fotografía',
    status: 'pending',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100',
    created_at: '2024-12-26',
  },
]

// Mock recent reports
const recentReports = [
  {
    id: 'r1',
    type: 'perfil',
    reason: 'Contenido inapropiado',
    reporter: 'usuario123',
    reported: 'Proveedor XYZ',
    created_at: '2024-12-28',
    status: 'pending',
  },
  {
    id: 'r2',
    type: 'reseña',
    reason: 'Spam',
    reporter: 'usuario456',
    reported: 'Reseña #1234',
    created_at: '2024-12-27',
    status: 'pending',
  },
  {
    id: 'r3',
    type: 'mensaje',
    reason: 'Acoso',
    reporter: 'usuario789',
    reported: 'usuario000',
    created_at: '2024-12-26',
    status: 'resolved',
  },
]

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-error/10 text-error',
  resolved: 'bg-muted text-foreground-muted',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  resolved: 'Resuelto',
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
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
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-foreground-muted">{stat.name}</p>
                    <p className="text-2xl font-semibold text-foreground mt-1">
                      {stat.value}
                    </p>
                    <div className={cn(
                      'flex items-center gap-1 mt-2 text-sm',
                      stat.trend === 'up' ? 'text-success' : 'text-error'
                    )}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      <span>{stat.change}</span>
                      <span className="text-foreground-muted">vs mes anterior</span>
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
        {/* Recent Providers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Nuevos Proveedores</CardTitle>
            <Link href="/admin/proveedores">
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={provider.photo} />
                      <AvatarFallback>{provider.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{provider.name}</p>
                      <p className="text-sm text-foreground-muted">{provider.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColors[provider.status]}>
                      {statusLabels[provider.status]}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Reportes Recientes</CardTitle>
            <Link href="/admin/reportes">
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      report.status === 'pending' ? 'bg-error/10' : 'bg-muted'
                    )}>
                      <Flag className={cn(
                        'h-5 w-5',
                        report.status === 'pending' ? 'text-error' : 'text-foreground-muted'
                      )} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{report.reason}</p>
                      <p className="text-sm text-foreground-muted">
                        {report.type} • {report.reported}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColors[report.status]}>
                      {statusLabels[report.status]}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/proveedores?status=pending">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <UserCheck className="h-6 w-6 text-gold" />
                <span>Aprobar proveedores</span>
                <Badge variant="secondary">2 pendientes</Badge>
              </Button>
            </Link>
            <Link href="/admin/reportes">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Flag className="h-6 w-6 text-error" />
                <span>Revisar reportes</span>
                <Badge variant="destructive">3 nuevos</Badge>
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
                <span>Ver métricas</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
