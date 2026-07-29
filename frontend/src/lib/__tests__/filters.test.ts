import { describe, it, expect } from 'vitest'
import { filterCities, sortOptions } from '@/lib/filters'

describe('filters', () => {
  it('includes Chile base cities and Todas', () => {
    expect(filterCities[0]).toBe('Todas')
    expect(filterCities).toContain('Santiago')
    expect(filterCities.length).toBeGreaterThanOrEqual(4)
  })

  it('exposes sort options with unique values', () => {
    const values = sortOptions.map((o) => o.value)
    expect(new Set(values).size).toBe(values.length)
    expect(values).toContain('rating')
    expect(values).toContain('price_asc')
  })
})
