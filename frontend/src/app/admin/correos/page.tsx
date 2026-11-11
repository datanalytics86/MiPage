'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/stores/uiStore'

export default function AdminCorreosPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const pageSize = 30
  const query = useQuery({
    queryKey: ['admin-mail', page],
    enabled: hasSupabaseEnv(),
    queryFn: async () => {
      const supabase = getSupabaseClient()
      const { data, error, count } = await supabase
        .from('notification_log')
        .select('id, email, template, status, error, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, page * pageSize + pageSize - 1)
      if (error) throw error
      return { rows: data || [], total: count ?? 0 }
    },
  })

  const retry = async (id: string) => {
    const res = await fetch(`/api/admin/notifications/${id}/retry`, { method: 'POST' })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      toast.error('No se reenvió', body.error || 'Sin cuerpo guardado')
      return
    }
    toast.success('Reintento registrado')
    await queryClient.invalidateQueries({ queryKey: ['admin-mail'] })
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold">Correos</h2>
      {(query.data?.rows || []).map((row) => (
        <Card key={row.id}>
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
            <div>
              <div className="flex gap-2 items-center">
                <Badge>{row.status}</Badge>
                <span className="font-medium">{row.template}</span>
              </div>
              <p className="text-foreground-muted mt-1">
                {row.email || 'sin destinatario'} · {formatDate(row.created_at)}
                {row.error ? ` · ${row.error}` : ''}
              </p>
            </div>
            {row.status !== 'sent' && (
              <Button size="sm" variant="outline" onClick={() => retry(row.id)}>
                Reintentar
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>
          Anterior
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={(page + 1) * pageSize >= (query.data?.total ?? 0)}
          onClick={() => setPage((value) => value + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}
