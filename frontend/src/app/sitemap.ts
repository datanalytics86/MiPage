import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { absoluteUrl, siteConfig } from '@/lib/site'
import { hasSupabaseEnv } from '@/lib/supabase/env'

const STATIC_PATHS = ['', '/explorar', '/contacto', '/ayuda', '/sobre-nosotros', '/terminos', '/privacidad']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticPages: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path || '/'),
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))

  let categorySlugs: string[] = siteConfig.categories.map((category) => category.slug)
  let profiles: { slug: string; updated_at: string | null }[] = []

  if (hasSupabaseEnv()) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
    const [{ data: categories }, { data: providers }] = await Promise.all([
      supabase.from('categories').select('slug').eq('is_active', true).order('sort_order'),
      supabase
        .from('providers')
        .select('slug, updated_at')
        .eq('status', 'approved')
        .order('updated_at', { ascending: false })
        .limit(5000),
    ])
    if (categories?.length) categorySlugs = categories.map((row) => row.slug as string)
    profiles = (providers || []) as { slug: string; updated_at: string | null }[]
  }

  const categoryPages: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: absoluteUrl(`/explorar/${slug}`),
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const profilePages: MetadataRoute.Sitemap = profiles
    .filter((row) => row.slug)
    .map((row) => ({
      url: absoluteUrl(`/perfil/${row.slug}`),
      lastModified: row.updated_at ? new Date(row.updated_at) : now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

  return [...staticPages, ...categoryPages, ...profilePages]
}
