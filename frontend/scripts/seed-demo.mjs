#!/usr/bin/env node
/**
 * Seed demo MiPage — crea usuarios Auth y datos de demostración.
 *
 * Requiere en .env.local o variables de entorno:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Uso:
 *   node scripts/seed-demo.mjs
 *   node scripts/seed-demo.mjs --sql-only   # solo imprime SQL para el editor
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function loadEnvFile(path) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvFile(join(root, '.env.local'))
loadEnvFile(join(root, '.env'))

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const sqlOnly = process.argv.includes('--sql-only')

const DEMO_PASSWORD = process.env.DEMO_SEED_PASSWORD || 'DemoMiPage2026!'

const demoUsers = [
  { email: 'admin@mipage.cl', name: 'Admin MiPage', role: 'admin' },
  { email: 'valentina@mipage.cl', name: 'Valentina Reyes', role: 'provider', category: 'masajes', city: 'Santiago' },
  { email: 'camila@mipage.cl', name: 'Camila Silva', role: 'provider', category: 'modelaje', city: 'Santiago' },
  { email: 'sofia@mipage.cl', name: 'Sofía Martínez', role: 'provider', category: 'masajes', city: 'Viña del Mar' },
  { email: 'isabella@mipage.cl', name: 'Isabella Rojas', role: 'provider', category: 'modelaje', city: 'Santiago' },
  { email: 'cliente@mipage.cl', name: 'Cliente Demo', role: 'user' },
]

if (sqlOnly) {
  const seedPath = join(root, 'supabase', 'migrations', '003_seed_demo_data.sql')
  console.log(readFileSync(seedPath, 'utf8'))
  console.log('\n-- Ejecuta este SQL en Supabase después de crear los usuarios Auth manualmente.')
  process.exit(0)
}

if (!url || !serviceKey) {
  console.error('ERROR: faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY')
  console.error('Copia SUPABASE_SERVICE_ROLE_KEY en frontend/.env.local (no commitear).')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function ensureUser({ email, name, role, category, city }) {
  const { data: list, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (listError) throw listError

  const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

  if (existing) {
    console.log(`  ✓ Usuario existente: ${email}`)
    return existing.id
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { name, role, category, city },
  })

  if (error) throw new Error(`No se pudo crear ${email}: ${error.message}`)
  console.log(`  + Creado: ${email}`)
  return data.user.id
}

async function syncProfiles() {
  for (const user of demoUsers) {
    const { error } = await supabase
      .from('profiles')
      .update({ name: user.name, role: user.role })
      .eq('email', user.email)

    if (error) {
      console.warn(`  WARN perfil ${user.email}: ${error.message}`)
    }
  }
}

async function main() {
  console.log('MiPage seed demo')
  console.log(`Contraseña demo: ${DEMO_PASSWORD}\n`)

  console.log('1. Creando usuarios Auth...')
  for (const user of demoUsers) {
    await ensureUser(user)
  }

  console.log('\n2. Sincronizando perfiles...')
  await syncProfiles()

  console.log('\n3. Ejecuta en Supabase SQL Editor:')
  console.log('   supabase/migrations/003_seed_demo_data.sql')
  console.log('   (requiere migración 005 ejecutada previamente)\n')
  console.log('Listo. Los providers se crean al asignar role=provider; el SQL 003 los enriquece.')
}

main().catch((err) => {
  console.error('ERROR:', err.message || err)
  process.exit(1)
})