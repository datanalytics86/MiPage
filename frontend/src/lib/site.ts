export const siteConfig = {
  name: 'MiPage',
  tagline: 'Marketplace de Servicios Profesionales',
  description:
    'Descubre y contrata servicios profesionales de modelaje y masajes en Chile. Perfiles verificados, reseñas reales y contacto directo.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://mi-page-lake.vercel.app',
  locale: 'es_CL',
  emails: {
    contact: 'contacto@mipage.cl',
    support: 'soporte@mipage.cl',
    legal: 'legal@mipage.cl',
    privacy: 'privacidad@mipage.cl',
  },
  social: {
    instagram: 'https://instagram.com/mipage.cl',
  },
  categories: [
    { slug: 'masajes', label: 'Masajes' },
    { slug: 'modelaje', label: 'Modelaje' },
  ],
  stats: [
    { value: '500+', label: 'Profesionales verificados' },
    { value: '10.000+', label: 'Reseñas publicadas' },
    { value: '4.8', label: 'Calificación promedio' },
    { value: '15+', label: 'Ciudades en Chile' },
  ],
} as const

export function absoluteUrl(path = '/') {
  const base = siteConfig.url.replace(/\/$/, '')
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}