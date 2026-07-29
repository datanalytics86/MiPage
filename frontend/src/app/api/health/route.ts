import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const hasAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const supabaseConfigured = hasUrl && hasAnon

  const body = {
    status: supabaseConfigured ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      supabase_env: supabaseConfigured,
      resend: Boolean(process.env.RESEND_API_KEY),
      mercadopago: Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN),
      sentry: Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
    },
  }

  return NextResponse.json(body, {
    status: supabaseConfigured ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  })
}
