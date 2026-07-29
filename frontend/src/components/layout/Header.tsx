'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, Heart, LogOut, LayoutDashboard, Shield, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/lib/site'

const navLinks = [
  { href: '/explorar', label: 'Explorar', match: (path: string) => path === '/explorar' },
  { href: '/explorar/masajes', label: 'Masajes', match: (path: string) => path.startsWith('/explorar/masajes') },
  { href: '/explorar/modelaje', label: 'Modelaje', match: (path: string) => path.startsWith('/explorar/modelaje') },
]

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [headerSearch, setHeaderSearch] = useState('')
  const { profile, isAuthenticated, isLoading, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = headerSearch.trim()
    router.push(q ? `/explorar?q=${encodeURIComponent(q)}` : '/explorar')
    setIsMenuOpen(false)
  }

  const navLinkClass = (isActive: boolean) =>
    cn(
      'transition-colors duration-200 font-medium relative py-1',
      isActive
        ? 'text-gold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gold after:rounded-full'
        : 'text-foreground-secondary hover:text-gold'
    )

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/50">
      <div className="container-luxury">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <span className="font-display text-2xl font-semibold text-foreground">
              {siteConfig.name.slice(0, 2)}
              <span className="text-gold">{siteConfig.name.slice(2)}</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass(link.match(pathname))}>
                {link.label}
              </Link>
            ))}
          </nav>

          <form
            onSubmit={handleHeaderSearch}
            className="hidden md:flex flex-1 max-w-xs lg:max-w-sm relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <Input
              type="search"
              placeholder="Buscar..."
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              className="pl-9 h-9 text-sm rounded-xl bg-muted/50 border-transparent focus-visible:border-gold/30"
            />
          </form>

          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            {isLoading ? (
              <div className="h-10 w-24 bg-muted animate-pulse rounded-lg" />
            ) : isAuthenticated && profile ? (
              <>
                <Link href="/favoritos">
                  <Button variant="ghost" size="icon" aria-label="Favoritos">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback>
                          {profile.name?.[0] || profile.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:inline">
                        {profile.name?.split(' ')[0] || 'Usuario'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{profile.name || 'Usuario'}</p>
                      <p className="text-xs text-foreground-muted">{profile.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    {profile.role === 'provider' && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Mi Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {profile.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Shield className="h-4 w-4 mr-2" />
                          Panel Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/favoritos">
                        <Heart className="h-4 w-4 mr-2" />
                        Favoritos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-error">
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Iniciar sesión</Button>
                </Link>
                <Link href="/register">
                  <Button>Registrarse</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-border animate-fade-in">
            <div className="py-4 space-y-3">
              <form onSubmit={handleHeaderSearch} className="px-4 relative">
                <Search
                  className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted"
                  aria-hidden
                />
                <Input
                  type="search"
                  placeholder="Buscar profesionales..."
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  className="pl-9"
                  aria-label="Buscar profesionales"
                />
              </form>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'block px-4 py-2 rounded-lg transition-colors',
                    link.match(pathname)
                      ? 'text-gold bg-gold/10 font-medium'
                      : 'text-foreground-secondary hover:text-gold hover:bg-muted'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border pt-3 mt-3 space-y-2 px-4">
                {isAuthenticated && profile ? (
                  <>
                    <Link href="/favoritos" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Heart className="h-5 w-5 mr-2" aria-hidden />
                        Favoritos
                      </Button>
                    </Link>
                    {profile.role === 'provider' && (
                      <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <LayoutDashboard className="h-5 w-5 mr-2" aria-hidden />
                          Mi Dashboard
                        </Button>
                      </Link>
                    )}
                    {profile.role === 'admin' && (
                      <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <Shield className="h-5 w-5 mr-2" aria-hidden />
                          Panel Admin
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-error"
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                    >
                      <LogOut className="h-5 w-5 mr-2" aria-hidden />
                      Cerrar sesión
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Iniciar sesión
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full">Registrarse</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}