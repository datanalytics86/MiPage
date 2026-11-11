import { describe, it, expect } from 'vitest'
import { filterCities, sanitizePostgrestSearch, sortOptions } from '@/lib/filters'
import { normalizeCategory } from '@/lib/providers'

describe('filters', () => {
  it('keeps catalog slugs and rejects junk', () => {
    expect(normalizeCategory('spa-facial')).toBe('spa-facial')
    expect(normalizeCategory('Masajes')).toBe('masajes')
    expect(normalizeCategory('a b')).toBe('masajes')
  })

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

  it('strips PostgREST or-filter metacharacters and wildcards', () => {
    expect(sanitizePostgrestSearch('ana,role.eq.admin),user_id.eq.1')).toBe('anarole.eq.adminuserid.eq.1')
    expect(sanitizePostgrestSearch('100%_off')).toBe('100off')
    expect(sanitizePostgrestSearch('  (masajes)  ')).toBe('masajes')
    expect(sanitizePostgrestSearch('a\\b')).toBe('ab')
    expect(sanitizePostgrestSearch('x'.repeat(200))).toHaveLength(80)
  })
})
