import { NextResponse } from 'next/server'
import { getApiActor, type ApiActor } from '@/lib/api/actor'
import { createServerSupabaseClient } from '@/lib/supabase/server'

type GuardOk = {
  error?: undefined
  actor: ApiActor
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>
}

type GuardNo = { error: NextResponse; actor?: undefined; supabase?: undefined }

export async function requireAdmin(): Promise<GuardOk | GuardNo> {
  const actor = await getApiActor()
  if (!actor) {
    return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) }
  }
  if (actor.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Sin permisos' }, { status: 403 }) }
  }
  const supabase = await createServerSupabaseClient()
  return { actor, supabase }
}
