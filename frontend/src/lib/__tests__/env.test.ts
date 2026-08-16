import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { allowMockCatalog, hasSupabaseEnv } from '@/lib/supabase/env'

const keys = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

describe('hasSupabaseEnv', () => {
  const prev: Record<string, string | undefined> = {}

  beforeEach(() => {
    for (const k of keys) {
      prev[k] = process.env[k]
    }
  })

  afterEach(() => {
    for (const k of keys) {
      if (prev[k] === undefined) delete process.env[k]
      else process.env[k] = prev[k]
    }
  })

  it('false when missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    expect(hasSupabaseEnv()).toBe(false)
  })

  it('false for placeholders and dummies', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy-anon-key-for-ci'
    expect(hasSupabaseEnv()).toBe(false)

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJ.placeholder'
    expect(hasSupabaseEnv()).toBe(false)
  })

  it('true for real-looking project url + key', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdefgh.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.sig'
    expect(hasSupabaseEnv()).toBe(true)
  })

  it('never allows mock catalog when supabase is configured', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdefgh.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.sig'
    expect(allowMockCatalog()).toBe(false)
  })

  it('allows mock catalog only in development without supabase', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    vi.stubEnv('NODE_ENV', 'development')
    expect(allowMockCatalog()).toBe(true)
    vi.stubEnv('NODE_ENV', 'production')
    expect(allowMockCatalog()).toBe(false)
    vi.unstubAllEnvs()
  })
})
