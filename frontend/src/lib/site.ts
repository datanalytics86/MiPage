export const siteConfig = {
  name: 'MiPage',
  tagline: 'Marketplace de Servicios Profesionales',
  description:
    'Encuentra servicios de modelaje y masajes en Chile. Perfiles con fotos, reseñas de clientes y contacto directo por WhatsApp.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://mi-page-lake.vercel.app',
  locale: 'es_CL',
  /**
   * MIP-008/011: Public UI must not publish @mipage.cl inboxes.
   * Contact flows go through /contacto form (operator queue). No public mailto.
   */
  emails: {
    contact: '',
    support: '',
    legal: '',
    privacy: '',
  },
  social: {
    instagram: 'https://instagram.com/mipage.cl',
  },
  categories: [
    { slug: 'masajes', label: 'Masajes' },
    { slug: 'modelaje', label: 'Modelaje' },
  ],
  /** Labels only — values come from Supabase via HomeStats (or "—"). */
  statLabels: [
    { key: 'activeProviders', label: 'Profesionales activos' },
    { key: 'reviews', label: 'Reseñas publicadas' },
    { key: 'averageRating', label: 'Calificación promedio' },
    { key: 'cities', label: 'Ciudades con avisos' },
  ],
} as const

export function absoluteUrl(path = '/') {
  const base = siteConfig.url.replace(/\/$/, '')
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}
