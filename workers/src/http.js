export function corsHeaders(request, env) {
  const allowed = (env.ALLOWED_ORIGINS || '*').split(',').map((s) => s.trim())
  const origin = request.headers.get('Origin') || ''
  const allowOrigin =
    allowed.includes('*') || allowed.includes(origin) ? origin || '*' : allowed[0]

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...extraHeaders,
    },
  })
}

export function errorResponse(code, name, message, status, extraHeaders = {}) {
  return json(
    {
      status: 'error',
      error: { code: status, name, message },
    },
    status,
    extraHeaders
  )
}

export function checkApiKey(request, env) {
  const keysRaw = env.ANY3MI_API_KEYS
  if (!keysRaw || !keysRaw.trim()) return { ok: true }

  const auth = request.headers.get('Authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  const allowed = keysRaw.split(',').map((k) => k.trim()).filter(Boolean)

  if (!token || !allowed.includes(token)) {
    return {
      ok: false,
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Missing or invalid API key.',
    }
  }

  return { ok: true }
}
