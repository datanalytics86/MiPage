import { describe, it, expect } from 'vitest'
import { buildWhatsAppLink } from '@/lib/whatsapp'

describe('buildWhatsAppLink', () => {
  it('returns null for empty phone', () => {
    expect(buildWhatsAppLink(null, 'Ana')).toBeNull()
    expect(buildWhatsAppLink('abc', 'Ana')).toBeNull()
  })

  it('builds wa.me with encoded message and MiPage source', () => {
    const link = buildWhatsAppLink('+56 9 1234 5678', 'Valentina', {
      source: 'MiPage',
    })
    expect(link).toMatch(/^https:\/\/wa\.me\/56912345678\?text=/)
    expect(decodeURIComponent(link!.split('text=')[1])).toContain('Valentina')
    expect(decodeURIComponent(link!.split('text=')[1])).toContain('MiPage')
  })
})
