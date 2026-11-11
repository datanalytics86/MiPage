import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role client. Server routes only. Never import from a client component.
 * Returns null when the key is missing so callers can degrade without leaking it.
 */
export function createServiceRoleClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) return null
  if (key.includes('placeholder') || key.startsWith('your-')) return null

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
