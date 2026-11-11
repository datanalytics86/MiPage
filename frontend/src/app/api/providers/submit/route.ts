import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getApiActor } from '@/lib/api/actor'
import {
  buildAdminPendingEmail,
  buildPendingEmail,
} from '@/lib/email'
import { persistentRateLimit } from '@/lib/persistentRateLimit'
import { sendAndLog } from '@/lib/notifications'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const schema = z.object({
  providerId: z.string().uuid(),
})

/**
 * Correo de "aviso en revisión" al dueño y al admin.
 * El destinatario sale de la base, nunca del cuerpo del request.
 */
export async function POST(req: NextRequest) {
  const actor = await getApiActor()
  if (!actor) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const rl = await persistentRateLimit(`listing:${actor.id}`, 8, 60 * 60)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Demasiados envíos. Espera un momento.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    )
  }

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

  const supabase = createServerSupabaseClient()
  const { data: provider, error } = await supabase
    .from('providers')
    .select('id, user_id, display_name')
    .eq('id', parsed.data.providerId)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'No se pudo leer el aviso' }, { status: 500 })
  }
  if (!provider || provider.user_id !== actor.id) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', actor.id)
    .maybeSingle()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mi-page-lake.vercel.app'
  const name = provider.display_name || 'Proveedor'
  const pending = buildPendingEmail(name, appUrl)
  const adminMail = buildAdminPendingEmail(name, appUrl)
  const adminTo = process.env.ADMIN_NOTIFY_EMAIL?.trim() || null

  await sendAndLog({
    to: profile?.email ?? null,
    subject: pending.subject,
    html: pending.html,
    template: 'provider_pending',
    userId: actor.id,
    payload: { providerId: provider.id },
  })
  await sendAndLog({
    to: adminTo,
    subject: adminMail.subject,
    html: adminMail.html,
    template: 'admin_new_pending',
    payload: { providerId: provider.id },
  })

  return NextResponse.json({ ok: true })
}
