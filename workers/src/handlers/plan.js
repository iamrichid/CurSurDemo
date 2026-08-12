import { authenticateRequest } from '../auth.js'
import { hasDatabase, rotateApiKey } from '../db.js'
import { sendKeyRotatedEmail } from '../email.js'
import { corsHeaders, errorResponse, json } from '../http.js'
import { getPlanStatus } from '../plans.js'

function dbRequired(request, env) {
  const headers = corsHeaders(request, env)
  if (!hasDatabase(env)) {
    return {
      ok: false,
      response: errorResponse(
        'SERVICE_UNAVAILABLE',
        'SERVICE_UNAVAILABLE',
        'Database not configured.',
        503,
        headers
      ),
    }
  }
  return { ok: true, headers }
}

async function requireAuth(request, env) {
  const headers = corsHeaders(request, env)
  const auth = await authenticateRequest(request, env)
  if (!auth.ok) {
    return {
      ok: false,
      response: errorResponse(auth.code, auth.code, auth.message, auth.status, headers),
    }
  }
  if (!auth.account) {
    return {
      ok: false,
      response: errorResponse(
        'UNAUTHORIZED',
        'UNAUTHORIZED',
        'Account required.',
        401,
        headers
      ),
    }
  }
  return { ok: true, headers, auth }
}

export async function handleGetPlan(request, env) {
  const dbCheck = dbRequired(request, env)
  if (!dbCheck.ok) return dbCheck.response

  const authResult = await requireAuth(request, env)
  if (!authResult.ok) return authResult.response

  const plan = await getPlanStatus(env.DB, authResult.auth.account.id)
  return json({ status: 'success', ...plan }, 200, authResult.headers)
}

export async function handleRotateKey(request, env) {
  const dbCheck = dbRequired(request, env)
  if (!dbCheck.ok) return dbCheck.response

  const authResult = await requireAuth(request, env)
  if (!authResult.ok) return authResult.response

  const rotated = await rotateApiKey(env.DB, authResult.auth.account.id)
  const account = authResult.auth.account

  let email_sent = false
  try {
    const emailResult = await sendKeyRotatedEmail(env, {
      email: account.email,
      orgName: account.org_name,
      keyPrefix: rotated.key_prefix,
      accountId: account.id,
      action: 'rotate',
    })
    email_sent = emailResult.ok
    if (!emailResult.ok && !emailResult.skipped) {
      console.error('Key rotate email failed:', emailResult.message)
    }
  } catch (err) {
    console.error('Key rotate email error:', err)
  }

  return json(
    {
      status: 'success',
      api_key: rotated.api_key,
      key_prefix: rotated.key_prefix,
      message: 'Previous API keys have been revoked.',
      email_sent,
    },
    200,
    authResult.headers
  )
}
