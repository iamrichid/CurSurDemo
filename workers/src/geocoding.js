import { isInGhana } from './validate.js'

export class GeocodingError extends Error {
  constructor(message, status = 422, code = 'GEOCODING_FAILED') {
    super(message)
    this.name = 'GeocodingError'
    this.status = status
    this.code = code
  }
}

/** Accra centroid — bias geocoding toward Greater Accra. */
const FOCUS = { lat: 5.6037, lng: -0.187 }

/**
 * Resolve a Ghana place name or address to coordinates via OpenRouteService Pelias.
 */
export async function geocodeAddress(env, query) {
  const apiKey = env.ORS_API_KEY
  if (!apiKey) {
    throw new GeocodingError('Geocoding service not configured', 500)
  }

  const text = String(query).trim()
  const params = new URLSearchParams({
    text,
    size: '1',
    'boundary.country': 'GHA',
    'focus.point.lat': String(FOCUS.lat),
    'focus.point.lon': String(FOCUS.lng),
  })

  const response = await fetch(
    `https://api.openrouteservice.org/geocode/search?${params}`,
    {
      headers: {
        Authorization: apiKey,
        Accept: 'application/json',
      },
    }
  )

  if (!response.ok) {
    const detail = await response.text()
    throw new GeocodingError(
      detail || `Geocoding provider returned ${response.status}`,
      response.status === 429 ? 429 : 422
    )
  }

  const data = await response.json()
  const feature = data?.features?.[0]

  if (!feature?.geometry?.coordinates) {
    throw new GeocodingError(
      `Could not find a location in Ghana for "${text}". Try a more specific address.`,
      422
    )
  }

  const [lng, lat] = feature.geometry.coordinates
  if (!isInGhana(lat, lng)) {
    throw new GeocodingError(
      `Resolved location for "${text}" is outside supported Ghana bounds.`,
      422,
      'INVALID_COORDINATES'
    )
  }

  const props = feature.properties || {}
  const label = props.label || props.name || text

  return {
    lat,
    lng,
    label,
    address: text,
  }
}
