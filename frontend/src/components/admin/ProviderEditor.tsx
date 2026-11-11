'use client'

import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminKeys, type AdminProviderRow } from '@/hooks/useAdmin'
import { useToast } from '@/stores/uiStore'

export function ProviderEditor({ provider }: { provider: AdminProviderRow }) {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    display_name: provider.display_name,
    bio: provider.bio || '',
    category: provider.category,
    city: provider.city,
    whatsapp: provider.whatsapp || '',
    instagram: provider.instagram || '',
    is_featured: provider.is_featured,
  })
  const [days, setDays] = useState('30')

  const save = async () => {
    const res = await fetch(`/api/admin/providers/${provider.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        display_name: form.display_name,
        bio: form.bio || null,
        category: form.category,
        city: form.city,
        whatsapp: form.whatsapp || null,
        instagram: form.instagram || null,
        is_featured: form.is_featured,
        featuredDays: form.is_featured ? Number(days) || 30 : undefined,
      }),
    })
    if (!res.ok) {
      toast.error('Error', 'No se pudo guardar el aviso')
      return
    }
    toast.success('Aviso actualizado')
    await queryClient.invalidateQueries({ queryKey: adminKeys.providers() })
  }

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <p className="text-sm font-medium">Editar aviso</p>
      {provider.services.length > 0 && (
        <ul className="text-sm text-foreground-secondary space-y-1">
          {provider.services.map((service) => (
            <li key={service.name}>
              {service.name} · ${service.price.toLocaleString('es-CL')}
            </li>
          ))}
        </ul>
      )}
      <Input value={form.display_name} onChange={(event) => setForm({ ...form, display_name: event.target.value })} />
      <div className="grid grid-cols-2 gap-2">
        <Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
        <Input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
      </div>
      <textarea
        className="w-full rounded-control border border-border bg-background px-3 py-2 text-sm"
        rows={4}
        value={form.bio}
        onChange={(event) => setForm({ ...form, bio: event.target.value })}
      />
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="WhatsApp" value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} />
        <Input placeholder="Instagram" value={form.instagram} onChange={(event) => setForm({ ...form, instagram: event.target.value })} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.is_featured}
          onChange={(event) => setForm({ ...form, is_featured: event.target.checked })}
        />
        Destacado
        <Input className="w-24" value={days} onChange={(event) => setDays(event.target.value)} aria-label="Días de destacado" />
        días
      </label>
      <Button type="button" size="sm" onClick={save}>
        Guardar cambios
      </Button>
    </div>
  )
}
