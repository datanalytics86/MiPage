#!/usr/bin/env node
/**
 * Crea un proveedor y un admin solo contra Supabase en 127.0.0.1 o localhost.
 * Escribe E2E_* en GITHUB_ENV cuando existe. No imprime la contraseña.
 */
import { createClient } from '@supabase/supabase-js'
import { execSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'

function loadStatusEnv() {
  try {
    const raw = execSync('npx supabase status -o env', {
      cwd: new URL('..', import.meta.url),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    for (const line of raw.split('\n')) {
      const trimmed = line.replace(/^export\s+/, '')
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      if (key && value && !process.env[key]) process.env[key] = value
    }
  } catch {
    /* CLI o Docker no disponibles */
  }
}

loadStatusEnv()

const url = process.env.API_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !anonKey || !serviceKey) {
  console.error('NO EJECUTADO: falta Supabase local.')
  process.exit(2)
}

let host = ''
try {
  host = new URL(url).hostname
} catch {
  console.error('URL de Supabase inválida.')
  process.exit(1)
}
if (host !== '127.0.0.1' && host !== 'localhost') {
  console.error('Rechazado: este script solo corre contra Supabase local.')
  process.exit(1)
}

const password = 'E2e-local-pass-2026'
const emails = {
  provider: 'e2e-provider@example.com',
  admin: 'e2e-admin@example.com',
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

async function ensureUser(email, metadata) {
  const { data: listed, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (listError) throw new Error(listError.message)
  const existing = listed.users?.find((user) => user.email === email)
  if (existing) return existing.id
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  })
  if (error || !data.user) throw new Error(`${email}: ${error?.message || 'sin usuario'}`)
  return data.user.id
}

async function main() {
  const providerId = await ensureUser(emails.provider, {
    name: 'E2E Provider',
    role: 'provider',
    age_declared: 'true',
    privacy_consent: 'true',
  })
  const adminId = await ensureUser(emails.admin, {
    name: 'E2E Admin',
    role: 'user',
    privacy_consent: 'true',
  })

  const { error: promoteError } = await admin.from('profiles').update({ role: 'admin' }).eq('id', adminId)
  if (promoteError) throw new Error(`promote admin: ${promoteError.message}`)

  const providerClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { error: signError } = await providerClient.auth.signInWithPassword({
    email: emails.provider,
    password,
  })
  if (signError) throw new Error(`login provider: ${signError.message}`)
  const { error: becomeError } = await providerClient.rpc('become_provider')
  if (becomeError) {
    const { data: profile } = await admin.from('profiles').select('role').eq('id', providerId).single()
    if (profile?.role !== 'provider') throw new Error(`become_provider: ${becomeError.message}`)
  }

  const lines = [
    `E2E_PROVIDER_EMAIL=${emails.provider}`,
    `E2E_PROVIDER_PASSWORD=${password}`,
    `E2E_ADMIN_EMAIL=${emails.admin}`,
    `E2E_ADMIN_PASSWORD=${password}`,
  ]
  if (process.env.GITHUB_ENV) appendFileSync(process.env.GITHUB_ENV, `${lines.join('\n')}\n`)
  console.log('Usuarios locales de E2E listos (contraseña no impresa).')
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
