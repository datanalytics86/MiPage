import { createBrowserClient } from '@supabase/ssr'
import { hasSupabaseEnv } from '@/lib/supabase/env'

/**
 * Browser Supabase client.
 * Intentionally untyped at the client generic level: the hand-written
 * Database interface is incomplete vs generated types and caused `never`
 * on all .from() mutations under strict supabase-js.
 * App-level types live in @/types/database and hooks cast as needed.
 *
 * When env is missing (local build without .env), uses inert placeholders so
 * Next.js SSG does not crash. Runtime features stay gated by hasSupabaseEnv().
 */
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || PLACEHOLDER_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || PLACEHOLDER_KEY
  return createBrowserClient(url, key)
}

let client: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!client) {
    client = createClient()
  }
  return client
}

export function isSupabaseClientConfigured(): boolean {
  return hasSupabaseEnv()
}
