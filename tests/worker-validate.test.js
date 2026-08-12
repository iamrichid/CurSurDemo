import { describe, expect, it } from 'vitest'
import {
  formatPlaceLabel,
  isInGhana,
  parseLocationInput,
  validateQuoteRequest,
} from '../workers/src/validate.js'

describe('parseLocationInput', () => {
  it('accepts address strings', () => {
    expect(parseLocationInput('East Legon, Accra')).toEqual({
      kind: 'address',
      address: 'East Legon, Accra',
    })
  })

  it('accepts address objects', () => {
    expect(parseLocationInput({ address: 'Circle, Accra' })).toEqual({
      kind: 'address',
      address: 'Circle, Accra',
    })
  })

  it('accepts coordinates', () => {
    expect(parseLocationInput({ lat: 5.638, lng: -0.154 })).toEqual({
      kind: 'coordinates',
      lat: 5.638,
      lng: -0.154,
      label: undefined,
    })
  })
})

describe('validateQuoteRequest', () => {
  const validCoords = {
    origin: { lat: 5.638, lng: -0.154 },
    destination: { lat: 5.571, lng: -0.214 },
    vehicle: 'motorbike',
  }

  it('accepts coordinate-based requests', () => {
    expect(validateQuoteRequest(validCoords).ok).toBe(true)
  })

  it('accepts address-based requests', () => {
    const result = validateQuoteRequest({
      origin: { address: 'East Legon, Accra' },
      destination: 'Kwame Nkrumah Circle, Accra',
      vehicle: 'car',
    })
    expect(result.ok).toBe(true)
    expect(result.value.origin.kind).toBe('address')
    expect(result.value.destination.kind).toBe('address')
  })

  it('rejects unknown vehicles', () => {
    const result = validateQuoteRequest({ ...validCoords, vehicle: 'helicopter' })
    expect(result.ok).toBe(false)
    expect(result.code).toBe('UNSUPPORTED_VEHICLE')
  })

  it('rejects coordinates outside Ghana', () => {
    const result = validateQuoteRequest({
      ...validCoords,
      origin: { lat: 51.5, lng: -0.12 },
    })
    expect(result.ok).toBe(false)
    expect(result.code).toBe('INVALID_COORDINATES')
  })

  it('rejects empty addresses', () => {
    const result = validateQuoteRequest({
      origin: { address: '  ' },
      destination: { address: 'Circle, Accra' },
      vehicle: 'motorbike',
    })
    expect(result.ok).toBe(false)
    expect(result.code).toBe('INVALID_LOCATION')
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
