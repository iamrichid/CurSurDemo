import {
  calculateQuote,
  defaultRates,
} from '../../src/utils/pricing.js'
import {
  checkApiKey,
  corsHeaders,
  errorResponse,
  json,
} from './http.js'
import { fetchRouteMetrics, RoutingError } from './routing.js'
import { formatPlaceLabel, validateQuoteRequest } from './validate.js'

async function handleHealth(request, env) {
  const headers = corsHeaders(request, env)
  return json(
    {
      status: 'ok',
      service: 'any3mi-api',
      version: '1.0.0',
      routing: env.ORS_API_KEY ? 'openrouteservice' : 'unconfigured',
    },
    200,
    headers
  )
}

async function handleQuote(request, env) {
  const headers = corsHeaders(request, env)

  const auth = checkApiKey(request, env)
  if (!auth.ok) {
    return errorResponse(auth.code, auth.code, auth.message, auth.status, headers)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse(
      'INVALID_REQUEST',
      'INVALID_REQUEST',
      'Malformed JSON body.',
      400,
      headers
    )
  }

  const validation = validateQuoteRequest(body)
  if (!validation.ok) {
    return errorResponse(
      validation.code,
      validation.code,
      validation.message,
      validation.status,
      headers
    )
  }

  const { origin, destination, vehicle } = validation.value

  let metrics
  try {
    metrics = await fetchRouteMetrics(env, origin, destination, vehicle)
  } catch (err) {
    if (err instanceof RoutingError) {
      return errorResponse(
        err.code,
        err.code,
        err.message,
        err.status,
        headers
      )
    }
    throw err
  }

  const quote = calculateQuote(
    defaultRates,
    vehicle,
    metrics.distanceKm,
    metrics.durationMins
  )

  if (!quote) {
    return errorResponse(
      'UNSUPPORTED_VEHICLE',
      'UNSUPPORTED_VEHICLE',
      'Vehicle type not recognized.',
      422,
      headers
    )
  }

  return json(
    {
      status: 'success',
      route: {
        origin: formatPlaceLabel(origin.lat, origin.lng),
        destination: formatPlaceLabel(destination.lat, destination.lng),
      },
      ...quote,
    },
    200,
    headers
  )
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const headers = corsHeaders(request, env)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers })
    }

    try {
      if (request.method === 'GET' && url.pathname === '/v1/health') {
        return handleHealth(request, env)
      }

      if (request.method === 'POST' && url.pathname === '/v1/quote') {
        return handleQuote(request, env)
      }

      return errorResponse(
        'NOT_FOUND',
        'NOT_FOUND',
        `No route for ${request.method} ${url.pathname}`,
        404,
        headers
      )
    } catch (err) {
      console.error(err)
      return errorResponse(
        'ROUTING_FAILED',
        'ROUTING_FAILED',
        'Temporary routing engine error. Safe to retry.',
        500,
        headers
      )
    }
  },
}
