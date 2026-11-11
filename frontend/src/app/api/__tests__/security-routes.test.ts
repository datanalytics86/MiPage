import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { getApiActor, createServerSupabaseClient } = vi.hoisted(() => ({
  getApiActor: vi.fn(),
  createServerSupabaseClient: vi.fn(),
}))

vi.mock('@/lib/api/actor', () => ({ getApiActor }))
vi.mock('@/lib/supabase/server', () => ({ createServerSupabaseClient }))
vi.mock('@/lib/notifications', () => ({
  recordAudit: vi.fn(),
  sendAndLog: vi.fn(),
}))
vi.mock('@/lib/persistentRateLimit', () => ({
  persistentRateLimit: vi.fn(async () => ({ ok: true, remaining: 4, retryAfterSec: 0 })),
}))

import { POST as notifyPost } from '@/app/api/notify/route'
import { POST as moderatePost } from '@/app/api/admin/providers/[id]/moderate/route'
import { POST as featuredPost } from '@/app/api/payments/featured/route'
import { POST as submitPost } from '@/app/api/providers/submit/route'

function post(url: string, body: unknown) {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function supabaseWithProvider(userId: string) {
  const builder = {
    select() {
      return builder
    },
    eq() {
      return builder
    },
    maybeSingle: async () => ({ data: { id: 'p1', user_id: userId, display_name: 'Ana' }, error: null }),
  }
  return { from: () => builder }
}

describe('server routes auth', () => {
  beforeEach(() => {
    getApiActor.mockReset()
    createServerSupabaseClient.mockReset()
  })

  it('notify returns 401 without a session', async () => {
    getApiActor.mockResolvedValue(null)
    const res = await notifyPost(post('http://localhost/api/notify', { type: 'generic', html: '<script>' }))
    expect(res.status).toBe(401)
  })

  it('notify rejects generic and invitation even with a session', async () => {
    getApiActor.mockResolvedValue({ id: 'u1', role: 'user' })
    const generic = await notifyPost(post('http://localhost/api/notify', { type: 'generic' }))
    expect(generic.status).toBe(400)
    const invitation = await notifyPost(post('http://localhost/api/notify', { type: 'invitation' }))
    expect(invitation.status).toBe(400)
  })

  it('notify no longer sends mail for old types', async () => {
    getApiActor.mockResolvedValue({ id: 'u1', role: 'admin' })
    const res = await notifyPost(post('http://localhost/api/notify', { type: 'provider_approved', email: 'a@b.c' }))
    expect(res.status).toBe(410)
  })

  it('moderate returns 401 without a session', async () => {
    getApiActor.mockResolvedValue(null)
    const res = await moderatePost(
      post('http://localhost/api/admin/providers/p1/moderate', { status: 'approved' }),
      { params: Promise.resolve({ id: '11111111-1111-4111-8111-111111111111' }) }
    )
    expect(res.status).toBe(401)
  })

  it('moderate returns 403 for a provider and a normal user', async () => {
    getApiActor.mockResolvedValue({ id: 'u1', role: 'provider' })
    const asProvider = await moderatePost(
      post('http://localhost/api/admin/providers/p1/moderate', { status: 'approved' }),
      { params: Promise.resolve({ id: '11111111-1111-4111-8111-111111111111' }) }
    )
    expect(asProvider.status).toBe(403)

    getApiActor.mockResolvedValue({ id: 'u2', role: 'user' })
    const asUser = await moderatePost(
      post('http://localhost/api/admin/providers/p1/moderate', { status: 'approved' }),
      { params: Promise.resolve({ id: '11111111-1111-4111-8111-111111111111' }) }
    )
    expect(asUser.status).toBe(403)
  })

  it('featured payment returns 401 without a session', async () => {
    getApiActor.mockResolvedValue(null)
    const res = await featuredPost(
      post('http://localhost/api/payments/featured', {
        providerId: '11111111-1111-4111-8111-111111111111',
        unitPrice: 1,
      })
    )
    expect(res.status).toBe(401)
  })

  it('featured payment returns 403 when the profile belongs to someone else', async () => {
    getApiActor.mockResolvedValue({ id: 'owner-a', role: 'provider' })
    createServerSupabaseClient.mockReturnValue(supabaseWithProvider('owner-b'))
    const res = await featuredPost(
      post('http://localhost/api/payments/featured', {
        providerId: '11111111-1111-4111-8111-111111111111',
        unitPrice: 1,
      })
    )
    expect(res.status).toBe(403)
  })

  it('listing submit returns 401 without a session and 403 for another owner', async () => {
    getApiActor.mockResolvedValue(null)
    const anon = await submitPost(
      post('http://localhost/api/providers/submit', {
        providerId: '11111111-1111-4111-8111-111111111111',
      })
    )
    expect(anon.status).toBe(401)

    getApiActor.mockResolvedValue({ id: 'owner-a', role: 'provider' })
    createServerSupabaseClient.mockReturnValue(supabaseWithProvider('owner-b'))
    const foreign = await submitPost(
      post('http://localhost/api/providers/submit', {
        providerId: '11111111-1111-4111-8111-111111111111',
      })
    )
    expect(foreign.status).toBe(403)
  })
})
