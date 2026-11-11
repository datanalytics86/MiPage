import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminGuard'
import { recordAudit, sendAndLog } from '@/lib/notifications'
import type { EmailTemplate } from '@/lib/email'

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdmin()
  if (gate.error) return gate.error
  const { id } = await context.params

  const { data: row } = await gate.supabase
    .from('notification_log')
    .select('id, email, template, payload, user_id')
    .eq('id', id)
    .maybeSingle()
  if (!row) return NextResponse.json({ error: 'Aviso no encontrado' }, { status: 404 })

  const payload = (row.payload || {}) as { subject?: string; html?: string }
  if (!row.email || !payload.subject || !payload.html) {
    return NextResponse.json({ error: 'Este aviso no tiene cuerpo para reenviar' }, { status: 422 })
  }

  await sendAndLog({
    to: row.email,
    subject: payload.subject,
    html: payload.html,
    template: (row.template as EmailTemplate) || 'contact_reply',
    userId: row.user_id,
    payload: { retryOf: id },
  })
  await recordAudit({
    actorId: gate.actor.id,
    action: 'notification.retry',
    targetType: 'notification_log',
    targetId: id,
  })
  return NextResponse.json({ ok: true })
}
