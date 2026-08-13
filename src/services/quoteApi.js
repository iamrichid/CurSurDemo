import {
  buildQuoteResponse,
  defaultRates,
  getMockRoute,
} from '../utils/pricing.js'

export class QuoteApiError extends Error {
  constructor(status, message, code) {
    super(message)
    this.name = 'QuoteApiError'
    this.status = status
    this.code = code
  }
}

function getApiBaseUrl() {
  const base = import.meta.env.VITE_ANY3MI_API_URL
  return typeof base === 'string' && base.trim() ? base.trim().replace(/\/$/, '') : ''
}

export function isLiveApiEnabled() {
  return Boolean(getApiBaseUrl())
}

/**
 * POST /v1/quote — uses VITE_ANY3MI_API_URL when set, otherwise local mock.
 */
export async function fetchQuote(
  { origin, destination, vehicle },
  { includeGeometry = false } = {}
) {
  const baseUrl = getApiBaseUrl()

  if (baseUrl) {
    const apiKey =
      import.meta.env.VITE_ANY3MI_API_KEY ||
      (typeof localStorage !== 'undefined'
        ? localStorage.getItem('any3mi-api-key')
        : '')
    const headers = { 'Content-Type': 'application/json' }
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`

    const query = includeGeometry ? '?include_geometry=1' : ''
    const response = await fetch(`${baseUrl}/v1/quote${query}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ origin, destination, vehicle }),
    })

    if (!response.ok) {
      const body = await response.text()
      let code = 'QUOTE_FAILED'
      let message = body || `Quote request failed (${response.status})`
      try {
        const parsed = JSON.parse(body)
        code = parsed?.error?.name || code
        message = parsed?.error?.message || message
      } catch {
        // keep defaults
      }
      throw new QuoteApiError(response.status, message, code)
    }

    return response.json()
  }

  await new Promise((resolve) => setTimeout(resolve, 200))

  const route = getMockRoute()
  const payload = buildQuoteResponse(defaultRates, vehicle, route, {
    originInput: origin,
    destinationInput: destination,
    includeGeometry,
  })
  if (!payload) {
    throw new QuoteApiError(422, 'Unsupported vehicle type')
  }

  return payload
}
