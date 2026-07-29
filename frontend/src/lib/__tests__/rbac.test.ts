import { describe, it, expect } from 'vitest'

/**
 * Pure RBAC policy helpers mirroring middleware + RLS intent.
 * Integration against live Supabase is out of unit scope.
 */

export type Role = 'user' | 'provider' | 'admin'

export function canAccessAdmin(role: Role | null | undefined): boolean {
  return role === 'admin'
}

export function canAccessDashboard(role: Role | null | undefined): boolean {
  return role === 'provider' || role === 'admin'
}

export function canModerateProviders(role: Role | null | undefined): boolean {
  return role === 'admin'
}

export function canEscalateToAdminFromClient(current: Role, requested: Role): boolean {
  // Client must never self-escalate; only admin updates roles via admin UI + RLS
  if (current === 'admin') return true
  return requested === current
}

describe('RBAC policies', () => {
  it('blocks user from admin', () => {
    expect(canAccessAdmin('user')).toBe(false)
    expect(canAccessAdmin('provider')).toBe(false)
    expect(canAccessAdmin('admin')).toBe(true)
  })

  it('blocks user from dashboard', () => {
    expect(canAccessDashboard('user')).toBe(false)
    expect(canAccessDashboard('provider')).toBe(true)
  })

  it('prevents privilege escalation by non-admin', () => {
    expect(canEscalateToAdminFromClient('user', 'admin')).toBe(false)
    expect(canEscalateToAdminFromClient('provider', 'admin')).toBe(false)
    expect(canEscalateToAdminFromClient('admin', 'user')).toBe(true)
  })

  it('only admin moderates', () => {
    expect(canModerateProviders('provider')).toBe(false)
    expect(canModerateProviders('admin')).toBe(true)
  })
})
