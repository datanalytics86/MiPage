// Sentry integration — graceful no-op when DSN is not configured
let Sentry = null

if (process.env.SENTRY_DSN) {
  try {
    Sentry = require('@sentry/node')
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 0,
    })
    console.info('[sentry] Inicializado correctamente')
  } catch (err) {
    console.warn('[sentry] No se pudo inicializar:', err.message)
    Sentry = null
  }
} else {
  console.info('[sentry] SENTRY_DSN no configurado — modo dev, errores solo en consola')
}

function captureException(err, context) {
  if (Sentry) {
    Sentry.captureException(err, { extra: context })
  } else {
    console.error('[error]', err?.message || err, context || '')
  }
}

function captureMessage(msg, level = 'info') {
  if (Sentry) {
    Sentry.captureMessage(msg, level)
  }
}

module.exports = { captureException, captureMessage, Sentry }
