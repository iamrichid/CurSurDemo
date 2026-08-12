import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { geocodeAddress, GeocodingError } from '../workers/src/geocoding.js'

describe('geocodeAddress', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('throws when ORS key is missing', async () => {
    await expect(geocodeAddress({}, 'East Legon')).rejects.toBeInstanceOf(GeocodingError)
  })

  it('returns coordinates and label for a Ghana address', async () => {
    fetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          features: [
            {
              geometry: { coordinates: [-0.154, 5.638] },
              properties: { label: 'East Legon, Accra, Ghana' },
            },
          ],
        }),
        { status: 200 }
      )
    )

    const result = await geocodeAddress({ ORS_API_KEY: 'test-key' }, 'East Legon, Accra')
    expect(result.lat).toBe(5.638)
    expect(result.lng).toBe(-0.154)
    expect(result.label).toContain('East Legon')
    expect(result.address).toBe('East Legon, Accra')
  })

  it('throws when no features are returned', async () => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ features: [] }), { status: 200 })
    )

    await expect(
      geocodeAddress({ ORS_API_KEY: 'test-key' }, 'nowhere')
    ).rejects.toMatchObject({ code: 'GEOCODING_FAILED' })
  })
})
