'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  User,
  Briefcase,
  Image,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mi Perfil', href: '/dashboard/perfil', icon: User },
  { name: 'Mis Servicios', href: '/dashboard/servicios', icon: Briefcase },
  { name: 'Mi Galería', href: '/dashboard/galeria', icon: Image },
  { name: 'Reseñas', href: '/dashboard/resenas', icon: MessageSquare },
]

// Mock user data
const mockUser = {
  name: 'Valentina Reyes',
  email: 'valentina@email.com',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
  status: 'active' as const,
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-border transform transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <Link href="/" className="flex items-center">
              <span className="font-display text-xl font-semibold text-foreground">
                Mi<span className="text-gold">Page</span>
              </span>
            </Link>
            <button
              className="lg:hidden p-2 hover:bg-muted rounded-lg"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={mockUser.avatar} />
                <AvatarFallback>VR</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{mockUser.name}</p>
                <p className="text-sm text-foreground-muted truncate">{mockUser.email}</p>
              </div>
            </div>
            <div className="mt-3">
              <Badge variant={mockUser.status === 'active' ? 'success' : 'warning'}>
                {mockUser.status === 'active' ? 'Perfil activo' : 'Pendiente de aprobación'}
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gold/10 text-gold'
                      : 'text-foreground-secondary hover:bg-muted hover:text-foreground'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                  {isActive && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-border space-y-1">
            <Link
              href="/perfil/valentina-reyes"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground-secondary hover:bg-muted hover:text-foreground transition-all"
            >
              <User className="h-5 w-5" />
              Ver mi perfil público
            </Link>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-all w-full">
              <LogOut className="h-5 w-5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-white border-b border-border lg:px-8">
          <button
            className="lg:hidden p-2 hover:bg-muted rounded-lg mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-semibold text-foreground">
              {navigation.find((item) => item.href === pathname)?.name || 'Dashboard'}
            </h1>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              Volver al sitio
            </Button>
          </Link>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
