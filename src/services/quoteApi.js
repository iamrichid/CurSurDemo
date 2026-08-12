import {
  buildQuoteResponse,
  defaultRates,
  getMockRoute,
} from '../utils/pricing.js'

export class QuoteApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'QuoteApiError'
    this.status = status
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
export async function fetchQuote({ origin, destination, vehicle }) {
  const baseUrl = getApiBaseUrl()

  if (baseUrl) {
    const apiKey = import.meta.env.VITE_ANY3MI_API_KEY
    const headers = { 'Content-Type': 'application/json' }
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`

    const response = await fetch(`${baseUrl}/v1/quote`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ origin, destination, vehicle }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new QuoteApiError(
        response.status,
        body || `Quote request failed (${response.status})`
      )
    }

    return response.json()
  }

  await new Promise((resolve) => setTimeout(resolve, 200))

  const route = getMockRoute()
  const payload = buildQuoteResponse(defaultRates, vehicle, route)
  if (!payload) {
    throw new QuoteApiError(422, 'Unsupported vehicle type')
  }

  return payload
}
