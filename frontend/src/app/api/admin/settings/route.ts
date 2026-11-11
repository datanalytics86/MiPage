import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/adminGuard'
import { recordAudit } from '@/lib/notifications'
import { mergeSettings } from '@/lib/publicSettings'

const schema = z.object({
  general: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  email: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  security: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  payments: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  content: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  moderation: z.object({ rejectionReasons: z.array(z.string().min(1).max(500)).max(30) }).optional(),
})

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
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const current = await gate.supabase.from('site_settings').select('key, value')
  const before = mergeSettings(current.data)

  const existingByKey = new Map(
    (current.data || []).map((row) => [row.key as string, row.value])
  )

  for (const [key, value] of Object.entries(parsed.data)) {
    if (!value) continue
    const previous = existingByKey.get(key)
    const base =
      previous && typeof previous === 'object' && !Array.isArray(previous)
        ? { ...(previous as Record<string, unknown>) }
        : {}
    const { error } = await gate.supabase.from('site_settings').upsert({
      key,
      value: { ...base, ...value },
      updated_at: new Date().toISOString(),
      updated_by: gate.actor.id,
    })
    if (error) {
      return NextResponse.json({ error: 'No se pudo guardar' }, { status: 500 })
    }
  }

  await recordAudit({
    actorId: gate.actor.id,
    action: 'settings.update',
    targetType: 'site_settings',
    targetId: 'all',
    before: before as unknown as Record<string, unknown>,
    after: parsed.data as Record<string, unknown>,
  })

  return NextResponse.json({ ok: true })
}
