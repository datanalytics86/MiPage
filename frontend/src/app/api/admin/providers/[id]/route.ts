import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/adminGuard'
import { recordAudit } from '@/lib/notifications'
import { createServiceRoleClient } from '@/lib/supabase/admin'

const patchSchema = z.object({
  display_name: z.string().min(2).max(120).optional(),
  bio: z.string().max(4000).nullable().optional(),
  category: z.string().min(2).max(40).optional(),
  city: z.string().min(2).max(80).optional(),
  whatsapp: z.string().max(40).nullable().optional(),
  instagram: z.string().max(120).nullable().optional(),
  is_verified: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  featuredDays: z.number().int().min(1).max(365).optional(),
})

function storagePath(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`
  const index = url.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(url.slice(index + marker.length).split('?')[0])
}

export async function PATCH(
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
  const parsed = patchSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const { data: before, error: readError } = await gate.supabase
    .from('providers')
    .select('id, is_featured, featured_until, is_verified, display_name, status')
    .eq('id', id)
    .maybeSingle()
  if (readError || !before) {
    return NextResponse.json({ error: 'Aviso no encontrado' }, { status: 404 })
  }

  const updates: Record<string, unknown> = { ...parsed.data }
  delete updates.featuredDays

  if (parsed.data.is_featured === true) {
    const { data: paymentRow } = await gate.supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'payments')
      .maybeSingle()
    const configured = Number((paymentRow?.value as { featuredDurationDays?: number } | null)?.featuredDurationDays)
    const days = parsed.data.featuredDays ?? (Number.isInteger(configured) && configured > 0 ? configured : 30)
    updates.featured_until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
  }
  if (parsed.data.is_featured === false) {
    updates.featured_until = null
  }

  const { error } = await gate.supabase.from('providers').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: 'No se pudo guardar' }, { status: 500 })

  await recordAudit({
    actorId: gate.actor.id,
    action: 'provider.update',
    targetType: 'provider',
    targetId: id,
    before,
    after: updates,
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdmin()
  if (gate.error) return gate.error
  const { id } = await context.params

  const { data: row } = await gate.supabase
    .from('providers')
    .select('id, display_name, photos, cover_photo')
    .eq('id', id)
    .maybeSingle()
  if (!row) return NextResponse.json({ error: 'Aviso no encontrado' }, { status: 404 })

  const { data: gallery } = await gate.supabase.from('gallery').select('url').eq('provider_id', id)
  const urls = [
    ...(gallery || []).map((item) => item.url as string),
    ...((row.photos as string[] | null) || []),
    row.cover_photo as string | null,
  ].filter((url): url is string => Boolean(url))

  const admin = createServiceRoleClient()
  if (admin) {
    const paths = Array.from(new Set(urls.map((url) => storagePath(url, 'gallery')).filter((p): p is string => Boolean(p))))
    if (paths.length) await admin.storage.from('gallery').remove(paths)
  }

  const { error } = await gate.supabase.from('providers').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'No se pudo eliminar' }, { status: 500 })

  await recordAudit({
    actorId: gate.actor.id,
    action: 'provider.delete',
    targetType: 'provider',
    targetId: id,
    before: { display_name: row.display_name },
  })
  return NextResponse.json({ ok: true })
}
