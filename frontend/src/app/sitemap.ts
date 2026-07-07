import type { MetadataRoute } from 'next'
import { absoluteUrl, siteConfig } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const staticPages: MetadataRoute.Sitemap = [
    '',
    '/explorar',
    '/contacto',
    '/sobre-nosotros',
    '/terminos',
    '/privacidad',
    '/login',
    '/register',
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))

  const categoryPages: MetadataRoute.Sitemap = siteConfig.categories.map((category) => ({
    url: absoluteUrl(`/explorar/${category.slug}`),
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages]
}