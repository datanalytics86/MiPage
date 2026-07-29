import { describe, it, expect, beforeEach } from 'vitest'
import { rateLimit, _resetRateLimitBuckets, clientIpFromRequest } from '@/lib/rateLimit'

describe('rateLimit', () => {
  beforeEach(() => _resetRateLimitBuckets())

  it('allows under limit', () => {
    const r = rateLimit('t1', 3, 60_000)
    expect(r.ok).toBe(true)
    expect(r.remaining).toBe(2)
  })

  it('blocks when exceeded', () => {
    rateLimit('t2', 2, 60_000)
    rateLimit('t2', 2, 60_000)
    const r = rateLimit('t2', 2, 60_000)
    expect(r.ok).toBe(false)
    expect(r.retryAfterSec).toBeGreaterThan(0)
  })

  it('parses x-forwarded-for', () => {
    const ip = clientIpFromRequest({
      headers: {
        get: (n: string) =>
          n === 'x-forwarded-for' ? '1.2.3.4, 5.6.7.8' : null,
      },
    })
    expect(ip).toBe('1.2.3.4')
  })
})
