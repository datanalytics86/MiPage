#!/usr/bin/env node
/**
 * Valida variables de entorno antes del build en producción.
 * En desarrollo solo advierte; en CI/producción falla si faltan claves críticas.
 */
const isProd =
  process.env.NODE_ENV === 'production' ||
  process.env.VERCEL === '1' ||
  process.env.CI === 'true'

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
]

const recommended = ['NEXT_PUBLIC_APP_URL']

const missing = required.filter((key) => !process.env[key]?.trim())
const missingRecommended = recommended.filter((key) => !process.env[key]?.trim())

if (missing.length) {
  const msg = `MiPage build: faltan variables requeridas: ${missing.join(', ')}`
  if (isProd) {
    console.error(`ERROR: ${msg}`)
    process.exit(1)
  }
  console.warn(`WARN: ${msg} (permitido en desarrollo)`)
}

if (missingRecommended.length) {
  console.warn(
    `WARN: variables recomendadas ausentes: ${missingRecommended.join(', ')}`
  )
}

console.log('OK: validación de entorno MiPage completada')