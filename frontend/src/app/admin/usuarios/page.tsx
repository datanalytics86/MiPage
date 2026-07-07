'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, MoreHorizontal, User, Mail, Shield } from 'lucide-react'
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
import { formatDate } from '@/lib/utils'
import { useAdminUsers, useUpdateUserRole } from '@/hooks/useAdmin'
import { useToast } from '@/stores/uiStore'
import type { UserRole } from '@/types/database'

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

export default function AdminUsuariosPage() {
  const toast = useToast()
  const { data: users = [], isLoading } = useAdminUsers()
  const updateRole = useUpdateUserRole()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const filteredUsers = users.filter((user) => {
    const name = user.name || ''
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const changeRole = async (id: string, role: UserRole) => {
    try {
      await updateRole.mutateAsync({ id, role })
      toast.success('Rol actualizado')
    } catch {
      toast.error('Error', 'No se pudo cambiar el rol')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Gestión de Usuarios</h2>
        <p className="text-foreground-muted mt-1">Administra roles y cuentas de la plataforma</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-semibold">{users.length}</p><p className="text-sm text-foreground-muted">Total</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-semibold text-success">{users.filter((u) => u.role === 'user').length}</p><p className="text-sm text-foreground-muted">Clientes</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-semibold text-gold">{users.filter((u) => u.role === 'provider').length}</p><p className="text-sm text-foreground-muted">Proveedores</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-semibold text-warning">{users.filter((u) => u.role === 'admin').length}</p><p className="text-sm text-foreground-muted">Admins</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="user">Usuario</SelectItem>
              <SelectItem value="provider">Proveedor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-foreground-muted">Cargando usuarios...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-foreground-muted font-medium">Usuario</th>
                    <th className="text-left p-4 text-foreground-muted font-medium">Rol</th>
                    <th className="text-left p-4 text-foreground-muted font-medium">Registro</th>
                    <th className="text-right p-4 text-foreground-muted font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name || 'Sin nombre'}</p>
                            <p className="text-sm text-foreground-muted">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={roleColors[user.role]}>{roleLabels[user.role]}</Badge>
                      </td>
                      <td className="p-4 text-sm text-foreground-secondary">{formatDate(user.created_at)}</td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <a href={`mailto:${user.email}`}><Mail className="h-4 w-4 mr-2" />Enviar email</a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => changeRole(user.id, 'user')}>Rol: Usuario</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeRole(user.id, 'provider')}>Rol: Proveedor</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeRole(user.id, 'admin')}>
                              <Shield className="h-4 w-4 mr-2" />Rol: Admin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}