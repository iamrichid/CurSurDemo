/** OpenRouteService profile per ANY3MI vehicle type. */
const ORS_PROFILE = {
  bicycle: 'cycling-regular',
  motorbike: 'driving-car',
  car: 'driving-car',
}

export class RoutingError extends Error {
  constructor(message, status = 500) {
    super(message)
    this.name = 'RoutingError'
    this.status = status
    this.code = status === 429 ? 'RATE_LIMITED' : 'ROUTING_FAILED'
  }
}

/**
 * Fetch road distance (km) and duration (mins) from OpenRouteService.
 */
export async function fetchRouteMetrics(env, origin, destination, vehicle) {
  const apiKey = env.ORS_API_KEY
  if (!apiKey) {
    throw new RoutingError('Routing service not configured', 500)
  }

  const profile = ORS_PROFILE[vehicle]
  const url = `https://api.openrouteservice.org/v2/directions/${profile}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      coordinates: [
        [origin.lng, origin.lat],
        [destination.lng, destination.lat],
      ],
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new RoutingError(
      detail || `Routing provider returned ${response.status}`,
      response.status === 429 ? 429 : 500
    )
  }

  const data = await response.json()
  const summary = data?.routes?.[0]?.summary

  if (!summary) {
    throw new RoutingError('No route found between coordinates')
  }

  return {
    distanceKm: summary.distance / 1000,
    durationMins: summary.duration / 60,
  }
}
