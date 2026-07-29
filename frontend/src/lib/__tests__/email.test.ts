import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  buildApprovalEmail,
  buildRejectionEmail,
  escapeHtml,
  sendTransactionalEmail,
} from '../email'

describe('email templates', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.RESEND_API_KEY
  })

  it('escapes html in names', () => {
    expect(escapeHtml('<b>x</b>')).toBe('&lt;b&gt;x&lt;/b&gt;')
    expect(escapeHtml('"x"')).toContain('&quot;')
  })

  it('builds approval email', () => {
    const m = buildApprovalEmail('Ana <script>', 'https://example.com')
    expect(m.subject).toMatch(/aprobado/i)
    expect(m.html).not.toContain('<script>')
    expect(m.html).toContain('https://example.com')
  })

  it('builds rejection with reason', () => {
    const m = buildRejectionEmail('Bob', 'Fotos insuficientes', 'https://app.test')
    expect(m.html).toContain('Fotos insuficientes')
    expect(m.html).toContain('/dashboard')
  })

  it('skips send without API key', async () => {
    const r = await sendTransactionalEmail({
      to: 'a@b.com',
      subject: 't',
      html: '<p>x</p>',
    })
    expect(r.skipped).toBe(true)
    expect(r.sent).toBe(false)
  })

  it('sends when Resend responds ok', async () => {
    process.env.RESEND_API_KEY = 're_test'
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'msg_1' }),
      })
    )
    const r = await sendTransactionalEmail({
      to: 'a@b.com',
      subject: 't',
      html: '<p>x</p>',
    })
    expect(r.sent).toBe(true)
    expect(r.id).toBe('msg_1')
  })

  it('returns error when Resend fails', async () => {
    process.env.RESEND_API_KEY = 're_test'
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        text: async () => 'boom',
      })
    )
    const r = await sendTransactionalEmail({
      to: 'a@b.com',
      subject: 't',
      html: '<p>x</p>',
    })
    expect(r.sent).toBe(false)
    expect(r.error).toBe('boom')
  })
})
