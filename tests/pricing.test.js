import { describe, expect, it } from 'vitest'
import {
  buildQuoteResponse,
  calculateQuote,
  defaultRates,
  getMockRoute,
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
        origin: 'East Legon',
        destination: 'Circle, Accra',
      },
      vehicle: 'Car',
      currency: 'GHS',
    })
    expect(response.price_ghs).toBeGreaterThan(0)
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
