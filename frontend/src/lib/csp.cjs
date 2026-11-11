/**
 * CSP for next.config.js. `unsafe-eval` stays in development only
 * (Next.js dev tooling). Production builds omit it.
 */
function contentSecurityPolicy(nodeEnv) {
  const scriptSrc =
    nodeEnv === 'production'
      ? "script-src 'self' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'"

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com https://api.mercadopago.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

module.exports = { contentSecurityPolicy }
