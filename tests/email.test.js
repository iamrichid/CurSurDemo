import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  buildKeyRotatedEmail,
  buildWelcomeEmail,
  buildWalletTopUpEmail,
  isEmailConfigured,
  sendEmail,
} from '../workers/src/email.js'

describe('isEmailConfigured', () => {
  it('returns true when RESEND_API_KEY is set', () => {
    expect(isEmailConfigured({ RESEND_API_KEY: 're_test' })).toBe(true)
  })

  it('returns false when key is missing', () => {
    expect(isEmailConfigured({})).toBe(false)
  })
})

describe('email templates', () => {
  it('builds welcome email with org name', () => {
    const { subject, html } = buildWelcomeEmail({
      orgName: 'Accra Delivery Co.',
      appUrl: 'https://example.com',
    })
    expect(subject).toContain('Welcome')
    expect(html).toContain('Accra Delivery Co.')
    expect(html).toContain('GH₵ 10.00')
  })

  it('escapes HTML in key rotated email', () => {
    const { html } = buildKeyRotatedEmail({
      orgName: '<script>alert(1)</script>',
      keyPrefix: 'a3_live_abcd',
      appUrl: 'https://example.com',
    })
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('builds wallet top-up email', () => {
    const { subject, html } = buildWalletTopUpEmail({
      orgName: 'Test Org',
      amountGhs: 20,
      balanceGhs: 30,
      appUrl: 'https://example.com',
    })
    expect(subject).toContain('20.00')
    expect(html).toContain('GH₵ 30.00')
  })
})

describe('sendEmail', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('skips when Resend is not configured', async () => {
    const result = await sendEmail({}, {
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    })
    expect(result.skipped).toBe(true)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('sends with User-Agent and Bearer token', async () => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ id: 'email_123' }), { status: 200 })
    )

    const result = await sendEmail(
      { RESEND_API_KEY: 're_test', EMAIL_FROM: 'ANY3MI <onboarding@resend.dev>' },
      {
        to: 'user@example.com',
        subject: 'Hello',
        html: '<p>Hi</p>',
        idempotencyKey: 'test-key',
      }
    )

    expect(result.ok).toBe(true)
    expect(result.id).toBe('email_123')
    expect(fetch).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer re_test',
          'User-Agent': expect.stringContaining('any3mi-api'),
          'Idempotency-Key': 'test-key',
        }),
      })
    )
  })

  it('returns error details on Resend failure', async () => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ message: 'Invalid from address' }), {
        status: 422,
      })
    )

    const result = await sendEmail(
      { RESEND_API_KEY: 're_test' },
      { to: 'user@example.com', subject: 'Hi', html: '<p>Hi</p>' }
    )

    expect(result.ok).toBe(false)
    expect(result.message).toContain('Invalid from address')
  })
})
