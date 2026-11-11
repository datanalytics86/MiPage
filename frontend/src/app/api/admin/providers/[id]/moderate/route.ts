import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getApiActor } from '@/lib/api/actor'
import {
  buildApprovalEmail,
  buildRejectionEmail,
  buildSuspendedEmail,
} from '@/lib/email'
import { recordAudit, sendAndLog } from '@/lib/notifications'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const schema = z.object({
  status: z.enum(['approved', 'rejected', 'suspended', 'pending']),
  rejection_reason: z.string().max(1000).nullable().optional(),
  ids: z.array(z.string().uuid()).max(50).optional(),
})

type ProviderRow = {
  id: string
  user_id: string
  display_name: string
  status: string
}

/**
 * Moderación en servidor: solo un admin, destinatario leído de la base,
 * auditoría y notification_log.
 * El lote usa el mismo endpoint con `ids`.
 */
export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const actor = await getApiActor()
  if (!actor) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  if (actor.role !== 'admin') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
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

  const ids = parsed.data.ids?.length ? parsed.data.ids : [context.params.id]
  const uniqueIds = Array.from(new Set(ids))
  const status = parsed.data.status
  const reason = parsed.data.rejection_reason?.trim() || null

  const supabase = createServerSupabaseClient()
  const { data: rows, error: readError } = await supabase
    .from('providers')
    .select('id, user_id, display_name, status')
    .in('id', uniqueIds)

  if (readError) {
    return NextResponse.json({ error: 'No se pudo leer los avisos' }, { status: 500 })
  }

  const found = (rows || []) as ProviderRow[]
  if (found.length === 0) {
    return NextResponse.json({ error: 'Aviso no encontrado' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mi-page-lake.vercel.app'
  const moderatedAt = new Date().toISOString()
  let updated = 0

  for (const row of found) {
    const { data: owner } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', row.user_id)
      .maybeSingle()

    const rejectionReason = status === 'rejected' ? reason || 'No especificado' : null
    const { error: updateError } = await supabase
      .from('providers')
      .update({
        status,
        rejection_reason: rejectionReason,
        moderated_at: moderatedAt,
        moderated_by: actor.id,
      })
      .eq('id', row.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'No se pudo actualizar el aviso', id: row.id },
        { status: 500 }
      )
    }

    updated += 1
    await recordAudit({
      actorId: actor.id,
      action: `provider.${status}`,
      targetType: 'provider',
      targetId: row.id,
      before: { status: row.status },
      after: { status, rejection_reason: rejectionReason },
    })

    const name = row.display_name || 'Proveedor'
    const mail =
      status === 'approved'
        ? buildApprovalEmail(name, appUrl)
        : status === 'rejected'
          ? buildRejectionEmail(name, rejectionReason || 'No especificado', appUrl)
          : status === 'suspended'
            ? buildSuspendedEmail(name, appUrl)
            : null

    if (mail) {
      await sendAndLog({
        to: owner?.email ?? null,
        subject: mail.subject,
        html: mail.html,
        template:
          status === 'approved'
            ? 'provider_approved'
            : status === 'rejected'
              ? 'provider_rejected'
              : 'provider_suspended',
        userId: row.user_id,
        payload: { providerId: row.id, status },
      })
    }
  }

  return NextResponse.json({ ok: true, updated })
}
