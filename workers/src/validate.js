/** Approximate Ghana bounding box (WGS84). */
const GHANA = {
  latMin: 4.5,
  latMax: 11.5,
  lngMin: -3.5,
  lngMax: 1.5,
}

const SUPPORTED_VEHICLES = new Set(['bicycle', 'motorbike', 'car'])
const MIN_ADDRESS_LENGTH = 3

export function isInGhana(lat, lng) {
  return (
    lat >= GHANA.latMin &&
    lat <= GHANA.latMax &&
    lng >= GHANA.lngMin &&
    lng <= GHANA.lngMax
  )
}

/**
 * Parse origin/destination from coordinates, { address }, or plain string.
 */
export function parseLocationInput(input) {
  if (typeof input === 'string') {
    const address = input.trim()
    if (address.length < MIN_ADDRESS_LENGTH) return { kind: 'invalid' }
    return { kind: 'address', address }
  }

  if (!input || typeof input !== 'object') {
    return { kind: 'invalid' }
  }

  const address =
    typeof input.address === 'string' ? input.address.trim() : ''
  const hasCoords =
    typeof input.lat === 'number' &&
    typeof input.lng === 'number' &&
    !Number.isNaN(input.lat) &&
    !Number.isNaN(input.lng)

  if (address && hasCoords) {
    return {
      kind: 'coordinates',
      lat: input.lat,
      lng: input.lng,
      label: typeof input.label === 'string' ? input.label.trim() : undefined,
      address,
    }
  }

  if (address) {
    if (address.length < MIN_ADDRESS_LENGTH) return { kind: 'invalid' }
    return { kind: 'address', address }
  }

  if (hasCoords) {
    return {
      kind: 'coordinates',
      lat: input.lat,
      lng: input.lng,
      label: typeof input.label === 'string' ? input.label.trim() : undefined,
    }
  }

  return { kind: 'invalid' }
}

export function validateQuoteRequest(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, status: 400, code: 'INVALID_REQUEST', message: 'JSON body required.' }
  }

  const { vehicle } = body

  if (!SUPPORTED_VEHICLES.has(vehicle)) {
    return {
      ok: false,
      status: 422,
      code: 'UNSUPPORTED_VEHICLE',
      message: 'Vehicle type not recognized.',
    }
  }

  const origin = parseLocationInput(body.origin)
  const destination = parseLocationInput(body.destination)

  if (origin.kind === 'invalid') {
    return {
      ok: false,
      status: 400,
      code: 'INVALID_LOCATION',
      message:
        'origin must include { lat, lng } coordinates or an address string (min 3 characters).',
    }
  }

  if (destination.kind === 'invalid') {
    return {
      ok: false,
      status: 400,
      code: 'INVALID_LOCATION',
      message:
        'destination must include { lat, lng } coordinates or an address string (min 3 characters).',
    }
  }

  if (origin.kind === 'coordinates' && !isInGhana(origin.lat, origin.lng)) {
    return {
      ok: false,
      status: 400,
      code: 'INVALID_COORDINATES',
      message: 'origin coordinates are outside supported Ghana bounds.',
    }
  }

  if (destination.kind === 'coordinates' && !isInGhana(destination.lat, destination.lng)) {
    return {
      ok: false,
      status: 400,
      code: 'INVALID_COORDINATES',
      message: 'destination coordinates are outside supported Ghana bounds.',
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
