import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { filterCities } from '@/lib/filters'
import { siteConfig } from '@/lib/site'

const fallbackCategories = siteConfig.categories.map((item) => ({ slug: item.slug, label: item.label }))
const fallbackCities = filterCities.filter((city) => city !== 'Todas')

export function useCatalog() {
  return useQuery({
    queryKey: ['catalog'],
    queryFn: async () => {
      if (!hasSupabaseEnv()) {
        return { categories: fallbackCategories, cities: [...fallbackCities] }
      }
      const supabase = getSupabaseClient()
      const [categories, cities] = await Promise.all([
        supabase.from('categories').select('slug, label').eq('is_active', true).order('sort_order'),
        supabase.from('cities').select('name').eq('is_active', true).order('sort_order'),
      ])
      return {
        categories: categories.data?.length
          ? categories.data.map((row) => ({ slug: row.slug as string, label: row.label as string }))
          : fallbackCategories,
        cities: cities.data?.length
          ? cities.data.map((row) => row.name as string)
          : [...fallbackCities],
      }
    },
    staleTime: 60 * 1000,
  })
}
