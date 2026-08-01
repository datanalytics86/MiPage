'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Shield, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { hasSupabaseEnv } from '@/lib/supabase/env'

type AuthGateProps = {
  children: React.ReactNode
  /** When set, only these roles may continue (after auth). */
  allowRoles?: Array<'provider' | 'admin' | 'user'>
  /** Human label for the protected area (dashboard, admin, …). */
  areaLabel?: string
}

/**
 * Client-side gate for /dashboard and /admin.
 * Complements middleware (which may be skipped when Supabase env is absent
 * or on some monorepo deploy configs). Unauthenticated users get a clear
 * login CTA — never a blank shell of privileged UI.
 */
export function AuthGate({
  children,
  allowRoles,
  areaLabel = 'esta sección',
}: AuthGateProps) {
  const { isAuthenticated, isLoading, profile } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const loginHref = `/login?redirect=${encodeURIComponent(pathname || '/')}`

  useEffect(() => {
    if (isLoading) return
    if (!hasSupabaseEnv()) return
    if (!isAuthenticated) {
      router.replace(loginHref)
    }
  }, [isLoading, isAuthenticated, loginHref, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div
          className="h-10 w-48 rounded-xl bg-muted overflow-hidden relative before:absolute before:inset-0 before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent"
          aria-busy
          aria-label="Cargando sesión"
        />
      </div>
    )
  }

  if (!hasSupabaseEnv()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4 rounded-2xl border border-border bg-card p-8 shadow-soft">
          <Shield className="h-10 w-10 text-gold mx-auto" aria-hidden />
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Acceso no disponible
          </h1>
          <p className="text-foreground-secondary text-sm leading-relaxed">
            La autenticación no está configurada en este entorno. {areaLabel}{' '}
            requiere Supabase. Mientras tanto puedes explorar el catálogo público.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild>
              <Link href="/explorar">Explorar profesionales</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4 rounded-2xl border border-border bg-card p-8 shadow-soft">
          <LogIn className="h-10 w-10 text-gold mx-auto" aria-hidden />
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Inicia sesión para continuar
          </h1>
          <p className="text-foreground-secondary text-sm leading-relaxed">
            Necesitas una cuenta para acceder a {areaLabel}.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild>
              <Link href={loginHref}>Iniciar sesión</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register">Crear cuenta</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (allowRoles && profile && !allowRoles.includes(profile.role as 'provider' | 'admin' | 'user')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4 rounded-2xl border border-border bg-card p-8 shadow-soft">
          <Shield className="h-10 w-10 text-gold mx-auto" aria-hidden />
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Sin permisos
          </h1>
          <p className="text-foreground-secondary text-sm leading-relaxed">
            Tu cuenta no tiene acceso a {areaLabel}.
          </p>
          <Button asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
