'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { useToast } from '@/stores/uiStore'

interface RequestRow {
  id: string
  user_id: string
  reason: string | null
  status: string
  created_at: string
  profile: { email: string; name: string | null } | null
}

export default function AdminSolicitudesPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [confirmById, setConfirmById] = useState<Record<string, string>>({})

  const query = useQuery({
    queryKey: ['admin-deletions'],
    enabled: hasSupabaseEnv(),
    queryFn: async () => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('data_deletion_requests')
        .select('id, user_id, reason, status, created_at, profile:profiles!user_id(email, name)')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return (data || []).map((row) => {
        const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile
        return {
          id: row.id as string,
          user_id: row.user_id as string,
          reason: (row.reason as string | null) ?? null,
          status: row.status as string,
          created_at: row.created_at as string,
          profile: profile
            ? { email: profile.email as string, name: (profile.name as string | null) ?? null }
            : null,
        } satisfies RequestRow
      })
    },
  })

  const act = async (row: RequestRow, action: 'reject' | 'complete') => {
    if (action === 'complete') {
      const typed = (confirmById[row.id] || '').trim().toLowerCase()
      if (typed !== (row.profile?.email || '').toLowerCase()) {
        toast.error('Confirmación', 'Escribe el correo exacto de la cuenta')
        return
      }
      if (!window.confirm(`Esto borra la cuenta ${row.profile?.email} y sus archivos. ¿Continuar?`)) return
    }
    const res = await fetch(`/api/admin/deletion-requests/${row.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        confirmEmail: action === 'complete' ? confirmById[row.id] : undefined,
      }),
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      toast.error('Error', body.error || 'No se pudo procesar')
      return
    }
    toast.success(action === 'complete' ? 'Cuenta eliminada' : 'Solicitud rechazada')
    await queryClient.invalidateQueries({ queryKey: ['admin-deletions'] })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Solicitudes de borrado</h2>
        <p className="text-foreground-muted mt-1">Completar borra Storage y la cuenta de Auth.</p>
      </div>
      {(query.data || []).map((row) => (
        <Card key={row.id}>
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <Badge>{row.status}</Badge>
              <span className="font-medium">{row.profile?.email || row.user_id}</span>
            </div>
            {row.reason && <p className="text-sm">{row.reason}</p>}
            {row.status === 'pending' && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Escribe el correo para confirmar"
                  value={confirmById[row.id] || ''}
                  onChange={(event) =>
                    setConfirmById((current) => ({ ...current, [row.id]: event.target.value }))
                  }
                />
                <Button size="sm" variant="destructive" onClick={() => act(row, 'complete')}>
                  Completar
                </Button>
                <Button size="sm" variant="outline" onClick={() => act(row, 'reject')}>
                  Rechazar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {!query.isLoading && (query.data || []).length === 0 && (
        <p className="text-sm text-foreground-muted">No hay solicitudes.</p>
      )}
    </div>
  )
}
