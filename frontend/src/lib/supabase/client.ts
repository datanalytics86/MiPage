import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser Supabase client.
 * Intentionally untyped at the client generic level: the hand-written
 * Database interface is incomplete vs generated types and caused `never`
 * on all .from() mutations under strict supabase-js.
 * App-level types live in @/types/database and hooks cast as needed.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

let client: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!client) {
    client = createClient()
  }
  return client
}
