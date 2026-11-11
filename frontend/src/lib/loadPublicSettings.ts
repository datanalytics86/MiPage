import { createClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { mergeSettings, publicSettingsDefaults, type PublicSettings } from '@/lib/publicSettings'

async function readSettings(): Promise<PublicSettings> {
  if (!hasSupabaseEnv()) return publicSettingsDefaults
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supabase.from('site_settings').select('key, value')
  if (error) return publicSettingsDefaults
  return mergeSettings(data)
}

export const loadPublicSettings = unstable_cache(readSettings, ['public-settings'], {
  revalidate: 30,
})
