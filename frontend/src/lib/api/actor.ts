import { createServerSupabaseClient } from '@/lib/supabase/server'

export type ApiActor = {
  id: string
  role: string
}

/** Session user plus role. Null when there is no session. */
export async function getApiActor(): Promise<ApiActor | null> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return { id: user.id, role: profile?.role ?? 'user' }
}
