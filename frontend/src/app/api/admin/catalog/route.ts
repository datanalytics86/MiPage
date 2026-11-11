import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/adminGuard'
import { recordAudit } from '@/lib/notifications'

const categorySchema = z.object({
  kind: z.literal('category'),
  id: z.string().uuid().optional(),
  slug: z.string().regex(/^[a-z0-9-]{2,40}$/).optional(),
  label: z.string().min(2).max(60).optional(),
  is_active: z.boolean().optional(),
  remove: z.boolean().optional(),
})

const citySchema = z.object({
  kind: z.literal('city'),
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(80).optional(),
  is_active: z.boolean().optional(),
  remove: z.boolean().optional(),
})

const schema = z.discriminatedUnion('kind', [categorySchema, citySchema])

export async function POST(req: NextRequest) {
  const gate = await requireAdmin()
  if (gate.error) return gate.error

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const table = parsed.data.kind === 'category' ? 'categories' : 'cities'
  if (parsed.data.remove) {
    if (!parsed.data.id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })
    const { error } = await gate.supabase.from(table).delete().eq('id', parsed.data.id)
    if (error) return NextResponse.json({ error: 'No se pudo eliminar' }, { status: 500 })
  } else if (parsed.data.id) {
    const updates =
      parsed.data.kind === 'category'
        ? { slug: parsed.data.slug, label: parsed.data.label, is_active: parsed.data.is_active }
        : { name: parsed.data.name, is_active: parsed.data.is_active }
    const { error } = await gate.supabase.from(table).update(updates).eq('id', parsed.data.id)
    if (error) return NextResponse.json({ error: 'No se pudo guardar' }, { status: 500 })
  } else {
    const row =
      parsed.data.kind === 'category'
        ? { slug: parsed.data.slug, label: parsed.data.label, is_active: parsed.data.is_active ?? true }
        : { name: parsed.data.name, is_active: parsed.data.is_active ?? true }
    const { error } = await gate.supabase.from(table).insert(row as Record<string, unknown>)
    if (error) return NextResponse.json({ error: 'No se pudo crear' }, { status: 500 })
  }

  await recordAudit({
    actorId: gate.actor.id,
    action: 'catalog.update',
    targetType: table,
    targetId: parsed.data.id || parsed.data.kind,
    after: parsed.data,
  })
  return NextResponse.json({ ok: true })
}
