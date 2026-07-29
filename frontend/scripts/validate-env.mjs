#!/usr/bin/env node
/**
 * Valida variables de entorno antes del build.
 *
 * - Local dev: solo advertencia
 * - CI: acepta dummies inyectados por el workflow
 * - Vercel Preview: no aborta (permite previews sin todos los secrets)
 * - Vercel Production: falla si faltan URL/anon key reales
 *
 * Placeholders se inyectan para que `next build` complete; runtime usa
 * hasSupabaseEnv() y no trata placeholders como prod real.
 */
const isVercel = process.env.VERCEL === '1'
const vercelEnv = process.env.VERCEL_ENV // production | preview | development
const isCi = process.env.CI === 'true'
const isVercelProduction = isVercel && vercelEnv === 'production'

const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']
const recommended = ['NEXT_PUBLIC_APP_URL']

const missing = required.filter((key) => !process.env[key]?.trim())
const missingRecommended = recommended.filter((key) => !process.env[key]?.trim())

const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'

function isPlaceholder(url, key) {
  const u = (url || '').toLowerCase()
  const k = key || ''
  return (
    u.includes('placeholder') ||
    u.includes('example.supabase') ||
    u.includes('tu-proyecto') ||
    k.startsWith('dummy-') ||
    k.includes('placeholder')
  )
}

if (missing.length) {
  const msg = `MiPage build: faltan variables requeridas: ${missing.join(', ')}`
  if (isVercelProduction) {
    console.error(`ERROR: ${msg}`)
    console.error(
      'Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel → Settings → Environment Variables (Production).'
    )
    process.exit(1)
  }
  console.warn(`WARN: ${msg}`)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = PLACEHOLDER_URL
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()) {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = PLACEHOLDER_KEY
  }
  console.warn('WARN: usando placeholders solo para completar el build (no son prod).')
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (isVercelProduction && isPlaceholder(url, key)) {
  console.error(
    'ERROR: Production no puede usar placeholders. Configura secrets reales de Supabase en Vercel.'
  )
  process.exit(1)
}

if (missingRecommended.length) {
  console.warn(
    `WARN: variables recomendadas ausentes: ${missingRecommended.join(', ')}`
  )
}

if (isCi || isVercel) {
  console.log(
    `OK: validate-env (${isVercel ? `vercel:${vercelEnv || 'unknown'}` : 'ci'})`
  )
} else {
  console.log('OK: validación de entorno MiPage completada')
}
