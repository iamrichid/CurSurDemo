import { getStoredApiKey } from '../composables/useAuth.js'

export class DashboardApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'DashboardApiError'
    this.status = status
  }
}

function getBaseUrl() {
  const base = import.meta.env.VITE_ANY3MI_API_URL
  if (!base?.trim()) {
    throw new DashboardApiError(0, 'VITE_ANY3MI_API_URL is not configured.')
  }
  return base.trim().replace(/\/$/, '')
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const key = getStoredApiKey()
    if (key) headers.Authorization = `Bearer ${key}`
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new DashboardApiError(
      response.status,
      data?.error?.message || `Request failed (${response.status})`
    )
  }
  return data
}

export async function registerAccount({ org_name, email, password }) {
  return request('/v1/auth/register', {
    method: 'POST',
    body: { org_name, email, password },
    auth: false,
  })
}

export async function loginAccount({ email, password }) {
  return request('/v1/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })
}

export async function regenerateApiKey({ email, password }) {
  return request('/v1/auth/regenerate-key', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })
}

export async function fetchMe() {
  return request('/v1/me')
}

export async function fetchUsage() {
  return request('/v1/usage')
}

export async function fetchRates() {
  return request('/v1/rates')
}

export async function saveRates(rates) {
  return request('/v1/rates', { method: 'PUT', body: { rates } })
}

export async function fetchWallet() {
  return request('/v1/wallet')
}

export async function topUpWallet({ provider, phone, amount }) {
  return request('/v1/wallet/topup', {
    method: 'POST',
    body: { provider, phone, amount },
  })
}

export async function fetchPlan() {
  return request('/v1/plan')
}

export async function rotateApiKey() {
  return request('/v1/keys/rotate', { method: 'POST' })
}
