import { authenticateRequest } from '../auth.js'
import { hasDatabase } from '../db.js'
import { corsHeaders, errorResponse, json } from '../http.js'
import { getWallet, processTopUp } from '../wallet.js'

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
        'Account required for wallet access.',
        401,
        headers
      ),
    }
  }
  return { ok: true, headers, auth }
}

export async function handleGetWallet(request, env) {
  const dbCheck = dbRequired(request, env)
  if (!dbCheck.ok) return dbCheck.response

  const authResult = await requireAuth(request, env)
  if (!authResult.ok) return authResult.response

  const wallet = await getWallet(env.DB, authResult.auth.account.id)
  return json({ status: 'success', ...wallet }, 200, authResult.headers)
}

export async function handleTopUp(request, env) {
  const dbCheck = dbRequired(request, env)
  if (!dbCheck.ok) return dbCheck.response

  const authResult = await requireAuth(request, env)
  if (!authResult.ok) return authResult.response

  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse(
      'INVALID_REQUEST',
      'INVALID_REQUEST',
      'Malformed JSON.',
      400,
      authResult.headers
    )
  }

  const result = await processTopUp(env.DB, authResult.auth.account.id, body || {})
  if (!result.ok) {
    return errorResponse(
      'INVALID_REQUEST',
      'INVALID_REQUEST',
      result.message,
      400,
      authResult.headers
    )
  }

  return json(
    {
      status: 'success',
      balance: result.balance,
      amount: result.amount,
      provider: result.provider,
      phone: result.phone,
      reference: result.reference,
      transaction_id: result.transaction_id,
      mode: result.mode,
    },
    200,
    authResult.headers
  )
}
