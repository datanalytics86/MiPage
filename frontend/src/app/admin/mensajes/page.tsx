'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { sanitizePostgrestSearch } from '@/lib/filters'
import { useToast } from '@/stores/uiStore'

interface MessageRow {
  id: string
  name: string
  email: string
  reason: string
  message: string
  status: string
  created_at: string
}

export default function AdminMensajesPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [reply, setReply] = useState<Record<string, string>>({})
  const pageSize = 20

  const query = useQuery({
    queryKey: ['admin-messages', q, page],
    enabled: hasSupabaseEnv(),
    queryFn: async () => {
      const supabase = getSupabaseClient()
      let request = supabase
        .from('contact_messages')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
      const term = sanitizePostgrestSearch(q)
      if (term) request = request.or(`name.ilike.%${term}%,email.ilike.%${term}%,message.ilike.%${term}%`)
      const { data, error, count } = await request.range(page * pageSize, page * pageSize + pageSize - 1)
      if (error) throw error
      return { rows: (data || []) as MessageRow[], total: count ?? 0 }
    },
  })

  const act = async (id: string, body: { status?: string; reply?: string }) => {
    if (body.reply && !window.confirm('¿Enviar esta respuesta por correo?')) return
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      toast.error('Error', 'No se pudo actualizar el mensaje')
      return
    }
    toast.success(body.reply ? 'Respuesta enviada' : 'Estado actualizado')
    await queryClient.invalidateQueries({ queryKey: ['admin-messages'] })
  }

  const rows = query.data?.rows ?? []
  const total = query.data?.total ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Mensajes</h2>
        <p className="text-foreground-muted mt-1">Bandeja de contacto. {total} en total.</p>
      </div>
      <Input
        placeholder="Buscar por nombre, correo o texto"
        value={q}
        onChange={(event) => {
          setPage(0)
          setQ(event.target.value)
        }}
      />
      {query.isLoading ? (
        <div className="h-32 rounded-xl bg-muted" />
      ) : (
        rows.map((row) => (
          <Card key={row.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{row.status}</Badge>
                <span className="font-medium">{row.name}</span>
                <span className="text-sm text-foreground-muted">{row.email}</span>
                <span className="text-sm text-foreground-muted">{row.reason}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{row.message}</p>
              <textarea
                className="w-full rounded-control border border-border bg-background px-3 py-2 text-sm"
                rows={3}
                placeholder="Respuesta"
                value={reply[row.id] || ''}
                onChange={(event) => setReply((current) => ({ ...current, [row.id]: event.target.value }))}
              />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => act(row.id, { reply: reply[row.id] })} disabled={(reply[row.id] || '').trim().length < 2}>
                  Responder
                </Button>
                <Button size="sm" variant="outline" onClick={() => act(row.id, { status: 'archived' })}>
                  Archivar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => act(row.id, { status: 'new' })}>
                  Marcar nuevo
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
      <Pager page={page} pageSize={pageSize} total={total} onPage={setPage} />
    </div>
  )
}

function Pager({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number
  pageSize: number
  total: number
  onPage: (page: number) => void
}) {
  return (
    <div className="flex items-center justify-between text-sm text-foreground-muted">
      <span>{total} registros</span>
      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="sm" disabled={page === 0} onClick={() => onPage(page - 1)}>
          Anterior
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled={(page + 1) * pageSize >= total} onClick={() => onPage(page + 1)}>
          Siguiente
        </Button>
      </div>
    </div>
  )
}
