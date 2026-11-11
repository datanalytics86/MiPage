import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/adminGuard'
import { recordAudit } from '@/lib/notifications'

const schema = z.object({
  action: z.enum(['hide', 'restore', 'delete']),
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

  if (parsed.data.action === 'delete') {
    const { error } = await gate.supabase.from('reviews').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'No se pudo eliminar' }, { status: 500 })
  } else {
    const { error } = await gate.supabase
      .from('reviews')
      .update({ is_hidden: parsed.data.action === 'hide' })
      .eq('id', id)
    if (error) return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 })
  }

  await recordAudit({
    actorId: gate.actor.id,
    action: `review.${parsed.data.action}`,
    targetType: 'review',
    targetId: id,
  })
  return NextResponse.json({ ok: true })
}
