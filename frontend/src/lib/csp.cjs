/**
 * CSP for next.config.js. `unsafe-eval` stays in development only
 * (Next.js dev tooling). Production builds omit it.
 */
function contentSecurityPolicy(nodeEnv) {
  const scriptSrc =
    nodeEnv === 'production'
      ? "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com"

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com https://api.mercadopago.com https://challenges.cloudflare.com",
    "frame-src https://challenges.cloudflare.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

module.exports = { contentSecurityPolicy }
