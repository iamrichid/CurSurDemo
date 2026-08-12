import { describe, expect, it } from 'vitest'
import {
  FREE_TIER_MONTHLY,
  shouldChargeForQuote,
  monthStartMs,
} from '../workers/src/plans.js'

describe('shouldChargeForQuote', () => {
  it('does not charge within free tier', () => {
    expect(shouldChargeForQuote(0)).toBe(false)
    expect(shouldChargeForQuote(499)).toBe(false)
  })

  it('charges from the 501st call onward', () => {
    expect(shouldChargeForQuote(500)).toBe(true)
    expect(shouldChargeForQuote(501)).toBe(true)
  })
})

describe('monthStartMs', () => {
  it('returns first day of month', () => {
    const start = monthStartMs(new Date('2026-08-15T12:00:00Z'))
    const d = new Date(start)
    expect(d.getDate()).toBe(1)
    expect(d.getMonth()).toBe(7)
  })
})

describe('FREE_TIER_MONTHLY', () => {
  it('matches docs free tier', () => {
    expect(FREE_TIER_MONTHLY).toBe(500)
  })
})
