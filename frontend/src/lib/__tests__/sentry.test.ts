import { describe, expect, it } from 'vitest'
import { captureException, sentryEnabled } from '../sentry'

describe('sentry', () => {
  it('stays inert without a DSN', async () => {
    delete process.env.SENTRY_DSN
    delete process.env.NEXT_PUBLIC_SENTRY_DSN
    expect(sentryEnabled()).toBe(false)
    await expect(captureException(new Error('falla de prueba'))).resolves.toBeUndefined()
  })
})
