import { createServiceRoleClient } from '@/lib/supabase/admin'
import { rateLimit, type RateLimitResult } from '@/lib/rateLimit'

/**
 * Prefer the Supabase RPC (shared across serverless instances).
 * Falls back to the in-memory limiter when the service role or the
 * migration is not available yet, so local dev and a half-applied
 * deploy still throttle instead of failing open.
 */
export async function persistentRateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  const memory = () => rateLimit(key, limit, windowSec * 1000)

  try {
    const admin = createServiceRoleClient()
    if (!admin) return memory()

    const { data, error } = await admin.rpc('consume_rate_limit', {
      p_key: key.slice(0, 200),
      p_limit: limit,
      p_window_seconds: windowSec,
    })
    if (error) return memory()

    const row = Array.isArray(data) ? data[0] : data
    if (!row || typeof row !== 'object') return memory()

    const record = row as { ok?: boolean; remaining?: number; retry_after_sec?: number }
    return {
      ok: Boolean(record.ok),
      remaining: Number(record.remaining ?? 0),
      retryAfterSec: Number(record.retry_after_sec ?? 0),
    }
  } catch {
    return memory()
  }
}
