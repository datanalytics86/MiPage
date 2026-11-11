import { createRequire } from 'node:module'
import { describe, it, expect } from 'vitest'

const require = createRequire(import.meta.url)
const { contentSecurityPolicy } = require('../csp.cjs') as {
  contentSecurityPolicy: (nodeEnv: string | undefined) => string
}

describe('contentSecurityPolicy', () => {
  it('omits unsafe-eval in production', () => {
    const csp = contentSecurityPolicy('production')
    expect(csp).not.toContain('unsafe-eval')
    expect(csp).toContain("script-src 'self' 'unsafe-inline'")
  })

  it('keeps unsafe-eval in development', () => {
    const csp = contentSecurityPolicy('development')
    expect(csp).toContain('unsafe-eval')
  })
})
