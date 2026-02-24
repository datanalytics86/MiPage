'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ProviderCard } from '@/components/providers/ProviderCard'
import { useSearchParams } from 'next/navigation'
import { useProviders, useCities } from '@/hooks/useProviders'
import type { ProviderCardData, FilterOptions, ProviderCategory } from '@/types'
import type { Provider as ProviderRow } from '@/types/database'

const sortOptions = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'rating', label: 'Mejor valoradas' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
] as const

const mapProviderToCard = (provider: ProviderRow): ProviderCardData => ({
  id: provider.id,
  slug: provider.slug,
  display_name: provider.display_name,
  age: provider.age ?? 18,
  city: provider.city,
  commune: null,
  category: provider.category === 'modelaje' ? 'modelaje' : 'masajes',
  is_verified: provider.is_verified,
  is_featured: provider.is_featured,
  average_rating: provider.rating || 0,
  review_count: provider.review_count || 0,
  price_from: provider.price_min || 0,
  primary_image: provider.cover_photo,
})

export default function ExplorarPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    city: undefined,
    verified_only: false,
    sort_by: 'relevance',
  })

  const { data: citiesData = [] } = useCities()
  const { data: providersData = [], isLoading } = useProviders({
    category: filters.category !== 'all' ? filters.category : undefined,
    city: filters.city,
    is_verified: filters.verified_only || undefined,
  })

  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam === 'masajes' || categoryParam === 'modelaje') {
      setFilters((prev) => ({ ...prev, category: categoryParam as ProviderCategory }))
    }
  }, [searchParams])

  const mappedProviders = useMemo(() => providersData.map(mapProviderToCard), [providersData])

  const searchedProviders = useMemo(() => {
    if (!searchQuery.trim()) return mappedProviders
    const q = searchQuery.toLowerCase()
    return mappedProviders.filter((p) =>
      p.display_name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q)
    )
  }, [mappedProviders, searchQuery])

  const sortedProviders = useMemo(() => {
    const data = [...searchedProviders]
    switch (filters.sort_by) {
      case 'rating':
        return data.sort((a, b) => b.average_rating - a.average_rating)
      case 'price_asc':
        return data.sort((a, b) => a.price_from - b.price_from)
      case 'price_desc':
        return data.sort((a, b) => b.price_from - a.price_from)
      default:
        return data.sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    }
  }, [searchedProviders, filters.sort_by])

  const cities = ['Todas', ...citiesData]

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="container-luxury py-4">
          <div className="space-y-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
              <Input
                type="text"
                placeholder="Buscar por nombre, ciudad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <select
                value={filters.category || 'all'}
                onChange={(e) => setFilters({ ...filters, category: e.target.value as ProviderCategory | 'all' })}
                className="input-luxury min-w-[140px]"
              >
                <option value="all">Categoría</option>
                <option value="masajes">Masajes</option>
                <option value="modelaje">Modelaje</option>
              </select>

              <select
                value={filters.city || 'Todas'}
                onChange={(e) =>
                  setFilters({ ...filters, city: e.target.value === 'Todas' ? undefined : e.target.value })
                }
                className="input-luxury min-w-[140px]"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <select
                value={filters.sort_by || 'relevance'}
                onChange={(e) => setFilters({ ...filters, sort_by: e.target.value as FilterOptions['sort_by'] })}
                className="input-luxury min-w-[160px]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {(filters.category !== 'all' || filters.city || filters.verified_only) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.category && filters.category !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.category === 'masajes' ? 'Masajes' : 'Modelaje'}
                    <button onClick={() => setFilters({ ...filters, category: 'all' })}><X className="h-3 w-3" /></button>
                  </Badge>
                )}
                {filters.city && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.city}
                    <button onClick={() => setFilters({ ...filters, city: undefined })}><X className="h-3 w-3" /></button>
                  </Badge>
                )}
              </div>
            )}

            <p className="text-foreground-secondary text-sm">
              <span className="font-medium text-foreground">{sortedProviders.length}</span> profesionales encontrados
            </p>
          </div>
        </div>
      </div>

      <div className="container-luxury py-8">
        {isLoading ? (
          <p className="text-muted-foreground">Cargando proveedores...</p>
        ) : sortedProviders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProviders.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ProviderCard provider={provider} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-8 w-8 text-foreground-muted" />
            </div>
            <h3 className="font-display text-xl font-medium text-foreground mb-2">No encontramos resultados</h3>
            <p className="text-foreground-secondary mb-6">Prueba ajustando los filtros o tu búsqueda.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setFilters({ category: 'all', city: undefined, verified_only: false, sort_by: 'relevance' })
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
