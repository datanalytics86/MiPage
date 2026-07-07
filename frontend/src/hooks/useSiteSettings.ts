import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'

export interface SiteSettings {
  general: {
    siteName: string
    siteDescription: string
    timezone: string
    currency: string
    maintenanceMode: boolean
  }
  email: {
    supportEmail: string
    adminEmail: string
  }
  security: {
    requireEmailVerification: boolean
    requireIdVerification: boolean
    allowProviderRegistration: boolean
  }
  payments: {
    commissionRate: number
    minWithdrawal: number
  }
  stats: {
    professionals: string
    reviews: string
    rating: string
    cities: string
  }
}

const defaults: SiteSettings = {
  general: {
    siteName: 'MiPage',
    siteDescription: 'Marketplace de servicios profesionales en Chile',
    timezone: 'America/Santiago',
    currency: 'CLP',
    maintenanceMode: false,
  },
  email: {
    supportEmail: 'soporte@mipage.cl',
    adminEmail: 'contacto@mipage.cl',
  },
  security: {
    requireEmailVerification: true,
    requireIdVerification: true,
    allowProviderRegistration: true,
  },
  payments: {
    commissionRate: 15,
    minWithdrawal: 50000,
  },
  stats: {
    professionals: '500+',
    reviews: '10.000+',
    rating: '4.8',
    cities: '15+',
  },
}

export const siteSettingsKeys = {
  all: ['site-settings'] as const,
}

export function useSiteSettings() {
  return useQuery({
    queryKey: siteSettingsKeys.all,
    enabled: hasSupabaseEnv(),
    queryFn: async (): Promise<SiteSettings> => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from('site_settings').select('key, value')

      if (error) throw error

      const settings = { ...defaults }
      for (const row of data || []) {
        const key = row.key as keyof SiteSettings
        if (key in settings) {
          settings[key] = { ...settings[key], ...(row.value as object) }
        }
      }
      return settings
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: Partial<SiteSettings>) => {
      const supabase = getSupabaseClient()

      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({ key, value, updated_at: new Date().toISOString() })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteSettingsKeys.all })
    },
  })
}