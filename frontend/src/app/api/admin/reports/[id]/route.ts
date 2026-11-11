import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/adminGuard'
import { recordAudit } from '@/lib/notifications'

const schema = z.object({
  action: z.enum(['dismiss', 'suspend_profile', 'hide_review']),
  note: z.string().max(1000).optional(),
})

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdmin()
  if (gate.error) return gate.error
  const { id } = await context.params

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const { data: report } = await gate.supabase
    .from('reports')
    .select('id, reported_type, reported_id, status')
    .eq('id', id)
    .maybeSingle()
  if (!report) return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 })

  if (parsed.data.action === 'suspend_profile') {
    const column = report.reported_type === 'profile' ? 'slug' : 'id'
    const { data: provider } = await gate.supabase
      .from('providers')
      .select('id, user_id')
      .eq(column, report.reported_id)
      .maybeSingle()
    if (provider) {
      await gate.supabase.from('providers').update({ status: 'suspended' }).eq('id', provider.id)
      await gate.supabase.from('profiles').update({ is_suspended: true }).eq('id', provider.user_id)
    }
  }

  if (parsed.data.action === 'hide_review') {
    await gate.supabase.from('reviews').update({ is_hidden: true }).eq('id', report.reported_id)
  }

  const status = parsed.data.action === 'dismiss' ? 'dismissed' : 'resolved'
  const { error } = await gate.supabase
    .from('reports')
    .update({
      status,
      resolved_by: gate.actor.id,
      resolved_at: new Date().toISOString(),
      resolution_note: parsed.data.note?.trim() || parsed.data.action,
    })
    .eq('id', id)
  if (error) return NextResponse.json({ error: 'No se pudo cerrar el reporte' }, { status: 500 })

  await recordAudit({
    actorId: gate.actor.id,
    action: `report.${parsed.data.action}`,
    targetType: 'report',
    targetId: id,
    before: report,
    after: { status },
  })
  return NextResponse.json({ ok: true })
}
