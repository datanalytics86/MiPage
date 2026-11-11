import { siteConfig } from '@/lib/site'

export const DEFAULT_REJECTION_REASONS = [
  'Las fotos están un poco borrosas o poco nítidas. ¿Puedes subir al menos 3 imágenes claras del servicio y de ti?',
  'Parte del contenido no encaja con la política de MiPage. Revisa las normas y vuelve a enviar con fotos y texto apropiados.',
  'Detectamos datos de contacto o enlaces que parecen spam. Usa los campos de WhatsApp/Instagram y deja la bio limpia.',
  'La categoría o la ciudad no coinciden con el perfil. Corrige esos datos y reenvía para revisión.',
  'El perfil está incompleto (bio corta o sin precio). Completa la información y las fotos; con gusto lo revisamos de nuevo.',
]

export interface PublicSettings {
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
    allowProviderRegistration: boolean
  }
  payments: {
    featuredPrice: number
    featuredDurationDays: number
  }
  content: {
    contactEmail: string
    legalEmail: string
    privacyEmail: string
    instagram: string
    bannerEnabled: boolean
    bannerText: string
    heroEyebrow: string
    heroTitle: string
    heroSubtitle: string
    adultBanner: boolean
  }
  moderation: {
    rejectionReasons: string[]
  }
}

export const publicSettingsDefaults: PublicSettings = {
  general: {
    siteName: siteConfig.name,
    siteDescription: 'Marketplace de servicios profesionales en Chile',
    timezone: 'America/Santiago',
    currency: 'CLP',
    maintenanceMode: false,
  },
  email: {
    supportEmail: siteConfig.emails.support,
    adminEmail: siteConfig.emails.contact,
  },
  security: {
    allowProviderRegistration: true,
  },
  payments: {
    featuredPrice: 9990,
    featuredDurationDays: 30,
  },
  content: {
    contactEmail: siteConfig.emails.contact,
    legalEmail: siteConfig.emails.legal,
    privacyEmail: siteConfig.emails.privacy,
    instagram: siteConfig.social.instagram,
    bannerEnabled: false,
    bannerText: '',
    heroEyebrow: '',
    heroTitle: '',
    heroSubtitle: '',
    adultBanner: false,
  },
  moderation: {
    rejectionReasons: DEFAULT_REJECTION_REASONS,
  },
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

export function mergeSettings(rows: { key: string; value: unknown }[] | null): PublicSettings {
  const settings: PublicSettings = structuredClone(publicSettingsDefaults)
  for (const row of rows || []) {
    const key = row.key as keyof PublicSettings
    if (!(key in settings)) continue
    const incoming = asObject(row.value)
    const target = settings[key] as unknown as Record<string, unknown>
    for (const [field, value] of Object.entries(incoming)) {
      if (field === 'rejectionReasons' && Array.isArray(value)) {
        target[field] = value.map(String).filter(Boolean)
        continue
      }
      if (field in target && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) {
        target[field] = value
      }
    }
  }
  return settings
}
