import { NextResponse } from 'next/server'
import { clientIpFromRequest } from '@/lib/rateLimit'
import { persistentRateLimit } from '@/lib/persistentRateLimit'

/** Consumes one signup slot for this IP. The register form calls it before signUp. */
export async function POST(request: Request) {
  const ip = clientIpFromRequest(request)
  const rl = await persistentRateLimit(`register:${ip}`, 5, 60 * 60)
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: 'Demasiados intentos de registro. Espera un momento.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    )
  }
  return NextResponse.json({ ok: true })
}
