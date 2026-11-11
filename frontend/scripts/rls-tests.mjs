#!/usr/bin/env node
/**
 * Pruebas RLS de la fase 1 contra un Supabase local.
 *
 *   npx supabase start
 *   node scripts/rls-tests.mjs
 *
 * Lee la URL y las llaves de SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY.
 * Si `npx supabase status -o env` funciona, usa esa salida.
 *
 * Código 0: las aserciones pasaron.
 * Código 2: no hay Supabase local (no es un fallo de la prueba, no se pudo correr).
 * Código 1: una aserción falló.
 */
import { createClient } from '@supabase/supabase-js'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

function loadStatusEnv() {
  try {
    const raw = execSync('npx supabase status -o env', {
      cwd: new URL('..', import.meta.url),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    for (const line of raw.split('\n')) {
      const eq = line.indexOf('=')
      if (eq === -1) continue
      const key = line.slice(0, eq).trim()
      const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      if (key && value && !process.env[key]) process.env[key] = value
    }
  } catch {
    /* CLI or Docker not available */
  }
}

loadStatusEnv()

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.API_URL
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY

if (!url || !anonKey || !serviceKey) {
  console.error('NO EJECUTADO: falta Supabase local (URL, anon key y service role).')
  console.error('Levanta `npx supabase start` en frontend/ y vuelve a correr este script.')
  process.exit(2)
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
const password = `Rls-${randomUUID()}!`
const stamp = randomUUID().slice(0, 8)
const emails = {
  user: `rls-user-${stamp}@example.com`,
  provider: `rls-provider-${stamp}@example.com`,
  admin: `rls-admin-${stamp}@example.com`,
}
const created = []

function assert(cond, message) {
  if (!cond) throw new Error(message)
}

async function signUp(email, role) {
  const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { name: email, role, privacy_consent: 'true', privacy_consent_version: '2026-11-11' } },
  })
  if (error) throw new Error(`signup ${email}: ${error.message}`)
  const id = data.user?.id
  if (!id) throw new Error(`signup ${email} sin id`)
  created.push(id)
  if (!data.session) {
    const { error: signError } = await client.auth.signInWithPassword({ email, password })
    if (signError) throw new Error(`login ${email}: ${signError.message}`)
  }
  return { client, id }
}

