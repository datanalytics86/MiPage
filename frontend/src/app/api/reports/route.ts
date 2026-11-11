import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getApiActor } from '@/lib/api/actor'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const schema = z.object({
  reportedType: z.enum(['profile', 'review', 'message', 'photo']),
  reportedId: z.string().min(1).max(200),
  reason: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
})

export async function POST(req: NextRequest) {
  const actor = await getApiActor()
  if (!actor) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('reports').insert({
    reporter_id: actor.id,
    reported_type: parsed.data.reportedType,
    reported_id: parsed.data.reportedId,
    reason: parsed.data.reason.trim(),
    description: parsed.data.description?.trim() || null,
    status: 'pending',
  })
  if (error) return NextResponse.json({ error: 'No se pudo enviar el reporte' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
