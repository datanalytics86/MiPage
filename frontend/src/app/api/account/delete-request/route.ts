import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

const bodySchema = z.object({
  reason: z.string().max(1000).optional(),
})

/**
 * Chile compliance: user-initiated data deletion request (Ley 19.628).
 * Stores request for admin processing; does not hard-delete immediately.
 */
export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set() {},
      remove() {},
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let reason: string | undefined
  try {
    const json = await req.json()
    const parsed = bodySchema.safeParse(json)
    if (parsed.success) reason = parsed.data.reason
  } catch {
    /* empty body ok */
  }

  const { error } = await supabase.from('data_deletion_requests').insert({
    user_id: user.id,
    reason: reason || null,
    status: 'pending',
  })

  if (error) {
    // table may not exist yet pre-migration
    return NextResponse.json(
      {
        error: error.message,
        hint: 'Run migration 006_listings_metadata_moderation.sql',
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, message: 'Solicitud registrada. Te contactaremos.' })
}
