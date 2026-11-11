import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/adminGuard'
import { recordAudit } from '@/lib/notifications'
import { createServiceRoleClient } from '@/lib/supabase/admin'

const schema = z.object({ url: z.string().min(8).max(2000) })

function storagePath(url: string): string | null {
  const marker = '/storage/v1/object/public/gallery/'
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

  const { data: row } = await gate.supabase
    .from('providers')
    .select('photos, cover_photo')
    .eq('id', id)
    .maybeSingle()
  if (!row) return NextResponse.json({ error: 'Aviso no encontrado' }, { status: 404 })

  const photos = ((row.photos as string[] | null) || []).filter((url) => url !== parsed.data.url)
  const cover = row.cover_photo === parsed.data.url ? photos[0] ?? null : row.cover_photo
  const { error } = await gate.supabase
    .from('providers')
    .update({ photos, cover_photo: cover })
    .eq('id', id)
  if (error) return NextResponse.json({ error: 'No se pudo quitar la foto' }, { status: 500 })

  await gate.supabase.from('gallery').delete().eq('provider_id', id).eq('url', parsed.data.url)

  const path = storagePath(parsed.data.url)
  const admin = createServiceRoleClient()
  if (admin && path) await admin.storage.from('gallery').remove([path])

  await recordAudit({
    actorId: gate.actor.id,
    action: 'provider.photo.delete',
    targetType: 'provider',
    targetId: id,
    after: { url: parsed.data.url },
  })
  return NextResponse.json({ ok: true })
}
