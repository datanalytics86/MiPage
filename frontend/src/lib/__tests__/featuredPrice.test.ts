import { describe, it, expect, afterEach } from 'vitest'
import { DEFAULT_FEATURED_PRICE_CLP, featuredPriceFromSettings } from '@/lib/featuredPrice'

describe('featuredPriceFromSettings', () => {
  afterEach(() => {
    delete process.env.FEATURED_PRICE_CLP
  })

  it('uses a positive integer from settings', () => {
    expect(featuredPriceFromSettings({ featuredPrice: 15000 })).toBe(15000)
    expect(featuredPriceFromSettings({ featuredPrice: '12000' })).toBe(12000)
  })

  it('rejects prices the client could abuse', () => {
    expect(featuredPriceFromSettings({ featuredPrice: 0 })).toBe(DEFAULT_FEATURED_PRICE_CLP)
    expect(featuredPriceFromSettings({ featuredPrice: -1 })).toBe(DEFAULT_FEATURED_PRICE_CLP)
    expect(featuredPriceFromSettings({ featuredPrice: 1.5 })).toBe(DEFAULT_FEATURED_PRICE_CLP)
    expect(featuredPriceFromSettings({ featuredPrice: 9_000_000 })).toBe(DEFAULT_FEATURED_PRICE_CLP)
    expect(featuredPriceFromSettings(null)).toBe(DEFAULT_FEATURED_PRICE_CLP)
  })

  it('reads the server env when settings have no price', () => {
    process.env.FEATURED_PRICE_CLP = '20000'
    expect(featuredPriceFromSettings({ commissionRate: 15 })).toBe(20000)
  })
})
