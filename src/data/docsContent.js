export const apiEndpoints = [
  { method: 'POST', path: '/v1/quote', desc: 'Get a pricing quote for a route' },
  { method: 'GET', path: '/v1/health', desc: 'Check API status' },
  { method: 'GET', path: '/v1/rates', desc: 'Retrieve your pricing matrix' },
]

export const docsNav = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'authentication', label: 'Authentication' },
  { id: 'quickstart', label: 'Quick Start' },
  { id: 'quote', label: 'Quote API' },
  { id: 'locations', label: 'Pickup & Drop-off' },
  { id: 'response', label: 'Response Format' },
  { id: 'vehicles', label: 'Vehicle Types' },
  { id: 'errors', label: 'Error Codes' },
  { id: 'rate-limits', label: 'Rate Limits' },
]

export const curlExample = `curl -X POST https://api.any3mi.com/v1/quote \\
  -H "Authorization: Bearer a3_live_sk_abc123" \\
  -H "Content-Type: application/json" \\
  -d '{
    "origin": { "address": "East Legon, Accra" },
    "destination": { "address": "Kwame Nkrumah Circle, Accra" },
    "vehicle": "motorbike"
  }'`

export const jsonResponse = `{
  "status": "success",
  "route": {
    "origin": {
      "label": "East Legon, Accra, Ghana",
      "address": "East Legon, Accra",
      "lat": 5.638,
      "lng": -0.154
    },
    "destination": {
      "label": "Kwame Nkrumah Circle, Accra, Ghana",
      "address": "Kwame Nkrumah Circle, Accra",
      "lat": 5.571,
      "lng": -0.214
    },
    "geometry": {
      "type": "LineString",
      "coordinates": [[-0.154, 5.638], [-0.214, 5.571]]
    }
  },
  "vehicle": "Motorbike (Okada)",
  "distance_km": 8.4,
  "duration_mins": 24,
  "price_ghs": 29.12,
  "currency": "GHS"
}`

export const requestParams = [
  {
    name: 'origin',
    type: 'object | string',
    required: true,
    desc: 'Pickup: { address: "East Legon, Accra" } or { lat, lng } or a plain address string',
  },
  {
    name: 'destination',
    type: 'object | string',
    required: true,
    desc: 'Drop-off: same formats as origin. Addresses are geocoded to Ghana coordinates server-side.',
  },
  { name: 'vehicle', type: 'string', required: true, desc: 'One of: bicycle, motorbike, car' },
  {
    name: 'include_geometry',
    type: 'query',
    required: false,
    desc: 'Pass ?include_geometry=1 to add a GeoJSON LineString under route.geometry (ORS road path)',
  },
]

export const locationExamples = [
  {
    title: 'Address (recommended)',
    body: '{ "address": "Osu Oxford Street, Accra" }',
    note: 'ANY3MI geocodes and validates the point is in Ghana.',
  },
  {
    title: 'Plain string',
    body: '"Madina, Accra"',
    note: 'Shorthand — pass the address directly as origin or destination.',
  },
  {
    title: 'Coordinates',
    body: '{ "lat": 5.638, "lng": -0.154 }',
    note: 'Skip geocoding when you already have GPS from your map SDK.',
  },
]

export const vehicles = [
  { id: 'bicycle', label: 'Bicycle', desc: 'Best for short urban deliveries under 5 km.' },
  { id: 'motorbike', label: 'Motorbike (Okada)', desc: 'Most popular for intra-city courier routes.' },
  { id: 'car', label: 'Car', desc: 'Bulkier parcels and longer suburban routes.' },
]

export const errors = [
  { code: 402, name: 'INSUFFICIENT_BALANCE', desc: 'Wallet balance too low for another API call.' },
  { code: 400, name: 'INVALID_LOCATION', desc: 'Missing or malformed origin/destination.' },
  { code: 400, name: 'INVALID_COORDINATES', desc: 'Lat/lng out of supported Ghana bounds.' },
  { code: 422, name: 'GEOCODING_FAILED', desc: 'Address could not be resolved in Ghana.' },
  { code: 401, name: 'UNAUTHORIZED', desc: 'Missing or invalid API key.' },
  { code: 422, name: 'UNSUPPORTED_VEHICLE', desc: 'Vehicle type not recognized.' },
  { code: 429, name: 'RATE_LIMITED', desc: 'Exceeded plan rate limit. Retry after header delay.' },
  { code: 500, name: 'ROUTING_FAILED', desc: 'Temporary routing engine error. Safe to retry.' },
]

export function highlightJson(json) {
  return json
    .replace(/"([^"]+)":/g, '<span class="text-sky-400">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="text-emerald-400">"$1"</span>')
    .replace(/: (\d+\.?\d*)/g, ': <span class="text-amber-400">$1</span>')
}
