/**
 * Sends an error to Sentry only when a DSN is configured.
 * Without SENTRY_DSN or NEXT_PUBLIC_SENTRY_DSN this function returns immediately.
 */

function sentryDsn() {
  return process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || ''
}

export function sentryEnabled() {
  return Boolean(sentryDsn())
}

export async function captureException(error: unknown): Promise<void> {
  const dsn = sentryDsn()
  if (!dsn) return
  try {
    const parsed = new URL(dsn)
    const key = parsed.username
    const projectId = parsed.pathname.replace(/^\//, '')
    if (!key || !projectId) return
    const eventId = crypto.randomUUID().replace(/-/g, '')
    await fetch(`${parsed.protocol}//${parsed.host}/api/${projectId}/store/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${key}, sentry_client=mipage/1.1`,
      },
      body: JSON.stringify({
        event_id: eventId,
        timestamp: Date.now() / 1000,
        platform: 'javascript',
        level: 'error',
        message: error instanceof Error ? error.message : 'Error sin mensaje',
        extra: error instanceof Error && error.stack ? { stack: error.stack.slice(0, 4000) } : undefined,
      }),
    })
  } catch {
    /* un fallo de Sentry no debe tumbar la página */
  }
}
