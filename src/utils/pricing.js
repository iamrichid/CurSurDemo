export const defaultRates = {
  bicycle: { baseFare: 5, perKm: 1.2, perMinute: 0.15, label: 'Bicycle' },
  motorbike: { baseFare: 8, perKm: 1.8, perMinute: 0.25, label: 'Motorbike (Okada)' },
  car: { baseFare: 15, perKm: 3.5, perMinute: 0.45, label: 'Car' },
}

export const vehicleTypes = ['bicycle', 'motorbike', 'car']

export function calculateQuote(rates, vehicle, distanceKm, durationMins) {
  const rate = rates[vehicle]
  if (!rate) return null

  const price =
    rate.baseFare + distanceKm * rate.perKm + durationMins * rate.perMinute

  return {
    vehicle: rate.label,
    distance_km: Math.round(distanceKm * 10) / 10,
    duration_mins: Math.round(durationMins),
    price_ghs: Math.round(price * 100) / 100,
    currency: 'GHS',
  }
}

export function getMockRoute() {
  return {
    origin: {
      name: 'East Legon, Accra',
      address: 'East Legon, Accra',
      lat: 5.638,
      lng: -0.154,
    },
    destination: {
      name: 'Circle, Accra',
      address: 'Circle, Accra',
      lat: 5.571,
      lng: -0.214,
    },
    distanceKm: 8.4,
    durationMins: 24,
  }
}

function routePointFromInput(input, fallback) {
  if (typeof input === 'string' && input.trim()) {
    return { ...fallback, address: input.trim(), name: input.trim() }
  }
  if (input?.address) {
    return {
      ...fallback,
      address: input.address,
      name: input.label || input.address,
      lat: input.lat ?? fallback.lat,
      lng: input.lng ?? fallback.lng,
    }
  }
  if (typeof input?.lat === 'number' && typeof input?.lng === 'number') {
    return {
      ...fallback,
      lat: input.lat,
      lng: input.lng,
      name: input.label || fallback.name,
    }
  }
  return fallback
}

export function buildQuoteResponse(rates, vehicle, route, { originInput, destinationInput } = {}) {
  const quote = calculateQuote(
    rates,
    vehicle,
    route.distanceKm,
    route.durationMins
  )
  if (!quote) return null

  const origin = routePointFromInput(originInput, route.origin)
  const destination = routePointFromInput(destinationInput, route.destination)

  return {
    status: 'success',
    route: {
      origin: {
        label: origin.name,
        lat: origin.lat,
        lng: origin.lng,
        ...(origin.address ? { address: origin.address } : {}),
      },
      destination: {
        label: destination.name,
        lat: destination.lat,
        lng: destination.lng,
        ...(destination.address ? { address: destination.address } : {}),
      },
    },
    ...quote,
  }
}
