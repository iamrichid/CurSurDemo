import { describe, it, expect } from 'vitest'
import {
  decodePolyline,
  geometryFromEncodedPolyline,
  geometryFromOrsGeoJson,
} from '../workers/src/routing.js'

describe('decodePolyline', () => {
  it('decodes a known encoded polyline', () => {
    const coords = decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@')
    expect(coords.length).toBeGreaterThan(1)
    expect(coords[0][0]).toBeCloseTo(-120.2, 1)
    expect(coords[0][1]).toBeCloseTo(38.5, 1)
  })
})

describe('geometryFromEncodedPolyline', () => {
  it('returns GeoJSON LineString', () => {
    const geometry = geometryFromEncodedPolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@')
    expect(geometry?.type).toBe('LineString')
    expect(geometry.coordinates.length).toBeGreaterThan(1)
  })
})

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

  it('flattens MultiLineString geometries', () => {
    const geometry = geometryFromOrsGeoJson({
      features: [
        {
          geometry: {
            type: 'MultiLineString',
            coordinates: [
              [
                [-0.154, 5.638],
                [-0.18, 5.61],
              ],
              [
                [-0.18, 5.61],
                [-0.214, 5.571],
              ],
            ],
          },
        },
      ],
    })
    expect(geometry?.coordinates).toHaveLength(4)
  })

  it('returns null for invalid payloads', () => {
    expect(geometryFromOrsGeoJson(null)).toBeNull()
    expect(geometryFromOrsGeoJson({ features: [] })).toBeNull()
  })
})
