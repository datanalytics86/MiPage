'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Flag,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { AuthGate } from '@/components/auth/AuthGate'
import { useAdminProviders } from '@/hooks/useAdmin'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Usuarios',
    href: '/admin/usuarios',
    icon: Users,
  },
  {
    name: 'Moderación',
    href: '/admin/proveedores',
    icon: UserCheck,
  },
  {
    name: 'Metadata',
    href: '/admin/metadata',
    icon: Settings,
  },
  {
    name: 'Reportes',
    href: '/admin/reportes',
    icon: Flag,
  },
  {
    name: 'Configuración',
    href: '/admin/configuracion',
    icon: Settings,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { profile, user } = useAuth()
  const { data: adminProviders = [] } = useAdminProviders()
  const pendingCount = adminProviders.filter((p) => p.status === 'pending').length
  const adminLabel = profile?.name || user?.email || 'Admin'
  const adminEmail = user?.email || profile?.email || ''

  return (
    <AuthGate allowRoles={['admin']} areaLabel="el panel de administración">
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-display text-lg font-semibold text-foreground">
                  Mi<span className="text-gold">Admin</span>
                </span>
              </div>
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-muted"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                    isActive
                      ? 'bg-gold/10 text-gold'
                      : 'text-foreground-secondary hover:text-foreground hover:bg-muted'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  {item.href === '/admin/proveedores' && pendingCount > 0 && (
                    <Badge variant="warning" className="ml-auto">
                      {pendingCount}
                    </Badge>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="admin-nav-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gold rounded-r-full"
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Admin User */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>{adminLabel.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {adminLabel}
                </p>
                <p className="text-xs text-foreground-muted truncate">
                  {adminEmail || 'Sesión admin'}
                </p>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost" className="w-full mt-2 justify-start text-foreground-muted">
                <LogOut className="h-4 w-4 mr-2" />
                Volver al sitio
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-muted"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="font-display text-xl font-semibold text-foreground">
                Panel de Administración
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/proveedores?status=pending">
                  Pendientes
                  {pendingCount > 0 && (
                    <Badge variant="warning" className="ml-2">
                      {pendingCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
    </AuthGate>
  )
}
