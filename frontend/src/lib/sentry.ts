// Sentry init — graceful no-op if DSN is not set
export function initSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn || typeof window === 'undefined') return

  import('@sentry/nextjs').then(({ init }) => {
    init({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
    })
  }).catch(() => {})
}

export function captureError(err: unknown, context?: Record<string, unknown>) {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn) {
    console.error('[error]', err, context)
    return
  }
  import('@sentry/nextjs').then(({ captureException }) => captureException(err, { extra: context }))
}
