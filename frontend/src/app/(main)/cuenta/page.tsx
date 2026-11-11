'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useToast } from '@/stores/uiStore'

export default function CuentaPage() {
  const { profile, user, signOut } = useAuth()
  const router = useRouter()
  const toast = useToast()
  const [name, setName] = useState(profile?.name || '')
  const [avatar, setAvatar] = useState(profile?.avatar_url || '')
  const [password, setPassword] = useState('')
  const [reason, setReason] = useState('')

  const saveProfile = async () => {
    if (!user) return
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim() || null, avatar_url: avatar.trim() || null })
      .eq('id', user.id)
    if (error) toast.error('Error', 'No se pudo guardar el perfil')
    else toast.success('Perfil actualizado')
  }

  const savePassword = async () => {
    if (password.length < 8) {
      toast.error('Contraseña', 'Usa al menos 8 caracteres')
      return
    }
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) toast.error('Error', error.message)
    else {
      setPassword('')
      toast.success('Contraseña actualizada')
    }
  }

  const requestDeletion = async () => {
    if (!window.confirm('¿Enviar la solicitud de eliminación de tu cuenta?')) return
    const res = await fetch('/api/account/delete-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    if (!res.ok) toast.error('Error', 'No se pudo registrar la solicitud')
    else toast.success('Solicitud enviada. El administrador la revisará.')
  }

  return (
    <div className="container-luxury py-10 max-w-xl space-y-6">
      <h1 className="font-display text-3xl font-semibold">Tu cuenta</h1>
      <p className="text-sm text-foreground-muted">{profile?.email || user?.email}</p>
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre" />
          <Input value={avatar} onChange={(event) => setAvatar(event.target.value)} placeholder="URL del avatar" />
          <Button onClick={saveProfile}>Guardar</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Contraseña</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nueva contraseña" />
          <Button onClick={savePassword}>Cambiar contraseña</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Eliminar cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Motivo (opcional)" />
          <Button variant="destructive" onClick={requestDeletion}>
            Solicitar eliminación
          </Button>
        </CardContent>
      </Card>
      <Button
        variant="outline"
        onClick={async () => {
          await signOut()
          router.push('/')
        }}
      >
        Cerrar sesión
      </Button>
    </div>
  )
}
