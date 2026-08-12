import {
  calculateQuote,
  defaultRates,
} from '../../src/utils/pricing.js'
import { authenticateRequest } from './auth.js'
import { getRates, hasDatabase, logQuote } from './db.js'
import { corsHeaders, errorResponse, json, rateLimitResponse } from './http.js'
import {
  checkRateLimit,
  COST_PER_CALL,
  getMonthlyQuoteCount,
  shouldChargeForQuote,
} from './plans.js'
import { fetchRouteMetrics, RoutingError } from './routing.js'
import { formatPlaceLabel, validateQuoteRequest } from './validate.js'
import { debitForApiCall } from './wallet.js'

async function handleHealth(request, env) {
  const headers = corsHeaders(request, env)
  return json(
    {
      status: 'ok',
      service: 'any3mi-api',
      version: '4.0.0',
      routing: env.ORS_API_KEY ? 'openrouteservice' : 'unconfigured',
      database: hasDatabase(env) ? 'connected' : 'unconfigured',
    },
    200,
    headers
  )
}

async function handleQuote(request, env) {
  const headers = corsHeaders(request, env)
  const started = Date.now()

  const auth = await authenticateRequest(request, env)
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

  if (auth.account && hasDatabase(env)) {
    const rateCheck = await checkRateLimit(env.DB, auth.account.id)
    if (!rateCheck.ok) {
      return rateLimitResponse(rateCheck.retryAfter, headers)
    }
  }

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

  const rates =
    auth.account && hasDatabase(env)
      ? await getRates(env.DB, auth.account.id)
      : defaultRates

  const quote = calculateQuote(
    rates,
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

  const latencyMs = Date.now() - started
  let billed = false

  if (auth.account && hasDatabase(env)) {
    const monthlyUsed = await getMonthlyQuoteCount(env.DB, auth.account.id)
    const charge = shouldChargeForQuote(monthlyUsed)

    if (charge) {
      const account = await env.DB.prepare(
        'SELECT wallet_balance FROM accounts WHERE id = ?'
      )
        .bind(auth.account.id)
        .first()

      if ((account?.wallet_balance || 0) < COST_PER_CALL) {
        return errorResponse(
          'INSUFFICIENT_BALANCE',
          'INSUFFICIENT_BALANCE',
          `Free tier exhausted (${monthlyUsed} calls this month). Top up your wallet to continue.`,
          402,
          headers
        )
      }

      const debit = await debitForApiCall(env.DB, auth.account.id, COST_PER_CALL)
      if (!debit.ok) {
        return errorResponse(
          'INSUFFICIENT_BALANCE',
          'INSUFFICIENT_BALANCE',
          'Wallet balance too low. Top up under Billing to continue.',
          402,
          headers
        )
      }
      billed = true
    }

    await logQuote(env.DB, {
      accountId: auth.account.id,
      apiKeyId: auth.apiKeyId,
      vehicle,
      origin,
      destination,
      distanceKm: quote.distance_km,
      durationMins: quote.duration_mins,
      priceGhs: quote.price_ghs,
      latencyMs,
    })
  }

  return json(
    {
      status: 'success',
      route: {
        origin: formatPlaceLabel(origin.lat, origin.lng),
        destination: formatPlaceLabel(destination.lat, destination.lng),
      },
      billing: billed
        ? { mode: 'payg', cost_ghs: COST_PER_CALL }
        : { mode: 'free_tier', cost_ghs: 0 },
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
      const { handleRegister, handleLogin, handleRegenerateKey, handleMe, handleUsage, handleGetRates, handlePutRates } =
        await import('./handlers/account.js')
      const { handleGetWallet, handleTopUp } = await import('./handlers/wallet.js')
      const { handleGetPlan, handleRotateKey } = await import('./handlers/plan.js')

      if (request.method === 'GET' && url.pathname === '/v1/health') {
        return handleHealth(request, env)
      }

      if (request.method === 'POST' && url.pathname === '/v1/auth/register') {
        return handleRegister(request, env)
      }

      if (request.method === 'POST' && url.pathname === '/v1/auth/login') {
        return handleLogin(request, env)
      }

      if (request.method === 'POST' && url.pathname === '/v1/auth/regenerate-key') {
        return handleRegenerateKey(request, env)
      }

      if (request.method === 'GET' && url.pathname === '/v1/me') {
        return handleMe(request, env)
      }

      if (request.method === 'GET' && url.pathname === '/v1/usage') {
        return handleUsage(request, env)
      }

      if (request.method === 'GET' && url.pathname === '/v1/rates') {
        return handleGetRates(request, env)
      }

      if (request.method === 'PUT' && url.pathname === '/v1/rates') {
        return handlePutRates(request, env)
      }

      if (request.method === 'GET' && url.pathname === '/v1/wallet') {
        return handleGetWallet(request, env)
      }

      if (request.method === 'POST' && url.pathname === '/v1/wallet/topup') {
        return handleTopUp(request, env)
      }

      if (request.method === 'GET' && url.pathname === '/v1/plan') {
        return handleGetPlan(request, env)
      }

      if (request.method === 'POST' && url.pathname === '/v1/keys/rotate') {
        return handleRotateKey(request, env)
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
        'Temporary server error. Safe to retry.',
        500,
        headers
      )
    }
  },
}
