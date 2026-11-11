import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/adminGuard'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { recordAudit } from '@/lib/notifications'
import { extractStoragePath } from '@/lib/storagePath'

const bodySchema = z.object({
  paths: z.array(z.string().min(3).max(500)).min(1).max(200),
})

async function listGalleryFiles(admin: NonNullable<ReturnType<typeof createServiceRoleClient>>) {
  const files: string[] = []

  async function walk(prefix: string, depth: number) {
    let offset = 0
    for (;;) {
      const { data, error } = await admin.storage.from('gallery').list(prefix, {
        limit: 100,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      })
      if (error) throw new Error(error.message)
      if (!data?.length) break
      for (const entry of data) {
        const path = prefix ? `${prefix}/${entry.name}` : entry.name
        if (entry.id) files.push(path)
        else if (depth < 3) await walk(path, depth + 1)
      }
      if (data.length < 100) break
      offset += data.length
      if (offset > 5000) break
    }
  }

  await walk('', 0)
  return files
}

async function referencedPaths(admin: NonNullable<ReturnType<typeof createServiceRoleClient>>) {
  const paths = new Set<string>()
  const { data: gallery } = await admin.from('gallery').select('url')
  for (const row of gallery || []) {
    const path = extractStoragePath(String(row.url || ''), 'gallery')
    if (path) paths.add(path)
  }
  const { data: providers } = await admin.from('providers').select('cover_photo, photos')
  for (const row of providers || []) {
    const cover = extractStoragePath(String(row.cover_photo || ''), 'gallery')
    if (cover) paths.add(cover)
    const photos = Array.isArray(row.photos) ? row.photos : []
    for (const photo of photos) {
      const path = extractStoragePath(String(photo || ''), 'gallery')
      if (path) paths.add(path)
    }
  }
  return paths
}

export async function GET() {
  const gate = await requireAdmin()
  if (gate.error) return gate.error
  const admin = createServiceRoleClient()
  if (!admin) {
    return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 503 })
  }

  try {
    const [files, used] = await Promise.all([listGalleryFiles(admin), referencedPaths(admin)])
    const paths = files.filter((path) => !used.has(path) && !path.includes('..'))
    return NextResponse.json({ paths, scanned: files.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo listar Storage'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const gate = await requireAdmin()
  if (gate.error) return gate.error
  const admin = createServiceRoleClient()
  if (!admin) {
    return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 503 })
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Lista de archivos inválida' }, { status: 400 })
  }

  try {
    const [files, used] = await Promise.all([listGalleryFiles(admin), referencedPaths(admin)])
    const orphans = new Set(files.filter((path) => !used.has(path)))
    const allowed = parsed.data.paths.filter((path) => orphans.has(path) && !path.includes('..'))
    if (!allowed.length) return NextResponse.json({ deleted: 0 })
    const { error } = await admin.storage.from('gallery').remove(allowed)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await recordAudit({
      actorId: gate.actor.id,
      action: 'storage.orphans.delete',
      targetType: 'gallery',
      targetId: 'gallery',
      after: { deleted: allowed.length },
    })
    return NextResponse.json({ deleted: allowed.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo limpiar'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
