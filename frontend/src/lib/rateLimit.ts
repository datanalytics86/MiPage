/**
 * Simple in-memory sliding window rate limiter (Edge/Node route handlers).
 * Not distributed — good enough for single-region Vercel functions.
 */

type Entry = { count: number; resetAt: number }

const buckets = new Map<string, Entry>()

export interface RateLimitResult {
  ok: boolean
  remaining: number
  retryAfterSec: number
}

export function rateLimit(
  key: string,
  limit = 30,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now()
  const cur = buckets.get(key)
  if (!cur || cur.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfterSec: 0 }
  }
  if (cur.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((cur.resetAt - now) / 1000)),
    }
  }
  cur.count += 1
  return {
    ok: true,
    remaining: Math.max(0, limit - cur.count),
    retryAfterSec: 0,
  }
}

/** Test helper */
export function _resetRateLimitBuckets(): void {
  buckets.clear()
}

export function clientIpFromRequest(req: {
  headers: { get(name: string): string | null }
}): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]?.trim() || 'unknown'
  return req.headers.get('x-real-ip') || 'unknown'
}
