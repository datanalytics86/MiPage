import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'
import { getSupabaseEnv } from '@/lib/supabase/env'

export function createClient() {
  const { url, anonKey } = getSupabaseEnv()
  return createBrowserClient<Database>(
    url,
    anonKey
  )
}

// NOTE: temporary compatibility typing to avoid false `never` inference issues
// across current Supabase query usage in the project.
let client: any = null

export function getSupabaseClient(): any {
  if (!client) {
    client = createClient()
  }
  return client
}
