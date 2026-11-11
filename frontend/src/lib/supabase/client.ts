import { createBrowserClient } from '@supabase/ssr'
import { hasSupabaseEnv } from '@/lib/supabase/env'

/**
 * Browser Supabase client.
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
