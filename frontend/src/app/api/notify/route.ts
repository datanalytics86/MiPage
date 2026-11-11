import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getApiActor } from '@/lib/api/actor'

const schema = z.object({
  type: z.string().max(40).optional(),
})

/**
 * El relé abierto se cerró. La moderación vive en
 * `/api/admin/providers/[id]/moderate` y el aviso del wizard en
 * `/api/providers/submit`. Esta ruta ya no envía correo.
 */
export async function POST(req: NextRequest) {
  const actor = await getApiActor()
  if (!actor) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  let json: unknown = {}
  try {
    json = await req.json()
  } catch {
    json = {}
  }

  const parsed = schema.safeParse(json)
  const type = parsed.success ? parsed.data.type : undefined
  if (type === 'generic' || type === 'invitation') {
    return NextResponse.json(
      { error: 'Ese tipo de correo ya no existe' },
      { status: 400 }
    )
  }

  return NextResponse.json(
    { error: 'Este endpoint ya no envía correos' },
    { status: 410 }
  )
}
