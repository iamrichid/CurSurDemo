import { hashApiKey } from './crypto.js'
import { findApiKeyByHash, hasDatabase } from './db.js'

export function extractBearerToken(request) {
  const auth = request.headers.get('Authorization') || ''
  return auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
}

export async function authenticateRequest(request, env) {
  const token = extractBearerToken(request)

  if (!token) {
    return {
      ok: false,
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Missing or invalid API key.',
    }
  }

  if (hasDatabase(env)) {
    const keyHash = await hashApiKey(token)
    const row = await findApiKeyByHash(env.DB, keyHash)
    if (row) {
      return {
        ok: true,
        token,
        account: {
          id: row.account_id,
          org_name: row.org_name,
          email: row.email,
          wallet_balance: row.wallet_balance,
        },
        apiKeyId: row.id,
      }
    }
  }

  const legacyKeys = (env.ANY3MI_API_KEYS || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)

  if (legacyKeys.includes(token)) {
    return {
      ok: true,
      token,
      account: null,
      apiKeyId: null,
      legacy: true,
    }
  }

  if (!hasDatabase(env) && legacyKeys.length === 0) {
    return { ok: true, token: null, account: null, apiKeyId: null, legacy: true }
  }

  return {
    ok: false,
    status: 401,
    code: 'UNAUTHORIZED',
    message: 'Missing or invalid API key.',
  }
}
