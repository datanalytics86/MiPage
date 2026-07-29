'use client'

import React, { useMemo, useState } from 'react'
import { Plus, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DEFAULT_METADATA_FIELDS,
  validateFieldKey,
  type MetadataFieldDef,
  type MetadataFieldType,
} from '@/lib/metadataFields'
import { getSupabaseClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { useToast } from '@/stores/uiStore'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export default function AdminMetadataPage() {
  const toast = useToast()
  const qc = useQueryClient()
  const [draft, setDraft] = useState({
    key: '',
    label: '',
    field_type: 'text' as MetadataFieldType,
    category: 'servicio',
    is_required: false,
    applies_to: '*',
  })

  const { data: fields = DEFAULT_METADATA_FIELDS, isLoading } = useQuery({
    queryKey: ['admin', 'metadata_fields'],
    queryFn: async (): Promise<MetadataFieldDef[]> => {
      if (!hasSupabaseEnv()) return DEFAULT_METADATA_FIELDS
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('metadata_fields')
        .select('*')
        .order('sort_order')
      if (error) {
        // table may not exist pre-migration
        console.warn(error.message)
        return DEFAULT_METADATA_FIELDS
      }
      return (data || []).map((row) => ({
        id: row.id,
        key: row.key,
        label: row.label,
        field_type: row.field_type,
        category: row.category,
        options: Array.isArray(row.options) ? row.options : [],
        is_required: row.is_required,
        is_active: row.is_active,
        sort_order: row.sort_order,
        applies_to: row.applies_to || ['*'],
        help_text: row.help_text,
      }))
    },
  })

  const sorted = useMemo(
    () => [...fields].sort((a, b) => a.sort_order - b.sort_order),
    [fields]
  )

  const createField = async () => {
    const keyCheck = validateFieldKey(draft.key)
    if (!keyCheck.ok) {
      toast.error('Key inválida', keyCheck.message)
      return
    }
    if (!draft.label.trim()) {
      toast.error('Label requerido')
      return
    }
    if (!hasSupabaseEnv()) {
      toast.error('Supabase no configurado')
      return
    }
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('metadata_fields').insert({
        key: draft.key,
        label: draft.label,
        field_type: draft.field_type,
        category: draft.category,
        is_required: draft.is_required,
        applies_to: draft.applies_to === '*' ? ['*'] : [draft.applies_to],
        sort_order: fields.length + 1,
        is_active: true,
      })
      if (error) throw error
      toast.success('Campo creado')
      setDraft({
        key: '',
        label: '',
        field_type: 'text',
        category: 'servicio',
        is_required: false,
        applies_to: '*',
      })
      qc.invalidateQueries({ queryKey: ['admin', 'metadata_fields'] })
    } catch (e) {
      toast.error(
        'No se pudo crear',
        e instanceof Error ? e.message : 'Ejecuta migration 006'
      )
    }
  }

  const toggleActive = async (field: MetadataFieldDef) => {
    if (!hasSupabaseEnv() || field.id.startsWith('local-')) {
      toast.error('Solo demo local — ejecuta migration 006 en Supabase')
      return
    }
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('metadata_fields')
      .update({ is_active: !field.is_active })
      .eq('id', field.id)
    if (error) toast.error(error.message)
    else {
      toast.success(field.is_active ? 'Desactivado' : 'Activado')
      qc.invalidateQueries({ queryKey: ['admin', 'metadata_fields'] })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Campos de metadata</h2>
        <p className="text-foreground-muted mt-1">
          Define campos dinámicos del aviso (experiencia, medidas, etc.). Requiere migration 006.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nuevo campo</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Key (snake_case)</Label>
            <Input
              value={draft.key}
              onChange={(e) => setDraft({ ...draft, key: e.target.value })}
              placeholder="years_experience"
            />
          </div>
          <div>
            <Label>Label</Label>
            <Input
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              placeholder="Años de experiencia"
            />
          </div>
          <div>
            <Label>Tipo</Label>
            <Select
              value={draft.field_type}
              onValueChange={(v) => setDraft({ ...draft, field_type: v as MetadataFieldType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['text', 'textarea', 'number', 'select', 'url', 'phone', 'checkbox'].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Aplica a</Label>
            <Select
              value={draft.applies_to}
              onValueChange={(v) => setDraft({ ...draft, applies_to: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="*">Todas las categorías</SelectItem>
                <SelectItem value="masajes">Masajes</SelectItem>
                <SelectItem value="modelaje">Modelaje</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Button onClick={createField}>
              <Plus className="h-4 w-4 mr-2" />
              Crear campo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Campos actuales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-sm text-foreground-muted">Cargando…</p>}
          {sorted.map((field) => (
            <div
              key={field.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-xl p-4"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{field.label}</span>
                  <Badge variant="secondary">{field.key}</Badge>
                  <Badge>{field.field_type}</Badge>
                  {field.is_required && <Badge className="bg-warning/10 text-warning">required</Badge>}
                  {!field.is_active && <Badge className="bg-muted">inactivo</Badge>}
                </div>
                <p className="text-xs text-foreground-muted mt-1">
                  {field.category} · aplica: {(field.applies_to || []).join(', ')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toggleActive(field)}>
                  <Save className="h-4 w-4 mr-1" />
                  {field.is_active ? 'Desactivar' : 'Activar'}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
