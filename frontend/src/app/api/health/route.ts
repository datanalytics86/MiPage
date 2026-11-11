import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { hasSupabaseEnv } from '@/lib/supabase/env'

export const dynamic = 'force-dynamic'

async function databaseReachable(): Promise<boolean> {
  if (!hasSupabaseEnv()) return false
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
  const query = supabase.from('providers').select('id').limit(1)
  const result = await Promise.race([
    query,
    new Promise<{ error: { message: string } }>((resolve) => {
      setTimeout(() => resolve({ error: { message: 'timeout' } }), 4000)
    }),
  ])
  return !result.error
}

export async function GET() {
  const supabaseConfigured = hasSupabaseEnv()
  const database = supabaseConfigured ? await databaseReachable() : false
  const ok = supabaseConfigured && database

  const body = {
    status: ok ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.1.0',
    commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    checks: {
      supabase_env: supabaseConfigured,
      database,
      resend: Boolean(process.env.RESEND_API_KEY),
      mercadopago: Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN),
      sentry: Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
    },
  }

  return NextResponse.json(body, {
    status: ok ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  })
}
