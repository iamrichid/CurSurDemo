import { describe, expect, it } from 'vitest'
import {
  formatPlaceLabel,
  isInGhana,
  validateQuoteRequest,
} from '../workers/src/validate.js'

describe('validateQuoteRequest', () => {
  const validBody = {
    origin: { lat: 5.638, lng: -0.154 },
    destination: { lat: 5.571, lng: -0.214 },
    vehicle: 'motorbike',
  }

  it('accepts a valid Accra quote request', () => {
    expect(validateQuoteRequest(validBody).ok).toBe(true)
  })

  it('rejects unknown vehicles', () => {
    const result = validateQuoteRequest({ ...validBody, vehicle: 'helicopter' })
    expect(result.ok).toBe(false)
    expect(result.code).toBe('UNSUPPORTED_VEHICLE')
  })

  it('rejects coordinates outside Ghana', () => {
    const result = validateQuoteRequest({
      ...validBody,
      origin: { lat: 51.5, lng: -0.12 },
    })
    expect(result.ok).toBe(false)
    expect(result.code).toBe('INVALID_COORDINATES')
  })
})

describe('isInGhana', () => {
  it('includes Accra', () => {
    expect(isInGhana(5.638, -0.154)).toBe(true)
  })
})

describe('formatPlaceLabel', () => {
  it('formats coordinates readably', () => {
    expect(formatPlaceLabel(5.638, -0.154)).toBe('5.638°N, 0.154°W')
  })
})
