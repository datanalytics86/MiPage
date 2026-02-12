const FALLBACK_SUPABASE_URL = 'https://example.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY = 'demo-anon-key'

let warned = false

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (!warned) {
      warned = true
      console.warn(
        '[supabase] Missing NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY, using fallback values.'
      )
    }
  }

  return { url, anonKey }
}
