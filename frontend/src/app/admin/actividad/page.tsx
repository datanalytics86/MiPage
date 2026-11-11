'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { formatDate } from '@/lib/utils'

export default function AdminActividadPage() {
  const [page, setPage] = useState(0)
  const pageSize = 30
  const query = useQuery({
    queryKey: ['admin-audit', page],
    enabled: hasSupabaseEnv(),
    queryFn: async () => {
      const supabase = getSupabaseClient()
      const { data, error, count } = await supabase
        .from('admin_audit_log')
        .select('id, actor_id, action, target_type, target_id, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, page * pageSize + pageSize - 1)
      if (error) throw error
      return { rows: data || [], total: count ?? 0 }
    },
  })

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold">Actividad</h2>
      {(query.data?.rows || []).map((row) => (
        <Card key={row.id}>
          <CardContent className="p-4 text-sm">
            <p className="font-medium">{row.action}</p>
            <p className="text-foreground-muted">
              {row.target_type} {row.target_id} · {formatDate(row.created_at)} · {row.actor_id}
            </p>
          </CardContent>
        </Card>
      ))}
      {query.isError && (
        <p className="text-sm text-foreground-muted">
          El historial aparece cuando la migración 007 está aplicada y hay service role para escribirlo.
        </p>
      )}
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
