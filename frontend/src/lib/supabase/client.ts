import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'
import { getSupabaseEnv } from '@/lib/supabase/env'

export function createClient() {
  const { url, anonKey } = getSupabaseEnv()
  return createBrowserClient<Database>(url, anonKey)
}

type LooseSupabaseClient = ReturnType<typeof createBrowserClient<any>>

let client: LooseSupabaseClient | null = null

export function getSupabaseClient(): LooseSupabaseClient {
  if (!client) {
    client = createClient() as unknown as LooseSupabaseClient
  }
  return client
}
