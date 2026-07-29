import { NextRequest, NextResponse } from 'next/server'
import {
  buildApprovalEmail,
  buildRejectionEmail,
  sendTransactionalEmail,
} from '@/lib/email'
import { z } from 'zod'

const schema = z.object({
  type: z.enum(['provider_approved', 'provider_rejected', 'provider_pending', 'invitation', 'generic']),
  email: z.string().email().optional(),
  displayName: z.string().max(200).optional(),
  reason: z.string().max(1000).optional(),
  subject: z.string().max(200).optional(),
  html: z.string().max(10000).optional(),
})

export async function POST(req: NextRequest) {
  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { type, email, displayName, reason, subject, html } = parsed.data
  if (!email) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'no_email' })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mi-page-lake.vercel.app'
  const name = displayName || 'Usuario'

  let mail: { subject: string; html: string }
  switch (type) {
    case 'provider_approved':
      mail = buildApprovalEmail(name, appUrl)
      break
    case 'provider_rejected':
      mail = buildRejectionEmail(name, reason || 'No especificado', appUrl)
      break
    case 'provider_pending':
      mail = {
        subject: 'Recibimos tu aviso en MiPage',
        html: `<p>Hola ${name},</p><p>Tu aviso está en revisión (PENDING). Te avisaremos al aprobarlo o rechazarlo.</p>`,
      }
      break
    case 'invitation':
    case 'generic':
      mail = {
        subject: subject || 'Mensaje de MiPage',
        html: html || '<p>Hola desde MiPage</p>',
      }
      break
  }

  const result = await sendTransactionalEmail({
    to: email,
    subject: mail.subject,
    html: mail.html,
    template: type,
  })

  return NextResponse.json({ ok: true, ...result })
}
