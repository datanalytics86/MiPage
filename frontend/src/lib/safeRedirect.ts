/**
 * Only same-origin paths. Rejects protocol-relative URLs (`//evil`)
 * and backslash tricks (`/\evil`, `/\`).
 */
export function safeRedirect(input: string | null | undefined, fallback = '/'): string {
  if (input == null) return fallback
  const value = input.trim()
  if (!value.startsWith('/')) return fallback
  if (value.startsWith('//')) return fallback
  if (value.startsWith('/\\')) return fallback
  if (value.includes('\\')) return fallback
  if (value.includes('://')) return fallback

  const lower = value.toLowerCase()
  if (
    lower.includes('%2f%2f') ||
    lower.includes('%5c') ||
    lower.includes('%0a') ||
    lower.includes('%0d')
  ) {
    return fallback
  }

  return value
}
