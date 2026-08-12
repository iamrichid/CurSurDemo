import {
  createAccountWithKey,
  getRates,
  getUsage,
  hasDatabase,
  loginAccount,
  regenerateApiKey,
  saveRates,
} from '../db.js'
import { authenticateRequest } from '../auth.js'
import { corsHeaders, errorResponse, json } from '../http.js'

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

export async function handleRegister(request, env) {
  const check = dbRequired(request, env)
  if (!check.ok) return check.response
  const headers = check.headers

  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse('INVALID_REQUEST', 'INVALID_REQUEST', 'Malformed JSON.', 400, headers)
  }

  const { org_name, email, password } = body || {}
  if (!org_name?.trim() || !email?.trim() || !password || password.length < 8) {
    return errorResponse(
      'INVALID_REQUEST',
      'INVALID_REQUEST',
      'org_name, email, and password (min 8 chars) are required.',
      400,
      headers
    )
  }

  try {
    const result = await createAccountWithKey(env.DB, {
      orgName: org_name,
      email,
      password,
    })
    return json({ status: 'success', ...result }, 201, headers)
  } catch (err) {
    if (String(err).includes('UNIQUE')) {
      return errorResponse(
        'EMAIL_EXISTS',
        'EMAIL_EXISTS',
        'An account with this email already exists.',
        409,
        headers
      )
    }
    throw err
  }
}

export async function handleLogin(request, env) {
  const check = dbRequired(request, env)
  if (!check.ok) return check.response
  const headers = check.headers

  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse('INVALID_REQUEST', 'INVALID_REQUEST', 'Malformed JSON.', 400, headers)
  }

  const result = await loginAccount(env.DB, body || {})
  if (!result) {
    return errorResponse(
      'UNAUTHORIZED',
      'UNAUTHORIZED',
      'Invalid email or password.',
      401,
      headers
    )
  }

  return json({ status: 'success', ...result }, 200, headers)
}

export async function handleRegenerateKey(request, env) {
  const check = dbRequired(request, env)
  if (!check.ok) return check.response
  const headers = check.headers

  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse('INVALID_REQUEST', 'INVALID_REQUEST', 'Malformed JSON.', 400, headers)
  }

  const result = await regenerateApiKey(env.DB, body || {})
  if (!result) {
    return errorResponse(
      'UNAUTHORIZED',
      'UNAUTHORIZED',
      'Invalid email or password.',
      401,
      headers
    )
  }

  return json({ status: 'success', ...result }, 200, headers)
}

export async function handleMe(request, env) {
  const headers = corsHeaders(request, env)
  const auth = await authenticateRequest(request, env)
  if (!auth.ok) {
    return errorResponse(auth.code, auth.code, auth.message, auth.status, headers)
  }

  if (!auth.account) {
    return json(
      {
        status: 'success',
        account: { org_name: 'Legacy key', email: null },
        key_prefix: auth.token ? `${auth.token.slice(0, 12)}••••••••${auth.token.slice(-4)}` : null,
        legacy: true,
      },
      200,
      headers
    )
  }

  const keyPrefix = auth.token
    ? `${auth.token.slice(0, 12)}••••••••${auth.token.slice(-4)}`
    : null

  return json(
    {
      status: 'success',
      account: {
        org_name: auth.account.org_name,
        email: auth.account.email,
        wallet_balance: auth.account.wallet_balance,
      },
      key_prefix: keyPrefix,
    },
    200,
    headers
  )
}

export async function handleUsage(request, env) {
  const headers = corsHeaders(request, env)
  const auth = await authenticateRequest(request, env)
  if (!auth.ok) {
    return errorResponse(auth.code, auth.code, auth.message, auth.status, headers)
  }

  if (!auth.account) {
    return json(
      {
        status: 'success',
        total_calls: 0,
        total_spend: 0,
        avg_latency_ms: 0,
        success_rate: 100,
        chart: [],
        vehicle_breakdown: [],
        cost_per_call: 0.1,
        legacy: true,
      },
      200,
      headers
    )
  }

  const usage = await getUsage(env.DB, auth.account.id)
  return json({ status: 'success', ...usage }, 200, headers)
}

export async function handleGetRates(request, env) {
  const headers = corsHeaders(request, env)
  const auth = await authenticateRequest(request, env)
  if (!auth.ok) {
    return errorResponse(auth.code, auth.code, auth.message, auth.status, headers)
  }

  if (!auth.account) {
    const { defaultRates } = await import('../../../src/utils/pricing.js')
    return json({ status: 'success', rates: defaultRates, legacy: true }, 200, headers)
  }

  const rates = await getRates(env.DB, auth.account.id)
  return json({ status: 'success', rates }, 200, headers)
}

export async function handlePutRates(request, env) {
  const headers = corsHeaders(request, env)
  const auth = await authenticateRequest(request, env)
  if (!auth.ok) {
    return errorResponse(auth.code, auth.code, auth.message, auth.status, headers)
  }

  if (!auth.account) {
    return errorResponse(
      'UNAUTHORIZED',
      'UNAUTHORIZED',
      'Account required to save rates.',
      401,
      headers
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse('INVALID_REQUEST', 'INVALID_REQUEST', 'Malformed JSON.', 400, headers)
  }

  if (!body?.rates || typeof body.rates !== 'object') {
    return errorResponse(
      'INVALID_REQUEST',
      'INVALID_REQUEST',
      'rates object is required.',
      400,
      headers
    )
  }

  await saveRates(env.DB, auth.account.id, body.rates)
  return json({ status: 'success', rates: body.rates }, 200, headers)
}
