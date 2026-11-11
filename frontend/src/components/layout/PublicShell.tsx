'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useSiteSettings } from '@/hooks/useSiteSettings'

export function PublicShell({ children }: { children: React.ReactNode }) {
  const { data } = useSiteSettings()
  const { profile, isLoading } = useAuth()
  const maintenance = Boolean(data?.general.maintenanceMode)
  const isAdmin = profile?.role === 'admin'

  if (maintenance && !isLoading && !isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="font-display text-3xl font-semibold">Volvemos pronto</h1>
          <p className="text-foreground-secondary">
            MiPage está en mantenimiento. El sitio público queda en pausa hasta que el administrador lo reactive.
          </p>
          <Link href="/login" className="text-gold underline">
            Entrar como administrador
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {data?.content.bannerEnabled && data.content.bannerText ? (
        <div className="bg-gold/15 text-foreground text-sm text-center px-4 py-2">
          {data.content.bannerText}
        </div>
      ) : null}
      {children}
    </>
  )
}
