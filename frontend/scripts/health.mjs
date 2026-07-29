#!/usr/bin/env node
/**
 * One-click health check against local or remote app.
 * Usage: npm run health
 *        APP_URL=https://mi-page-lake.vercel.app npm run health
 */
const base = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000'
const url = `${base.replace(/\/$/, '')}/api/health`

try {
  const res = await fetch(url, { cache: 'no-store' })
  const body = await res.json()
  console.log(JSON.stringify({ url, status: res.status, body }, null, 2))
  process.exit(res.ok ? 0 : 1)
} catch (e) {
  console.error('Health check failed:', e.message)
  console.error(`Tried: ${url}`)
  process.exit(1)
}
