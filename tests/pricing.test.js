import { describe, expect, it } from 'vitest'
import {
  buildQuoteResponse,
  calculateQuote,
  defaultRates,
  getMockRoute,
  normalizeRates,
  buildMockRouteGeometry,
} from '../src/utils/pricing.js'

describe('calculateQuote', () => {
  it('returns motorbike quote for the Accra mock route', () => {
    const route = getMockRoute()
    const quote = calculateQuote(
      defaultRates,
      'motorbike',
      route.distanceKm,
      route.durationMins
    )

    expect(quote).toEqual({
      vehicle: 'Motorbike (Okada)',
      distance_km: 8.4,
      duration_mins: 24,
      price_ghs: 29.12,
      currency: 'GHS',
    })
  })

  it('returns null for unsupported vehicles', () => {
    expect(calculateQuote(defaultRates, 'helicopter', 5, 10)).toBeNull()
  })

  it('rounds price to two decimal places', () => {
    const quote = calculateQuote(defaultRates, 'bicycle', 3.33, 7.7)
    expect(quote.price_ghs).toBe(10.15)
  })
})

describe('buildQuoteResponse', () => {
  it('wraps quote fields in API response shape', () => {
    const route = getMockRoute()
    const response = buildQuoteResponse(defaultRates, 'car', route)

    expect(response).toMatchObject({
      status: 'success',
      route: {
        origin: {
          label: 'East Legon, Accra',
          lat: 5.638,
          lng: -0.154,
        },
        destination: {
          label: 'Circle, Accra',
          lat: 5.571,
          lng: -0.214,
        },
      },
      vehicle: 'Car',
      currency: 'GHS',
    })
    expect(response.price_ghs).toBeGreaterThan(0)
  })

  it('includes mock geometry when requested', () => {
    const route = getMockRoute()
    const response = buildQuoteResponse(defaultRates, 'motorbike', route, {
      includeGeometry: true,
    })
    expect(response.route.geometry?.type).toBe('LineString')
    expect(response.route.geometry.coordinates.length).toBeGreaterThan(2)
  })
})

describe('getMockRoute', () => {
  it('returns stable Accra coordinates', () => {
    const route = getMockRoute()
    expect(route.origin.lat).toBeCloseTo(5.638)
    expect(route.destination.lng).toBeCloseTo(-0.214)
    expect(route.distanceKm).toBe(8.4)
  })
})

describe('normalizeRates', () => {
  it('fills missing vehicles from defaults', () => {
    const normalized = normalizeRates({ motorbike: { baseFare: 10, perKm: 2, perMinute: 0.3 } })
    expect(normalized.bicycle.label).toBe('Bicycle')
    expect(normalized.motorbike.baseFare).toBe(10)
    expect(normalized.car.perKm).toBe(defaultRates.car.perKm)
  })

  it('returns defaults for empty input', () => {
    expect(normalizeRates(null)).toEqual(defaultRates)
    expect(normalizeRates({})).toEqual(defaultRates)
  })
})

describe('buildMockRouteGeometry', () => {
  it('interpolates coordinates between origin and destination', () => {
    const route = getMockRoute()
    const geometry = buildMockRouteGeometry(route.origin, route.destination, 2)
    expect(geometry.type).toBe('LineString')
    expect(geometry.coordinates[0]).toEqual([route.origin.lng, route.origin.lat])
    expect(geometry.coordinates.at(-1)).toEqual([route.destination.lng, route.destination.lat])
  })
})
