'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { useToast } from '@/stores/uiStore'

export default function AdminCatalogoPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [category, setCategory] = useState({ slug: '', label: '' })
  const [city, setCity] = useState('')

  const query = useQuery({
    queryKey: ['admin-catalog'],
    enabled: hasSupabaseEnv(),
    queryFn: async () => {
      const supabase = getSupabaseClient()
      const [categories, cities] = await Promise.all([
        supabase.from('categories').select('id, slug, label, is_active').order('sort_order'),
        supabase.from('cities').select('id, name, is_active').order('sort_order'),
      ])
      if (categories.error || cities.error) throw categories.error || cities.error
      return {
        categories: categories.data || [],
        cities: cities.data || [],
      }
    },
  })

  const save = async (body: Record<string, unknown>) => {
    const res = await fetch('/api/admin/catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      toast.error('Error', 'No se pudo guardar el catálogo')
      return
    }
    toast.success('Catálogo actualizado')
    await queryClient.invalidateQueries({ queryKey: ['admin-catalog'] })
    await queryClient.invalidateQueries({ queryKey: ['catalog'] })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Catálogo</h2>
        <p className="text-foreground-muted mt-1">Categorías y ciudades que leen explorar, el registro y el wizard.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Categorías</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(query.data?.categories || []).map((row) => (
            <div key={row.id} className="flex flex-wrap items-center gap-2">
              <Badge>{row.slug}</Badge>
              <span>{row.label}</span>
              <Button size="sm" variant="outline" onClick={() => save({ kind: 'category', id: row.id, is_active: !row.is_active })}>
                {row.is_active ? 'Ocultar' : 'Activar'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (window.confirm(`¿Eliminar la categoría ${row.label}?`)) {
                    void save({ kind: 'category', id: row.id, remove: true })
                  }
                }}
              >
                Eliminar
              </Button>
            </div>
          ))}
          <div className="flex flex-col sm:flex-row gap-2">
            <Input placeholder="slug" value={category.slug} onChange={(event) => setCategory({ ...category, slug: event.target.value })} />
            <Input placeholder="Nombre" value={category.label} onChange={(event) => setCategory({ ...category, label: event.target.value })} />
            <Button
              onClick={() => {
                void save({ kind: 'category', slug: category.slug, label: category.label, is_active: true })
                setCategory({ slug: '', label: '' })
              }}
            >
              Añadir
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Ciudades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(query.data?.cities || []).map((row) => (
            <div key={row.id} className="flex flex-wrap items-center gap-2">
              <span>{row.name}</span>
              <Button size="sm" variant="outline" onClick={() => save({ kind: 'city', id: row.id, is_active: !row.is_active })}>
                {row.is_active ? 'Ocultar' : 'Activar'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (window.confirm(`¿Eliminar ${row.name}?`)) void save({ kind: 'city', id: row.id, remove: true })
                }}
              >
                Eliminar
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input placeholder="Ciudad" value={city} onChange={(event) => setCity(event.target.value)} />
            <Button
              onClick={() => {
                void save({ kind: 'city', name: city, is_active: true })
                setCity('')
              }}
            >
              Añadir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
