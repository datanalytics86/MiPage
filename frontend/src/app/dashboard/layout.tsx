'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  User,
  Briefcase,
  Image,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronRight,
  PlusCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Publicar aviso', href: '/dashboard/avisos/nuevo', icon: PlusCircle },
  { name: 'Mi Perfil', href: '/dashboard/perfil', icon: User },
  { name: 'Mis Servicios', href: '/dashboard/servicios', icon: Briefcase },
  { name: 'Mi Galería', href: '/dashboard/galeria', icon: Image },
  { name: 'Reseñas', href: '/dashboard/resenas', icon: MessageSquare },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { profile, provider, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const displayName = provider?.display_name || profile?.name || 'Proveedor'
  const email = profile?.email || ''
  const avatar = profile?.avatar_url || provider?.cover_photo || undefined
  const isActive = provider?.status === 'approved'

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-border transform transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <Link href="/" className="font-display text-xl font-semibold">
              Mi<span className="text-gold">Page</span>
            </Link>
            <button className="lg:hidden p-2" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatar} />
                <AvatarFallback>{displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{displayName}</p>
                <p className="text-sm text-foreground-muted truncate">{email}</p>
              </div>
            </div>
            <div className="mt-3">
              <Badge variant={isActive ? 'success' : 'warning'}>
                {isActive ? 'Perfil publicado' : `Estado: ${provider?.status || 'pendiente'}`}
              </Badge>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    active ? 'bg-gold/10 text-gold' : 'text-foreground-secondary hover:bg-muted'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                  {active && <ChevronRight className="h-4 w-4 ml-auto" />}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-border space-y-1">
            {provider?.slug && (
              <Link
                href={`/perfil/${provider.slug}`}
                target="_blank"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-foreground-secondary hover:bg-muted"
              >
                <User className="h-5 w-5" />
                Ver perfil público
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-error hover:bg-error/10 w-full"
            >
              <LogOut className="h-5 w-5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-white border-b border-border lg:px-8">
          <button className="lg:hidden p-2 mr-4" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="font-display text-xl font-semibold flex-1">
            {navigation.find((item) => item.href === pathname)?.name || 'Dashboard'}
          </h1>
          <Link href="/">
            <Button variant="outline" size="sm">Volver al sitio</Button>
          </Link>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}