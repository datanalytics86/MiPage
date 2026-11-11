import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import {
  mergeSettings,
  publicSettingsDefaults,
  type PublicSettings,
} from '@/lib/publicSettings'

export type SiteSettings = PublicSettings

export const siteSettingsKeys = {
  all: ['site-settings'] as const,
}

export function useSiteSettings() {
  return useQuery({
    queryKey: siteSettingsKeys.all,
    queryFn: async (): Promise<PublicSettings> => {
      if (!hasSupabaseEnv()) return publicSettingsDefaults
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from('site_settings').select('key, value')
      if (error) return publicSettingsDefaults
      return mergeSettings(data)
    },
    staleTime: 30 * 1000,
  })
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: Partial<PublicSettings>) => {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || 'No se pudo guardar')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteSettingsKeys.all })
    },
  })
}