async function main() {
  const user = await signUp(emails.user, 'admin')
  const provider = await signUp(emails.provider, 'provider')
  const adminUser = await signUp(emails.admin, 'user')

  const { error: promoteError } = await admin
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', adminUser.id)
  if (promoteError) throw new Error(`promote admin: ${promoteError.message}`)

  const { data: userProfile } = await admin.from('profiles').select('role, email').eq('id', user.id).single()
  assert(userProfile?.role === 'user', 'metadata role=admin debe quedar como user')

  const { error: roleError } = await user.client.from('profiles').update({ role: 'admin' }).eq('id', user.id)
  const { data: afterRole } = await admin.from('profiles').select('role').eq('id', user.id).single()
  assert(roleError || afterRole?.role === 'user', 'un usuario no puede hacerse admin')
  assert(afterRole?.role === 'user', 'el rol sigue siendo user')

  const { data: anonProfiles, error: anonError } = await createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
    .from('profiles')
    .select('email, phone')
  assert(!anonError, `anon select profiles no debe fallar por otra causa: ${anonError?.message}`)
  assert((anonProfiles || []).length === 0, 'anon no lee email ni phone')

  const { data: publicNames, error: namesError } = await createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
    .from('public_profiles')
    .select('id, name, avatar_url')
    .eq('id', user.id)
  assert(!namesError, `public_profiles: ${namesError?.message}`)
  assert((publicNames || []).some((row) => row.id === user.id), 'la vista pública muestra nombre')
  assert(publicNames?.every((row) => !('email' in row)), 'la vista no trae email')

  const { error: becomeError } = await provider.client.rpc('become_provider')
  if (becomeError && !String(becomeError.message).includes('0 rows')) {
    /* already provider via trigger */
  }
  const { data: owned } = await admin.from('providers').select('id, status, is_featured').eq('user_id', provider.id).maybeSingle()
  let providerId = owned?.id
  if (!providerId) {
    const { data: inserted, error: insertError } = await provider.client
      .from('providers')
      .insert({
        user_id: provider.id,
        slug: `rls-${stamp}`,
        display_name: 'RLS Provider',
        category: 'masajes',
        city: 'Santiago',
        status: 'approved',
        is_featured: true,
        is_verified: true,
      })
      .select('id, status, is_featured, is_verified')
      .single()
    if (insertError) throw new Error(`insert provider: ${insertError.message}`)
    providerId = inserted.id
    assert(inserted.status === 'pending', 'insert fuerza pending')
    assert(inserted.is_featured === false && inserted.is_verified === false, 'insert no destaca ni verifica')
  }

  const { error: approveError } = await provider.client
    .from('providers')
    .update({ status: 'approved', is_featured: true, is_verified: true })
    .eq('id', providerId)
  const { data: afterApprove } = await admin.from('providers').select('status, is_featured, is_verified').eq('id', providerId).single()
  assert(approveError || afterApprove.status !== 'approved' || afterApprove.status === 'pending', 'el proveedor no se aprueba solo')
  assert(afterApprove.is_featured === false, 'el proveedor no se destaca solo')
  assert(afterApprove.is_verified === false, 'el proveedor no se verifica solo')
  assert(afterApprove.status === 'pending', 'el estado sigue pending')

  await admin.from('services').insert({ provider_id: providerId, name: 'Sesión', price: 10000 })
  await admin.from('gallery').insert({ provider_id: providerId, url: 'https://example.com/a.jpg', type: 'image' })

  const anon = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: hiddenServices } = await anon.from('services').select('id').eq('provider_id', providerId)
  const { data: hiddenGallery } = await anon.from('gallery').select('id').eq('provider_id', providerId)
  assert((hiddenServices || []).length === 0, 'anon no ve servicios pending')
  assert((hiddenGallery || []).length === 0, 'anon no ve galería pending')

  const { error: selfReview } = await provider.client.from('reviews').insert({
    provider_id: providerId,
    user_id: provider.id,
    rating: 5,
    comment: 'yo mismo',
  })
  assert(selfReview, 'un proveedor no puede reseñarse')

  await admin.from('providers').update({ status: 'approved' }).eq('id', providerId)
  const { data: review, error: reviewError } = await user.client
    .from('reviews')
    .insert({
      provider_id: providerId,
      user_id: user.id,
      rating: 4,
      comment: 'muy bien',
    })
    .select('id')
    .single()
  if (reviewError) throw new Error(`review: ${reviewError.message}`)

  const { data: rated } = await admin.from('providers').select('rating, review_count').eq('id', providerId).single()
  assert(Number(rated.review_count) === 1, 'review_count se actualiza')
  assert(Number(rated.rating) === 4, 'rating se actualiza')

  const { error: tamper } = await provider.client
    .from('reviews')
    .update({ rating: 1, comment: 'cambiado' })
    .eq('id', review.id)
  const { data: intact } = await admin.from('reviews').select('rating, comment').eq('id', review.id).single()
  assert(tamper || (intact.rating === 4 && intact.comment === 'muy bien'), 'el proveedor no reescribe la reseña')
  assert(intact.rating === 4 && intact.comment === 'muy bien', 'rating y comment siguen intactos')

  console.log('RLS ok')
}

main()
  .catch((error) => {
    console.error('FALLO:', error.message || error)
    process.exitCode = 1
  })
  .finally(async () => {
    for (const id of created) {
      await admin.auth.admin.deleteUser(id).catch(() => {})
    }
  })
