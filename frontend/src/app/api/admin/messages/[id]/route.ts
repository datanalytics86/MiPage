import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/adminGuard'
import { escapeHtml } from '@/lib/email'
import { recordAudit, sendAndLog } from '@/lib/notifications'

const schema = z.object({
  status: z.enum(['new', 'replied', 'archived']).optional(),
  reply: z.string().min(2).max(4000).optional(),
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

  const { data: message } = await gate.supabase
    .from('contact_messages')
    .select('id, email, name, status')
    .eq('id', id)
    .maybeSingle()
  if (!message) return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 })

  if (parsed.data.reply) {
    await sendAndLog({
      to: message.email,
      subject: 'Respuesta de MiPage',
      html: `<p>Hola ${escapeHtml(message.name)},</p><p>${escapeHtml(parsed.data.reply)}</p>`,
      template: 'contact_reply',
      payload: { messageId: id },
    })
  }

  const { error } = await gate.supabase
    .from('contact_messages')
    .update({
      status: parsed.data.reply ? 'replied' : parsed.data.status || message.status,
      admin_reply: parsed.data.reply ?? null,
      replied_at: parsed.data.reply ? new Date().toISOString() : null,
    })
    .eq('id', id)
  if (error) return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 })

  await recordAudit({
    actorId: gate.actor.id,
    action: 'message.update',
    targetType: 'contact_message',
    targetId: id,
    after: { status: parsed.data.status, replied: Boolean(parsed.data.reply) },
  })
  return NextResponse.json({ ok: true })
}
