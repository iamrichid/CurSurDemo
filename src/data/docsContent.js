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
  { id: 'response', label: 'Response Format' },
  { id: 'vehicles', label: 'Vehicle Types' },
  { id: 'errors', label: 'Error Codes' },
  { id: 'rate-limits', label: 'Rate Limits' },
]

export const curlExample = `curl -X POST https://api.any3mi.com/v1/quote \\
  -H "Authorization: Bearer a3_live_sk_abc123" \\
  -H "Content-Type: application/json" \\
  -d '{
    "origin": { "lat": 5.638, "lng": -0.154 },
    "destination": { "lat": 5.571, "lng": -0.214 },
    "vehicle": "motorbike"
  }'`

export const jsonResponse = `{
  "status": "success",
  "route": {
    "origin": "East Legon",
    "destination": "Circle, Accra"
  },
  "vehicle": "Motorbike (Okada)",
  "distance_km": 8.4,
  "duration_mins": 24,
  "price_ghs": 29.12,
  "currency": "GHS"
}`

export const requestParams = [
  { name: 'origin.lat', type: 'float', required: true, desc: 'Origin latitude (WGS84). Accra range: ~5.55–5.65' },
  { name: 'origin.lng', type: 'float', required: true, desc: 'Origin longitude (WGS84). Accra range: ~-0.30–-0.10' },
  { name: 'destination.lat', type: 'float', required: true, desc: 'Destination latitude' },
  { name: 'destination.lng', type: 'float', required: true, desc: 'Destination longitude' },
  { name: 'vehicle', type: 'string', required: true, desc: 'One of: bicycle, motorbike, car' },
]

export const vehicles = [
  { id: 'bicycle', label: 'Bicycle', desc: 'Best for short urban deliveries under 5 km.' },
  { id: 'motorbike', label: 'Motorbike (Okada)', desc: 'Most popular for intra-city courier routes.' },
  { id: 'car', label: 'Car', desc: 'Bulkier parcels and longer suburban routes.' },
]

export const errors = [
  { code: 402, name: 'INSUFFICIENT_BALANCE', desc: 'Wallet balance too low for another API call.' },
  { code: 400, name: 'INVALID_COORDINATES', desc: 'Lat/lng out of supported Ghana bounds.' },
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
