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

export function geometryFromOrsGeoJson(data) {
  const geometry = data?.features?.[0]?.geometry
  if (geometry?.type !== 'LineString' || !Array.isArray(geometry.coordinates)) {
    return null
  }
  if (geometry.coordinates.length < 2) return null
  return {
    type: 'LineString',
    coordinates: geometry.coordinates,
  }
}

/**
 * Fetch road distance (km) and duration (mins) from OpenRouteService.
 * Optionally returns GeoJSON LineString geometry ([lng, lat] pairs).
 */
export async function fetchRouteMetrics(
  env,
  origin,
  destination,
  vehicle,
  { includeGeometry = false } = {}
) {
  const apiKey = env.ORS_API_KEY
  if (!apiKey) {
    throw new RoutingError('Routing service not configured', 500)
  }

  const profile = ORS_PROFILE[vehicle]
  const suffix = includeGeometry ? '/geojson' : ''
  const url = `https://api.openrouteservice.org/v2/directions/${profile}${suffix}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
      Accept: includeGeometry
        ? 'application/json, application/geo+json'
        : 'application/json',
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

  if (includeGeometry) {
    const geometry = geometryFromOrsGeoJson(data)
    const summary = data?.features?.[0]?.properties?.summary
    if (!summary || !geometry) {
      throw new RoutingError('No route found between coordinates')
    }
    return {
      distanceKm: summary.distance / 1000,
      durationMins: summary.duration / 60,
      geometry,
    }
  }

  const summary = data?.routes?.[0]?.summary

  if (!summary) {
    throw new RoutingError('No route found between coordinates')
  }

  return {
    distanceKm: summary.distance / 1000,
    durationMins: summary.duration / 60,
  }
}
