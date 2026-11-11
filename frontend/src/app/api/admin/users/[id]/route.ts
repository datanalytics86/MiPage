import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/adminGuard'
import { recordAudit } from '@/lib/notifications'

const schema = z.object({
  role: z.enum(['user', 'provider', 'admin']).optional(),
  suspend: z.boolean().optional(),
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

  const { data: before } = await gate.supabase
    .from('profiles')
    .select('id, role, is_suspended, email')
    .eq('id', id)
    .maybeSingle()
  if (!before) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  if (parsed.data.role && parsed.data.role !== 'admin' && before.role === 'admin') {
    const { count } = await gate.supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin')
    if ((count ?? 0) <= 1) {
      return NextResponse.json({ error: 'No puedes quitar al último administrador' }, { status: 409 })
    }
  }

  const updates: Record<string, unknown> = {}
  if (parsed.data.role) updates.role = parsed.data.role
  if (typeof parsed.data.suspend === 'boolean') updates.is_suspended = parsed.data.suspend

  if (Object.keys(updates).length) {
    const { error } = await gate.supabase.from('profiles').update(updates).eq('id', id)
    if (error) return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 })
  }

  if (parsed.data.suspend === true) {
    await gate.supabase.from('providers').update({ status: 'suspended' }).eq('user_id', id)
  }
  if (parsed.data.suspend === false) {
    await gate.supabase
      .from('providers')
      .update({ status: 'pending' })
      .eq('user_id', id)
      .eq('status', 'suspended')
  }

  await recordAudit({
    actorId: gate.actor.id,
    action: parsed.data.suspend === undefined ? 'user.role' : 'user.suspend',
    targetType: 'profile',
    targetId: id,
    before,
    after: { ...updates },
  })
  return NextResponse.json({ ok: true })
}
