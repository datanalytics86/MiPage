'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ProviderCard } from '@/components/providers/ProviderCard'
import { mockProviders, filterCities, sortOptions } from '@/lib/mockProviders'
import type { FilterOptions, ProviderCategory } from '@/types'

const PAGE_SIZE = 8

interface ExplorarContentProps {
  initialCategory?: ProviderCategory
}

function getBasePath(category?: ProviderCategory | 'all') {
  if (category === 'masajes') return '/explorar/masajes'
  if (category === 'modelaje') return '/explorar/modelaje'
  return '/explorar'
}

function buildUrl(
  filters: FilterOptions,
  searchQuery: string,
  basePath: string
) {
  const params = new URLSearchParams()
  if (searchQuery.trim()) params.set('q', searchQuery.trim())
  if (basePath === '/explorar' && filters.category && filters.category !== 'all') {
    params.set('category', filters.category)
  }
  if (filters.city && filters.city !== 'Todas') params.set('city', filters.city)
  if (filters.verified_only) params.set('verified', '1')
  if (filters.sort_by && filters.sort_by !== 'relevance') params.set('sort', filters.sort_by)
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

export function ExplorarContent({ initialCategory }: ExplorarContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const defaultCategory = initialCategory ?? 'all'

  const [filters, setFilters] = useState<FilterOptions>({
    category: defaultCategory,
    city: undefined,
    verified_only: false,
    sort_by: 'relevance',
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const q = searchParams.get('q') ?? ''
    const categoryParam = searchParams.get('category') as ProviderCategory | null
    const category =
      initialCategory ?? (categoryParam && ['masajes', 'modelaje'].includes(categoryParam) ? categoryParam : 'all')
    const city = searchParams.get('city') ?? undefined
    const verified = searchParams.get('verified') === '1'
    const sort = (searchParams.get('sort') as FilterOptions['sort_by']) ?? 'relevance'

    setSearchQuery(q)
    setFilters({
      category,
      city: city || undefined,
      verified_only: verified,
      sort_by: sort,
    })
    setVisibleCount(PAGE_SIZE)
    setIsInitialized(true)
  }, [searchParams, initialCategory])

  const syncUrl = useCallback(
    (nextFilters: FilterOptions, nextQuery: string) => {
      const category = nextFilters.category ?? 'all'
      const basePath =
        category === 'masajes' || category === 'modelaje'
          ? getBasePath(category)
          : '/explorar'
      router.replace(buildUrl(nextFilters, nextQuery, basePath), { scroll: false })
    },
    [router]
  )

  useEffect(() => {
    if (!isInitialized) return
    const timer = setTimeout(() => syncUrl(filters, searchQuery), 350)
    return () => clearTimeout(timer)
  }, [filters, searchQuery, isInitialized, syncUrl])

  const updateFilters = (patch: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setVisibleCount(PAGE_SIZE)
  }

  const filteredProviders = useMemo(() => {
    return mockProviders.filter((provider) => {
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
          (provider.commune?.toLowerCase().includes(query) ?? false) ||
          provider.category.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [filters, searchQuery])

  const sortedProviders = useMemo(() => {
    return [...filteredProviders].sort((a, b) => {
      switch (filters.sort_by) {
        case 'rating':
          return b.average_rating - a.average_rating
        case 'price_asc':
          return a.price_from - b.price_from
        case 'price_desc':
          return b.price_from - a.price_from
        default:
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)
      }
    })
  }, [filteredProviders, filters.sort_by])

  const visibleProviders = sortedProviders.slice(0, visibleCount)
  const hasMore = visibleCount < sortedProviders.length

  const activeFiltersCount = [
    filters.category !== 'all',
    filters.city && filters.city !== 'Todas',
    filters.verified_only,
  ].filter(Boolean).length

  const clearFilters = () => {
    const cleared: FilterOptions = {
      category: initialCategory ?? 'all',
      city: undefined,
      verified_only: false,
      sort_by: 'relevance',
    }
    setFilters(cleared)
    setSearchQuery('')
    setVisibleCount(PAGE_SIZE)
    router.replace(getBasePath(initialCategory ?? 'all'))
  }

  const categoryTitle =
    initialCategory === 'masajes'
      ? 'Masajes'
      : initialCategory === 'modelaje'
        ? 'Modelaje'
        : null

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background-secondary border-b border-border sticky top-16 z-40">
        <div className="container-luxury py-4">
          {categoryTitle && (
            <div className="mb-3">
              <h1 className="font-display text-2xl font-semibold text-foreground">{categoryTitle}</h1>
              <p className="text-sm text-foreground-secondary">
                Profesionales de {categoryTitle.toLowerCase()} en Chile
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
              <Input
                type="search"
                placeholder="Buscar por nombre, ciudad..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setVisibleCount(PAGE_SIZE)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') syncUrl(filters, searchQuery)
                }}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <select
                value={filters.category || 'all'}
                onChange={(e) =>
                  updateFilters({ category: e.target.value as ProviderCategory | 'all' })
                }
                className="input-luxury min-w-[140px]"
              >
                <option value="all">Categoría</option>
                <option value="masajes">Masajes</option>
                <option value="modelaje">Modelaje</option>
              </select>

              <select
                value={filters.city || 'Todas'}
                onChange={(e) =>
                  updateFilters({
                    city: e.target.value === 'Todas' ? undefined : e.target.value,
                  })
                }
                className="input-luxury min-w-[140px]"
              >
                {filterCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <select
                value={filters.sort_by || 'relevance'}
                onChange={(e) =>
                  updateFilters({ sort_by: e.target.value as FilterOptions['sort_by'] })
                }
                className="input-luxury min-w-[160px]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(filters.category !== 'all' || filters.city || filters.verified_only || searchQuery) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  &ldquo;{searchQuery}&rdquo;
                  <button onClick={() => setSearchQuery('')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.category && filters.category !== 'all' && !initialCategory && (
                <Badge variant="secondary" className="gap-1">
                  {filters.category === 'masajes' ? 'Masajes' : 'Modelaje'}
                  <button onClick={() => updateFilters({ category: 'all' })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.city && filters.city !== 'Todas' && (
                <Badge variant="secondary" className="gap-1">
                  {filters.city}
                  <button onClick={() => updateFilters({ city: undefined })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.verified_only && (
                <Badge variant="secondary" className="gap-1">
                  Solo verificados
                  <button onClick={() => updateFilters({ verified_only: false })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <button onClick={clearFilters} className="text-sm text-gold hover:underline">
                Limpiar filtros
              </button>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <p className="text-foreground-secondary text-sm">
              <span className="font-medium text-foreground">{sortedProviders.length}</span> profesionales
              encontrados
            </p>
            <label className="hidden sm:flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verified_only}
                onChange={(e) => updateFilters({ verified_only: e.target.checked })}
                className="rounded border-border text-gold focus:ring-gold"
              />
              <span className="text-sm text-foreground-secondary">Solo verificados</span>
            </label>
          </div>
        </div>
      </div>

      <div className="container-luxury py-8">
        {visibleProviders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleProviders.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
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
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </div>
        )}

        {hasMore && (
          <div className="mt-12 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            >
              Cargar más ({sortedProviders.length - visibleCount} restantes)
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}