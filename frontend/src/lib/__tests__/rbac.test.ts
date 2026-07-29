import { describe, it, expect } from 'vitest'
import {
  canAccessAdmin,
  canAccessDashboard,
  canModerateProviders,
  canEscalateToAdminFromClient,
  canChangeUserRole,
  canFeatureProvider,
} from '@/lib/rbac'

describe('RBAC policies', () => {
  it('blocks user from admin', () => {
    expect(canAccessAdmin('user')).toBe(false)
    expect(canAccessAdmin('provider')).toBe(false)
    expect(canAccessAdmin('admin')).toBe(true)
  })

  it('blocks user from dashboard', () => {
    expect(canAccessDashboard('user')).toBe(false)
    expect(canAccessDashboard('provider')).toBe(true)
    expect(canAccessDashboard('admin')).toBe(true)
  })

  it('prevents privilege escalation by non-admin', () => {
    expect(canEscalateToAdminFromClient('user', 'admin')).toBe(false)
    expect(canEscalateToAdminFromClient('provider', 'admin')).toBe(false)
    expect(canEscalateToAdminFromClient('admin', 'user')).toBe(true)
  })

  it('only admin moderates and features', () => {
    expect(canModerateProviders('provider')).toBe(false)
    expect(canModerateProviders('admin')).toBe(true)
    expect(canFeatureProvider('user')).toBe(false)
    expect(canFeatureProvider('admin')).toBe(true)
  })

  it('only admin changes roles', () => {
    expect(canChangeUserRole('user', 'admin')).toBe(false)
    expect(canChangeUserRole('admin', 'provider')).toBe(true)
    expect(canChangeUserRole('admin', 'admin')).toBe(true)
  })
})
