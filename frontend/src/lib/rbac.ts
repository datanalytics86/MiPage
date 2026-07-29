/**
 * Pure RBAC policy helpers (mirrors middleware + RLS intent).
 * Client must never self-escalate roles.
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

export function canEscalateToAdminFromClient(
  current: Role,
  requested: Role
): boolean {
  if (current === 'admin') return true
  return requested === current
}

export function canFeatureProvider(role: Role | null | undefined): boolean {
  return role === 'admin'
}

export function canChangeUserRole(
  actor: Role | null | undefined,
  targetNewRole: Role
): boolean {
  if (actor !== 'admin') return false
  return ['user', 'provider', 'admin'].includes(targetNewRole)
}
