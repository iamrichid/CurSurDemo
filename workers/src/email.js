const RESEND_API = 'https://api.resend.com/emails'
const USER_AGENT = 'any3mi-api/4.1.0'

export function isEmailConfigured(env) {
  return Boolean(env.RESEND_API_KEY?.trim())
}

export function getEmailFrom(env) {
  return env.EMAIL_FROM?.trim() || 'ANY3MI <onboarding@resend.dev>'
}

export function getAppUrl(env) {
  const url = env.APP_URL?.trim() || 'https://cur-sur-demo.vercel.app'
  return url.replace(/\/$/, '')
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function layout({ title, bodyHtml, appUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#fafafa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#09090b;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#111114;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 8px;">
              <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#d4ff00;">ANY3MI</p>
              <h1 style="margin:12px 0 0;font-size:22px;line-height:1.3;color:#fafafa;">${escapeHtml(title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px;font-size:15px;line-height:1.6;color:#a1a1aa;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;">
              <a href="${escapeHtml(appUrl)}/dashboard/overview" style="display:inline-block;background:#d4ff00;color:#0a0a0c;text-decoration:none;font-weight:600;font-size:14px;padding:12px 18px;border-radius:10px;">Open dashboard</a>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;border-top:1px solid rgba(255,255,255,0.07);font-size:12px;line-height:1.5;color:#71717a;">
              Usammi TECH DEPT · Ghana routing &amp; pricing API<br />
              <a href="${escapeHtml(appUrl)}" style="color:#d4ff00;text-decoration:none;">${escapeHtml(appUrl.replace(/^https?:\/\//, ''))}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function buildWelcomeEmail({ orgName, appUrl }) {
  const title = `Welcome to ANY3MI, ${orgName}`
  const bodyHtml = `
    <p style="margin:0 0 16px;">Your developer account is ready. We've added <strong style="color:#fafafa;">GH₵ 10.00</strong> welcome credit to your wallet.</p>
    <p style="margin:0 0 16px;">Copy your API key from the portal — it is only shown once at signup or after rotation. Use it as <code style="background:#141418;padding:2px 6px;border-radius:4px;color:#d4ff00;">Authorization: Bearer …</code> on <code style="background:#141418;padding:2px 6px;border-radius:4px;color:#d4ff00;">POST /v1/quote</code>.</p>
    <p style="margin:0;">You get <strong style="color:#fafafa;">500 free quote calls per month</strong>, then pay-as-you-go at GH₵ 0.10 per call.</p>
  `
  return {
    subject: 'Welcome to ANY3MI — your API key is ready',
    html: layout({ title, bodyHtml, appUrl }),
  }
}

export function buildKeyRotatedEmail({ orgName, keyPrefix, appUrl }) {
  const title = 'Your ANY3MI API key was rotated'
  const bodyHtml = `
    <p style="margin:0 0 16px;">A new API key was issued for <strong style="color:#fafafa;">${escapeHtml(orgName)}</strong>.</p>
    <p style="margin:0 0 16px;">Active key prefix: <code style="background:#141418;padding:2px 6px;border-radius:4px;color:#d4ff00;">${escapeHtml(keyPrefix || 'a3_live_••••')}</code></p>
    <p style="margin:0 0 16px;">Previous keys are revoked. Update any servers or scripts still using the old secret.</p>
    <p style="margin:0;color:#f87171;">If you didn't request this, rotate again immediately and review your account activity.</p>
  `
  return {
    subject: 'ANY3MI API key rotated',
    html: layout({ title, bodyHtml, appUrl }),
  }
}

export function buildWalletTopUpEmail({ orgName, amountGhs, balanceGhs, appUrl }) {
  const title = `Wallet topped up — GH₵ ${amountGhs.toFixed(2)}`
  const bodyHtml = `
    <p style="margin:0 0 16px;"><strong style="color:#fafafa;">${escapeHtml(orgName)}</strong> — your ANY3MI wallet was credited.</p>
    <p style="margin:0 0 8px;">Amount added: <strong style="color:#4ade80;">GH₵ ${amountGhs.toFixed(2)}</strong></p>
    <p style="margin:0;">New balance: <strong style="color:#fafafa;">GH₵ ${balanceGhs.toFixed(2)}</strong></p>
  `
  return {
    subject: `ANY3MI wallet top-up — GH₵ ${amountGhs.toFixed(2)}`,
    html: layout({ title, bodyHtml, appUrl }),
  }
}

export async function sendEmail(env, { to, subject, html, idempotencyKey }) {
  if (!isEmailConfigured(env)) {
    return { ok: false, skipped: true, reason: 'RESEND_API_KEY not configured' }
  }

  const from = getEmailFrom(env)
  const headers = {
    Authorization: `Bearer ${env.RESEND_API_KEY.trim()}`,
    'Content-Type': 'application/json',
    'User-Agent': USER_AGENT,
  }
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey.slice(0, 256)
  }

  const response = await fetch(RESEND_API, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  })

  const body = await response.text()
  if (!response.ok) {
    let message = body || `Resend error (${response.status})`
    try {
      const parsed = JSON.parse(body)
      message = parsed?.message || parsed?.error?.message || message
    } catch {
      // keep raw body
    }
    return { ok: false, skipped: false, status: response.status, message }
  }

  let id = null
  try {
    id = JSON.parse(body)?.id ?? null
  } catch {
    // optional id
  }

  return { ok: true, id }
}

export async function sendWelcomeEmail(env, { email, orgName, accountId }) {
  const appUrl = getAppUrl(env)
  const { subject, html } = buildWelcomeEmail({ orgName, appUrl })
  return sendEmail(env, {
    to: email,
    subject,
    html,
    idempotencyKey: `welcome-${accountId}`,
  })
}

export async function sendKeyRotatedEmail(env, { email, orgName, keyPrefix, accountId, action }) {
  const appUrl = getAppUrl(env)
  const { subject, html } = buildKeyRotatedEmail({ orgName, keyPrefix, appUrl })
  return sendEmail(env, {
    to: email,
    subject,
    html,
    idempotencyKey: `key-${action}-${accountId}-${Date.now()}`,
  })
}

export async function sendWalletTopUpEmail(env, { email, orgName, amountGhs, balanceGhs, accountId, txId }) {
  const appUrl = getAppUrl(env)
  const { subject, html } = buildWalletTopUpEmail({ orgName, amountGhs, balanceGhs, appUrl })
  return sendEmail(env, {
    to: email,
    subject,
    html,
    idempotencyKey: txId ? `topup-${txId}` : `topup-${accountId}-${amountGhs}`,
  })
}
