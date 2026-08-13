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

/** Decode ORS/Google encoded polyline to GeoJSON [lng, lat] pairs. */
export function decodePolyline(encoded, precision = 1e5) {
  if (typeof encoded !== 'string' || !encoded.length) return []

  const coordinates = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let shift = 0
    let result = 0
    let byte

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1
    lat += deltaLat

    shift = 0
    result = 0

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1
    lng += deltaLng

    coordinates.push([lng / precision, lat / precision])
  }

  return coordinates
}

export function geometryFromOrsGeoJson(data) {
  const geometry = data?.features?.[0]?.geometry
  if (!geometry || !Array.isArray(geometry.coordinates)) return null

  if (geometry.type === 'LineString') {
    if (geometry.coordinates.length < 2) return null
    return { type: 'LineString', coordinates: geometry.coordinates }
  }

  if (geometry.type === 'MultiLineString') {
    const coordinates = geometry.coordinates.flat()
    if (coordinates.length < 2) return null
    return { type: 'LineString', coordinates }
  }

  return null
}

export function geometryFromEncodedPolyline(encoded) {
  const coordinates = decodePolyline(encoded)
  if (coordinates.length < 2) return null
  return { type: 'LineString', coordinates }
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
      geometry: includeGeometry,
      instructions: false,
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
  const route = data?.routes?.[0]
  const summary = route?.summary

  if (!summary) {
    throw new RoutingError('No route found between coordinates')
  }

  const result = {
    distanceKm: summary.distance / 1000,
    durationMins: summary.duration / 60,
  }

  if (includeGeometry) {
    let geometry =
      geometryFromEncodedPolyline(route?.geometry) ||
      geometryFromOrsGeoJson(data)

    if (!geometry) {
      throw new RoutingError('Route geometry unavailable from routing provider')
    }

    result.geometry = geometry
  }

  return result
}
