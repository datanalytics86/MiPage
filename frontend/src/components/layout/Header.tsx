'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, Heart, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Mock auth state - replace with actual auth
const useAuth = () => ({
  user: null as { name: string; role: string } | null,
  isAuthenticated: false,
})

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/50">
      <div className="container-luxury">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-display text-2xl font-semibold text-foreground">
              Luxe<span className="text-gold">Services</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/explorar"
              className="text-foreground-secondary hover:text-gold transition-colors duration-200 font-medium"
            >
              Explorar
            </Link>
            <Link
              href="/explorar/masajes"
              className="text-foreground-secondary hover:text-gold transition-colors duration-200 font-medium"
            >
              Masajes
            </Link>
            <Link
              href="/explorar/modelaje"
              className="text-foreground-secondary hover:text-gold transition-colors duration-200 font-medium"
            >
              Modelaje
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <Link href="/favoritos">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href={user.role === 'provider' ? '/dashboard' : '/perfil'}>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
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

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border"
            >
              <div className="py-4 space-y-3">
                <Link
                  href="/explorar"
                  className="block px-4 py-2 text-foreground-secondary hover:text-gold hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Explorar
                </Link>
                <Link
                  href="/explorar/masajes"
                  className="block px-4 py-2 text-foreground-secondary hover:text-gold hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Masajes
                </Link>
                <Link
                  href="/explorar/modelaje"
                  className="block px-4 py-2 text-foreground-secondary hover:text-gold hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Modelaje
                </Link>
                <div className="border-t border-border pt-3 mt-3 space-y-2 px-4">
                  {isAuthenticated ? (
                    <>
                      <Link href="/favoritos" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <Heart className="h-5 w-5 mr-2" />
                          Favoritos
                        </Button>
                      </Link>
                      <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <User className="h-5 w-5 mr-2" />
                          Mi cuenta
                        </Button>
                      </Link>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
