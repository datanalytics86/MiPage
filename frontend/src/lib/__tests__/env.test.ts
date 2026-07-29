import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { hasSupabaseEnv } from '@/lib/supabase/env'

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
})
