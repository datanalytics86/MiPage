'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  MoreHorizontal,
  User,
  Mail,
  Calendar,
  Shield,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { cn, formatDate } from '@/lib/utils'
import { demoUsers, type AdminUser } from '@/lib/admin/demo-data'

const roleColors: Record<string, string> = {
  user: 'bg-blue-500/10 text-blue-500',
  provider: 'bg-gold/10 text-gold',
  admin: 'bg-purple-500/10 text-purple-500',
}

const roleLabels: Record<string, string> = {
  user: 'Usuario',
  provider: 'Proveedor',
  admin: 'Admin',
}

const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success',
  suspended: 'bg-error/10 text-error',
  pending: 'bg-warning/10 text-warning',
}

const statusLabels: Record<string, string> = {
  active: 'Activo',
  suspended: 'Suspendido',
  pending: 'Pendiente',
}

export default function AdminUsuariosPage() {
  const [users] = useState<AdminUser[]>(demoUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Gestión de Usuarios
        </h2>
        <p className="text-foreground-muted mt-1">
          Administra todos los usuarios de la plataforma
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-foreground">{users.length}</p>
            <p className="text-sm text-foreground-muted">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-success">
              {users.filter(u => u.status === 'active').length}
            </p>
            <p className="text-sm text-foreground-muted">Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-gold">
              {users.filter(u => u.role === 'provider').length}
            </p>
            <p className="text-sm text-foreground-muted">Proveedores</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-warning">
              {users.filter(u => u.status === 'pending').length}
            </p>
            <p className="text-sm text-foreground-muted">Pendientes</p>
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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="user">Usuario</SelectItem>
                <SelectItem value="provider">Proveedor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="suspended">Suspendido</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-foreground-muted">Usuario</th>
                  <th className="text-left p-4 font-medium text-foreground-muted">Rol</th>
                  <th className="text-left p-4 font-medium text-foreground-muted">Estado</th>
                  <th className="text-left p-4 font-medium text-foreground-muted">Registro</th>
                  <th className="text-left p-4 font-medium text-foreground-muted">Último acceso</th>
                  <th className="text-right p-4 font-medium text-foreground-muted">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-foreground-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={roleColors[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={statusColors[user.status]}>
                        {statusLabels[user.status]}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-foreground-secondary">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="p-4 text-sm text-foreground-secondary">
                      {user.last_login ? formatDate(user.last_login) : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <User className="h-4 w-4 mr-2" />
                            Ver perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Enviar email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === 'active' ? (
                            <DropdownMenuItem className="text-error">
                              <Ban className="h-4 w-4 mr-2" />
                              Suspender
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-success">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-foreground-muted">
              Mostrando {filteredUsers.length} de {users.length} usuarios
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">1</Button>
              <Button variant="ghost" size="sm">2</Button>
              <Button variant="ghost" size="sm">3</Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
