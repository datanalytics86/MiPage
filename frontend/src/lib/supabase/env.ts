/**
 * True only when real Supabase credentials are present.
 * Treats CI/demo placeholders as "not configured" so UI falls back to mocks
 * instead of hanging on dead network calls.
 */
export function hasSupabaseEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || ''
  if (!url || !key) return false

  const lower = url.toLowerCase()
  if (
    lower.includes('tu-proyecto') ||
    lower.includes('example.supabase.co') ||
    lower.includes('placeholder.supabase.co') ||
    lower.includes('YOUR_PROJECT'.toLowerCase())
  ) {
    return false
  }

  if (
    key === 'tu-anon-key-aqui' ||
    key.startsWith('dummy-') ||
    key.includes('placeholder')
  ) {
    return false
  }

  return true
}
