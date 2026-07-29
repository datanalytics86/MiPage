import { describe, it, expect } from 'vitest'
import {
  analyzeProviderFlags,
  canTransitionStatus,
  comparePendingForQueue,
  moderationRiskScore,
  photoCount,
  summarizeAdminDay,
} from '@/lib/moderation'

describe('moderation transitions', () => {
  it('allows pending → approved/rejected', () => {
    expect(canTransitionStatus('pending', 'approved')).toBe(true)
    expect(canTransitionStatus('pending', 'rejected')).toBe(true)
    expect(canTransitionStatus('approved', 'suspended')).toBe(true)
  })

  it('blocks invalid jumps only when not listed', () => {
    // approved → pending is allowed (reopen)
    expect(canTransitionStatus('approved', 'pending')).toBe(true)
  })
})

describe('smart flags', () => {
  it('flags no photos as high', () => {
    const flags = analyzeProviderFlags({
      display_name: 'Ana',
      bio: 'Bio suficientemente larga para pasar el mínimo de cuarenta caracteres',
      city: 'Santiago',
      photos: [],
    })
    expect(flags.some((f) => f.code === 'NO_PHOTOS')).toBe(true)
    expect(moderationRiskScore(flags)).toBeGreaterThan(0)
  })

  it('flags thin bio and few photos', () => {
    const flags = analyzeProviderFlags({
      display_name: 'Camila Test',
      bio: 'Corta',
      city: 'Santiago',
      photos: ['https://x.com/a.jpg'],
      category: 'masajes',
      price_min: 100,
    })
    expect(flags.some((f) => f.code === 'BIO_THIN')).toBe(true)
    expect(flags.some((f) => f.code === 'FEW_PHOTOS')).toBe(true)
    expect(flags.some((f) => f.code === 'PRICE_ODD')).toBe(true)
  })

  it('flags unknown category and contact in bio', () => {
    const flags = analyzeProviderFlags({
      display_name: 'Sofia',
      bio: 'Contactame por whatsapp +56912345678 para mas info y detalles del servicio',
      city: 'Viña',
      photos: ['a', 'b', 'c'],
      category: 'otro',
    })
    expect(flags.some((f) => f.code === 'CONTACT_IN_BIO')).toBe(true)
    expect(flags.some((f) => f.code === 'CATEGORY_UNKNOWN')).toBe(true)
  })

  it('flags spam in bio', () => {
    const flags = analyzeProviderFlags({
      display_name: 'Test',
      bio: 'Mira bit.ly/xxx oferta gratis total ahora mismo y más texto',
      photos: ['https://x.com/a.jpg', 'https://x.com/b.jpg'],
      city: 'Santiago',
    })
    expect(flags.some((f) => f.code === 'BIO_SPAM')).toBe(true)
  })

  it('counts photos', () => {
    expect(photoCount({ photos: ['a', 'b'] })).toBe(2)
    expect(photoCount({ cover_photo: 'c', photos: [] })).toBe(1)
  })

  it('sorts high risk first', () => {
    const a = {
      display_name: 'Ok',
      bio: 'x'.repeat(50),
      photos: ['1', '2', '3'],
      city: 'Santiago',
      created_at: '2026-01-02T00:00:00Z',
    }
    const b = {
      display_name: 'X',
      bio: '',
      photos: [],
      city: '',
      created_at: '2026-01-01T00:00:00Z',
    }
    expect(comparePendingForQueue(a, b)).toBeGreaterThan(0)
  })
})

describe('admin day summary', () => {
  it('summarizes clean queue', () => {
    expect(summarizeAdminDay({ pendingProviders: 0, pendingReports: 0 })).toMatch(
      /limpia/i
    )
  })

  it('lists pending work', () => {
    const s = summarizeAdminDay({ pendingProviders: 3, pendingReports: 1 })
    expect(s).toContain('3')
    expect(s).toContain('1')
  })
})
