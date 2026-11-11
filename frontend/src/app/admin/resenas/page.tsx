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

interface ReviewRow {
  id: string
  rating: number
  comment: string
  is_hidden: boolean
  created_at: string
  provider: { display_name: string; slug: string } | null
}

export default function AdminResenasPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 20

  const query = useQuery({
    queryKey: ['admin-reviews', q, page],
    enabled: hasSupabaseEnv(),
    queryFn: async () => {
      const supabase = getSupabaseClient()
      let request = supabase
        .from('reviews')
        .select('id, rating, comment, is_hidden, created_at, provider:providers!provider_id(display_name, slug)', {
          count: 'exact',
        })
        .order('created_at', { ascending: false })
      const term = sanitizePostgrestSearch(q)
      if (term) request = request.ilike('comment', `%${term}%`)
      const { data, error, count } = await request.range(page * pageSize, page * pageSize + pageSize - 1)
      if (error) throw error
      const rows = (data || []).map((row) => {
        const provider = Array.isArray(row.provider) ? row.provider[0] : row.provider
        return {
          id: row.id as string,
          rating: Number(row.rating) || 0,
          comment: (row.comment as string) || '',
          is_hidden: Boolean(row.is_hidden),
          created_at: row.created_at as string,
          provider: provider
            ? { display_name: provider.display_name as string, slug: provider.slug as string }
            : null,
        } satisfies ReviewRow
      })
      return { rows, total: count ?? 0 }
    },
  })

  const act = async (id: string, action: 'hide' | 'restore' | 'delete') => {
    if (action === 'delete' && !window.confirm('¿Eliminar esta reseña? No se puede deshacer.')) return
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (!res.ok) {
      toast.error('Error', 'No se pudo moderar la reseña')
      return
    }
    toast.success('Reseña actualizada')
    await queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
  }

  const rows = query.data?.rows ?? []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Reseñas</h2>
        <p className="text-foreground-muted mt-1">Ocultar, restaurar o eliminar.</p>
      </div>
      <Input
        placeholder="Buscar en el comentario"
        value={q}
        onChange={(event) => {
          setPage(0)
          setQ(event.target.value)
        }}
      />
      {rows.map((row) => (
        <Card key={row.id}>
          <CardContent className="p-4 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{row.rating}/5</Badge>
              {row.is_hidden && <Badge variant="secondary">Oculta</Badge>}
              <span className="font-medium">{row.provider?.display_name || 'Perfil'}</span>
            </div>
            <p className="text-sm">{row.comment}</p>
            <div className="flex gap-2">
              {row.is_hidden ? (
                <Button size="sm" variant="outline" onClick={() => act(row.id, 'restore')}>
                  Restaurar
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => act(row.id, 'hide')}>
                  Ocultar
                </Button>
              )}
              <Button size="sm" variant="destructive" onClick={() => act(row.id, 'delete')}>
                Eliminar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-end gap-2">
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
