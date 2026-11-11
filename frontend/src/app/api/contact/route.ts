import { NextResponse } from 'next/server'
import { clientIpFromRequest } from '@/lib/rateLimit'
import { persistentRateLimit } from '@/lib/persistentRateLimit'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { sendAndLog } from '@/lib/notifications'
import { escapeHtml } from '@/lib/email'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  reason: z.enum(['general', 'support', 'report']),
  message: z.string().trim().min(10).max(4000),
})

export async function POST(request: Request) {
  try {
    const ip = clientIpFromRequest(request)
    const rl = await persistentRateLimit(`contact:${ip}`, 10, 60)
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, error: 'Demasiadas solicitudes. Espera un momento.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
      )
    }

    const body = await request.json()
    const data = contactSchema.parse(body)

    const admin = createServiceRoleClient()
    if (!admin) {
      return NextResponse.json(
        { ok: false, error: 'No se pudo guardar el mensaje' },
        { status: 503 }
      )
    }

    const { error } = await admin.from('contact_messages').insert({
      name: data.name,
      email: data.email,
      reason: data.reason,
      message: data.message,
      status: 'new',
    })
    if (error) {
      return NextResponse.json({ ok: false, error: 'No se pudo guardar el mensaje' }, { status: 500 })
    }

    const { data: emailRow } = await admin.from('site_settings').select('value').eq('key', 'email').maybeSingle()
    const notifyTo =
      (emailRow?.value as { adminEmail?: string } | null)?.adminEmail ||
      process.env.ADMIN_NOTIFY_EMAIL ||
      null
    await sendAndLog({
      to: notifyTo,
      subject: `Mensaje de contacto (${data.reason})`,
      html: `<p><strong>${escapeHtml(data.name)}</strong> (${escapeHtml(data.email)})</p><p>${escapeHtml(data.message)}</p>`,
      template: 'contact_reply',
      payload: { reason: data.reason },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Datos inválidos', details: error.flatten() },
        { status: 400 }
      )
    }
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 })
  }
}