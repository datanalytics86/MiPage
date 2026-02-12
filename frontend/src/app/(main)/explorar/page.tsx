'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ProviderCard } from '@/components/providers/ProviderCard'
import { useSearchParams } from 'next/navigation'
import type { ProviderCardData, FilterOptions, ProviderCategory } from '@/types'

// Mock data
const allProviders: ProviderCardData[] = [
  {
    id: '1',
    slug: 'valentina-reyes',
    display_name: 'Valentina Reyes',
    age: 28,
    city: 'Santiago',
    commune: 'Las Condes',
    category: 'masajes',
    is_verified: true,
    is_featured: true,
    average_rating: 4.9,
    review_count: 47,
    price_from: 45000,
    primary_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600',
  },
  {
    id: '2',
    slug: 'camila-silva',
    display_name: 'Camila Silva',
    age: 24,
    city: 'Santiago',
    commune: 'Providencia',
    category: 'modelaje',
    is_verified: true,
    is_featured: true,
    average_rating: 4.8,
    review_count: 32,
    price_from: 80000,
    primary_image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600',
  },
  {
    id: '3',
    slug: 'sofia-martinez',
    display_name: 'Sofía Martínez',
    age: 31,
    city: 'Viña del Mar',
    commune: null,
    category: 'masajes',
    is_verified: false,
    is_featured: false,
    average_rating: 4.7,
    review_count: 28,
    price_from: 40000,
    primary_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600',
  },
  {
    id: '4',
    slug: 'isabella-rojas',
    display_name: 'Isabella Rojas',
    age: 26,
    city: 'Santiago',
    commune: 'Ñuñoa',
    category: 'modelaje',
    is_verified: true,
    is_featured: false,
    average_rating: 4.9,
    review_count: 56,
    price_from: 75000,
    primary_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600',
  },
  {
    id: '5',
    slug: 'carolina-paz',
    display_name: 'Carolina Paz',
    age: 29,
    city: 'Santiago',
    commune: 'Vitacura',
    category: 'masajes',
    is_verified: true,
    is_featured: false,
    average_rating: 4.6,
    review_count: 19,
    price_from: 55000,
    primary_image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600',
  },
  {
    id: '6',
    slug: 'fernanda-lopez',
    display_name: 'Fernanda López',
    age: 27,
    city: 'Concepción',
    commune: null,
    category: 'modelaje',
    is_verified: false,
    is_featured: false,
    average_rating: 4.5,
    review_count: 12,
    price_from: 60000,
    primary_image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600',
  },
]

const cities = ['Todas', 'Santiago', 'Viña del Mar', 'Concepción', 'Valparaíso']
const sortOptions = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'newest', label: 'Más recientes' },
]

export default function ExplorarPage() {
  const searchParams = useSearchParams()

  const categoryParam = searchParams.get('category')

  const normalizedInitialCategory = useMemo<ProviderCategory | 'all'>(
    () => (categoryParam === 'masajes' || categoryParam === 'modelaje' ? categoryParam : 'all'),
    [categoryParam],
  )

  const [filters, setFilters] = useState<FilterOptions>({
    category: normalizedInitialCategory,
    city: undefined,
    verified_only: false,
    sort_by: 'relevance',
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setFilters((prev) => ({ ...prev, category: normalizedInitialCategory }))
  }, [normalizedInitialCategory])

  // Filter providers
  const filteredProviders = allProviders.filter((provider) => {
    if (filters.category && filters.category !== 'all' && provider.category !== filters.category) {
      return false
    }
    if (filters.city && filters.city !== 'Todas' && provider.city !== filters.city) {
      return false
    }
    if (filters.verified_only && !provider.is_verified) {
      return false
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        provider.display_name.toLowerCase().includes(query) ||
        provider.city.toLowerCase().includes(query) ||
        (provider.commune?.toLowerCase().includes(query) ?? false)
      )
    }
    return true
  })

  // Sort providers
  const sortedProviders = [...filteredProviders].sort((a, b) => {
    switch (filters.sort_by) {
      case 'rating':
        return b.average_rating - a.average_rating
      case 'price_asc':
        return a.price_from - b.price_from
      case 'price_desc':
        return b.price_from - a.price_from
      default:
        return b.is_featured ? 1 : -1
    }
  })

  const activeFiltersCount = [
    filters.category !== 'all',
    filters.city && filters.city !== 'Todas',
    filters.verified_only,
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background-secondary border-b border-border sticky top-16 z-40">
        <div className="container-luxury py-4">
          {/* Search and Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
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

            {/* Filter Buttons */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {/* Category */}
              <select
                value={filters.category || 'all'}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value as ProviderCategory | 'all' })
                }
                className="input-luxury min-w-[140px]"
              >
                <option value="all">Categoría</option>
                <option value="masajes">Masajes</option>
                <option value="modelaje">Modelaje</option>
              </select>

              {/* City */}
              <select
                value={filters.city || 'Todas'}
                onChange={(e) =>
                  setFilters({ ...filters, city: e.target.value === 'Todas' ? undefined : e.target.value })
                }
                className="input-luxury min-w-[140px]"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={filters.sort_by || 'relevance'}
                onChange={(e) =>
                  setFilters({ ...filters, sort_by: e.target.value as FilterOptions['sort_by'] })
                }
                className="input-luxury min-w-[160px]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Mobile Filter Button */}
              <Button
                variant="outline"
                className="sm:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="gold" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.category !== 'all' || filters.city || filters.verified_only) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.category && filters.category !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {filters.category === 'masajes' ? 'Masajes' : 'Modelaje'}
                  <button onClick={() => setFilters({ ...filters, category: 'all' })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.city && filters.city !== 'Todas' && (
                <Badge variant="secondary" className="gap-1">
                  {filters.city}
                  <button onClick={() => setFilters({ ...filters, city: undefined })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.verified_only && (
                <Badge variant="secondary" className="gap-1">
                  Solo verificados
                  <button onClick={() => setFilters({ ...filters, verified_only: false })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <button
                onClick={() =>
                  setFilters({
                    category: 'all',
                    city: undefined,
                    verified_only: false,
                    sort_by: 'relevance',
                  })
                }
                className="text-sm text-gold hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-foreground-secondary text-sm">
              <span className="font-medium text-foreground">{sortedProviders.length}</span> profesionales encontrados
            </p>
            <label className="hidden sm:flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verified_only}
                onChange={(e) => setFilters({ ...filters, verified_only: e.target.checked })}
                className="rounded border-border text-gold focus:ring-gold"
              />
              <span className="text-sm text-foreground-secondary">Solo verificados</span>
            </label>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container-luxury py-8">
        {sortedProviders.length > 0 ? (
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
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-foreground-secondary mb-4">
              Intenta ajustar los filtros o buscar con otros términos
            </p>
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  category: 'all',
                  city: undefined,
                  verified_only: false,
                  sort_by: 'relevance',
                })
              }
            >
              Limpiar filtros
            </Button>
          </div>
        )}

        {/* Load More */}
        {sortedProviders.length > 0 && sortedProviders.length >= 8 && (
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg">
              Cargar más
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

