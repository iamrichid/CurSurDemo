import { describe, it, expect } from 'vitest'
import { geometryFromOrsGeoJson } from '../workers/src/routing.js'

describe('geometryFromOrsGeoJson', () => {
  it('extracts LineString coordinates from ORS GeoJSON', () => {
    const geometry = geometryFromOrsGeoJson({
      features: [
        {
          geometry: {
            type: 'LineString',
            coordinates: [
              [-0.154, 5.638],
              [-0.18, 5.61],
              [-0.214, 5.571],
            ],
          },
          properties: { summary: { distance: 8400, duration: 1440 } },
        },
      ],
    })
    expect(geometry).toEqual({
      type: 'LineString',
      coordinates: [
        [-0.154, 5.638],
        [-0.18, 5.61],
        [-0.214, 5.571],
      ],
    })
  })

  it('returns null for invalid payloads', () => {
    expect(geometryFromOrsGeoJson(null)).toBeNull()
    expect(geometryFromOrsGeoJson({ features: [] })).toBeNull()
    expect(
      geometryFromOrsGeoJson({
        features: [{ geometry: { type: 'Point', coordinates: [0, 0] } }],
      })
    ).toBeNull()
  })
})
