# ANY3MI

The Routing & Pricing API for Ghanaian Logistics — a Vue 3 demo with landing page and developer dashboard.

## Stack

- Vue 3 (Composition API, `<script setup>`)
- Vue Router
- Tailwind CSS v4
- @vueuse/motion

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) for the landing page.  
Navigate to `/dashboard` for the developer portal.

## API integration

By default the playground uses a local mock. To wire the live Cloudflare Worker:

```bash
# 1. Deploy the worker (see workers/README.md)
cd workers && npm install && npx wrangler login
npx wrangler secret put ORS_API_KEY
npm run deploy

# 2. Point the frontend at it (.env.local in project root)
VITE_ANY3MI_API_URL=https://any3mi-api.<your-subdomain>.workers.dev
```

Get a free OpenRouteService key at [openrouteservice.org](https://openrouteservice.org/dev/#/signup).

## Tests

```bash
npm test
```

Smoke tests cover the pricing quote formula in `src/utils/pricing.js`.

## Theme Customization

CSS custom properties in `src/style.css` under `@theme` and `.dark-theme` control the palette. Swap accent colors once your brand theme is ready.

## Routes

| Path | View |
|------|------|
| `/` | Landing page |
| `/dashboard/overview` | Analytics |
| `/dashboard/billing` | MoMo wallet top-up |
| `/dashboard/pricing` | Pricing matrix config |
| `/dashboard/docs` | API documentation |
