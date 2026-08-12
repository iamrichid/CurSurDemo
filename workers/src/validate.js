/** Approximate Ghana bounding box (WGS84). */
const GHANA = {
  latMin: 4.5,
  latMax: 11.5,
  lngMin: -3.5,
  lngMax: 1.5,
}

const SUPPORTED_VEHICLES = new Set(['bicycle', 'motorbike', 'car'])

export function isInGhana(lat, lng) {
  return (
    lat >= GHANA.latMin &&
    lat <= GHANA.latMax &&
    lng >= GHANA.lngMin &&
    lng <= GHANA.lngMax
  )
}

export function validateQuoteRequest(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, status: 400, code: 'INVALID_REQUEST', message: 'JSON body required.' }
  }

  const { origin, destination, vehicle } = body

  if (!SUPPORTED_VEHICLES.has(vehicle)) {
    return {
      ok: false,
      status: 422,
      code: 'UNSUPPORTED_VEHICLE',
      message: 'Vehicle type not recognized.',
    }
  }

  for (const label of ['origin', 'destination']) {
    const point = body[label]
    if (
      !point ||
      typeof point.lat !== 'number' ||
      typeof point.lng !== 'number' ||
      Number.isNaN(point.lat) ||
      Number.isNaN(point.lng)
    ) {
      return {
        ok: false,
        status: 400,
        code: 'INVALID_COORDINATES',
        message: `${label} must include numeric lat and lng.`,
      }
    }

    if (!isInGhana(point.lat, point.lng)) {
      return {
        ok: false,
        status: 400,
        code: 'INVALID_COORDINATES',
        message: 'Lat/lng out of supported Ghana bounds.',
      }
    }
  }

  return {
    ok: true,
    value: { origin, destination, vehicle },
  }
}

export function formatPlaceLabel(lat, lng) {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(3)}°${latDir}, ${Math.abs(lng).toFixed(3)}°${lngDir}`
}
