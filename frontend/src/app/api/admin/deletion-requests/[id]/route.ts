import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/adminGuard'
import { recordAudit } from '@/lib/notifications'
import { createServiceRoleClient } from '@/lib/supabase/admin'

const schema = z.object({
  action: z.enum(['reject', 'complete']),
  confirmEmail: z.string().email().optional(),
})

function storagePath(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`
  const index = url.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(url.slice(index + marker.length).split('?')[0])
}

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

  const { data: requestRow } = await gate.supabase
    .from('data_deletion_requests')
    .select('id, user_id, status')
    .eq('id', id)
    .maybeSingle()
  if (!requestRow) return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 })

  if (parsed.data.action === 'reject') {
    const { error } = await gate.supabase
      .from('data_deletion_requests')
      .update({ status: 'rejected', completed_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return NextResponse.json({ error: 'No se pudo rechazar' }, { status: 500 })
    await recordAudit({
      actorId: gate.actor.id,
      action: 'deletion.reject',
      targetType: 'data_deletion_request',
      targetId: id,
      before: requestRow,
    })
    return NextResponse.json({ ok: true })
  }

  const admin = createServiceRoleClient()
  if (!admin) return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 503 })

  const { data: profile } = await admin.from('profiles').select('email').eq('id', requestRow.user_id).maybeSingle()
  if (!profile || parsed.data.confirmEmail?.trim().toLowerCase() !== String(profile.email).toLowerCase()) {
    return NextResponse.json({ error: 'Escribe el correo exacto de la cuenta' }, { status: 400 })
  }

  const { data: providers } = await admin.from('providers').select('id, photos, cover_photo').eq('user_id', requestRow.user_id)
  const providerIds = (providers || []).map((row) => row.id as string)
  const urls: string[] = []
  for (const row of providers || []) {
    urls.push(...((row.photos as string[] | null) || []))
    if (row.cover_photo) urls.push(row.cover_photo as string)
  }
  if (providerIds.length) {
    const { data: gallery } = await admin.from('gallery').select('url').in('provider_id', providerIds)
    urls.push(...(gallery || []).map((item) => item.url as string))
  }
  const { data: avatarRow } = await admin.from('profiles').select('avatar_url').eq('id', requestRow.user_id).maybeSingle()
  if (avatarRow?.avatar_url) urls.push(avatarRow.avatar_url as string)

  const galleryPaths = urls.map((url) => storagePath(url, 'gallery')).filter((path): path is string => Boolean(path))
  const avatarPaths = urls.map((url) => storagePath(url, 'avatars')).filter((path): path is string => Boolean(path))
  if (galleryPaths.length) await admin.storage.from('gallery').remove(galleryPaths)
  if (avatarPaths.length) await admin.storage.from('avatars').remove(avatarPaths)

  await recordAudit({
    actorId: gate.actor.id,
    action: 'deletion.complete',
    targetType: 'profile',
    targetId: requestRow.user_id,
    before: { email: profile.email, requestId: id },
  })

  const { error: deleteError } = await admin.auth.admin.deleteUser(requestRow.user_id)
  if (deleteError) {
    return NextResponse.json({ error: 'No se pudo borrar la cuenta' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
