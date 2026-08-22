/** Postgres deadlock (40P01) retry for sequential client writes (MIP-016). */

export function isDeadlockError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const code = String((error as { code?: string }).code || '')
  const message = String((error as { message?: string }).message || '')
  return code === '40P01' || /deadlock detected/i.test(message)
}

export function isAuthSessionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const status = (error as { status?: number }).status
  const code = String((error as { code?: string }).code || '').toLowerCase()
  const message = String((error as { message?: string }).message || '').toLowerCase()
  return (
    status === 401 ||
    code === 'pgrst301' ||
    message.includes('jwt') ||
    message.includes('invalid token') ||
    message.includes('expired') ||
    message.includes('not authenticated')
  )
}

export async function retryOnDeadlock<T>(
  fn: () => Promise<T>,
  attempts = 3
): Promise<T> {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (!isDeadlockError(error) || i === attempts - 1) throw error
      const delayMs = 200 * 2 ** i
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
  throw lastError
}
