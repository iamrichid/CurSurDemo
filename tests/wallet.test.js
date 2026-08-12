import { describe, expect, it } from 'vitest'
import {
  normalizeGhanaPhone,
  validateTopUpRequest,
  WELCOME_CREDIT,
} from '../workers/src/wallet.js'

describe('normalizeGhanaPhone', () => {
  it('accepts 10-digit numbers with leading zero', () => {
    expect(normalizeGhanaPhone('0241234567')).toBe('0241234567')
  })

  it('accepts 9-digit numbers without leading zero', () => {
    expect(normalizeGhanaPhone('241234567')).toBe('0241234567')
  })

  it('rejects invalid lengths', () => {
    expect(normalizeGhanaPhone('12345')).toBeNull()
  })
})

describe('validateTopUpRequest', () => {
  it('accepts valid MTN top-up', () => {
    const result = validateTopUpRequest({
      provider: 'mtn',
      phone: '0241234567',
      amount: 20,
    })
    expect(result.ok).toBe(true)
    expect(result.value).toBe(20)
  })

  it('rejects mismatched provider prefix', () => {
    const result = validateTopUpRequest({
      provider: 'mtn',
      phone: '0201234567',
      amount: 20,
    })
    expect(result.ok).toBe(false)
  })
})

describe('WELCOME_CREDIT', () => {
  it('covers 100 API calls at GH₵ 0.10', () => {
    expect(WELCOME_CREDIT / 0.1).toBe(100)
  })
})
