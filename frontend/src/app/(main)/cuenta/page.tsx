'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, LogOut, Shield, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AuthGate } from '@/components/auth/AuthGate'
import { useAuth } from '@/contexts/AuthContext'

export default function CuentaPage() {
  const router = useRouter()
  const { profile, provider, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <AuthGate areaLabel="tu cuenta">
      <div className="container-luxury py-12">
        <div className="max-w-lg mx-auto space-y-6">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Cuenta</h1>
            <p className="text-foreground-secondary mt-2 text-sm">
              Datos de sesión. El envío de mail está apagado: cambios de correo o reset los hace el
              operador a mano.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-gold" aria-hidden />
                {profile?.name || 'Usuario'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-foreground-muted">Correo</p>
                <p className="text-foreground">{profile?.email || '—'}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-foreground-muted">Rol</p>
                <Badge variant="secondary">{profile?.role || 'user'}</Badge>
              </div>
              {provider && (
                <div>
                  <p className="text-foreground-muted">Aviso</p>
                  <p className="text-foreground">
                    {provider.display_name} · {provider.status}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                {(profile?.role === 'provider' || profile?.role === 'admin') && (
                  <Button asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                )}
                {profile?.role === 'admin' && (
                  <Button variant="outline" asChild>
                    <Link href="/admin">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" onClick={handleSignOut} className="text-error">
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGate>
  )
}
