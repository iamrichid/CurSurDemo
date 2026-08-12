import { geocodeAddress, GeocodingError } from './geocoding.js'
import { formatPlaceLabel, isInGhana, parseLocationInput } from './validate.js'

export { GeocodingError }

export async function resolveLocation(env, parsed, role) {
  if (parsed.kind === 'coordinates') {
    if (!isInGhana(parsed.lat, parsed.lng)) {
      throw new GeocodingError(
        `${role} coordinates are outside supported Ghana bounds.`,
        400,
        'INVALID_COORDINATES'
      )
    }
    return {
      lat: parsed.lat,
      lng: parsed.lng,
      label: parsed.label || formatPlaceLabel(parsed.lat, parsed.lng),
      address: parsed.address || null,
    }
  }

  if (parsed.kind === 'address') {
    return geocodeAddress(env, parsed.address)
  }

  throw new GeocodingError(`Invalid ${role} location.`, 400, 'INVALID_REQUEST')
}

export async function resolveQuoteLocations(env, { origin, destination }) {
  const [resolvedOrigin, resolvedDestination] = await Promise.all([
    resolveLocation(env, origin, 'origin'),
    resolveLocation(env, destination, 'destination'),
  ])

  return {
    origin: resolvedOrigin,
    destination: resolvedDestination,
  }
}

export function formatRoutePoint(point) {
  const payload = {
    label: point.label,
    lat: Math.round(point.lat * 1_000_000) / 1_000_000,
    lng: Math.round(point.lng * 1_000_000) / 1_000_000,
  }
  if (point.address) payload.address = point.address
  return payload
}
