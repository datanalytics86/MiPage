import { afterEach, describe, expect, it } from 'vitest'
import { verifyTurnstile } from '../turnstile'

describe('verifyTurnstile', () => {
  const previous = process.env.TURNSTILE_SECRET_KEY

  afterEach(() => {
    if (previous === undefined) delete process.env.TURNSTILE_SECRET_KEY
    else process.env.TURNSTILE_SECRET_KEY = previous
  })

  it('skips when the secret is absent', async () => {
    delete process.env.TURNSTILE_SECRET_KEY
    await expect(verifyTurnstile(undefined, '127.0.0.1')).resolves.toEqual({ ok: true, skipped: true })
  })

  it('rejects a missing token when the secret is set', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    await expect(verifyTurnstile('', '127.0.0.1')).resolves.toEqual({ ok: false, skipped: false })
  })
})
