# ANY3MI API — Cloudflare Worker

Live `POST /v1/quote` backed by [OpenRouteService](https://openrouteservice.org/) for road distance/duration, with GHS pricing from the shared `src/utils/pricing.js` module.

## Prerequisites

1. [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)
2. [OpenRouteService API key](https://openrouteservice.org/dev/#/signup) (free — ~2,000 routes/day)

## Local development

```bash
cd workers
npm install
cp .dev.vars.example .dev.vars
# Edit .dev.vars — add your ORS_API_KEY
npm run dev
```

Worker runs at `http://localhost:8787`.

Test a quote:

```bash
curl -X POST http://localhost:8787/v1/quote \
  -H "Content-Type: application/json" \
  -d '{
    "origin": { "lat": 5.638, "lng": -0.154 },
    "destination": { "lat": 5.571, "lng": -0.214 },
    "vehicle": "motorbike"
  }'
```

Health check:

```bash
curl http://localhost:8787/v1/health
```

## Deploy to Cloudflare

```bash
cd workers
npm install
npx wrangler login
npx wrangler secret put ORS_API_KEY
npm run db:migrate:remote   # Phase 2 — accounts, usage, rates
npm run deploy
```

## Phase 2 endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/v1/auth/register` | No | Create account + API key |
| `POST` | `/v1/auth/login` | No | Sign in (uses saved key on device) |
| `POST` | `/v1/auth/regenerate-key` | No | Issue a new API key |
| `GET` | `/v1/me` | Bearer | Account info |
| `GET` | `/v1/usage` | Bearer | 7-day usage stats |
| `GET` | `/v1/rates` | Bearer | Pricing matrix |
| `PUT` | `/v1/rates` | Bearer | Save pricing matrix |
| `POST` | `/v1/quote` | Bearer | Quote (logged per account) |

After deploy, open `/dashboard/login` on the frontend to register. Copy your API key, then set `VITE_ANY3MI_API_KEY` in Vercel so the public playground can authenticate.

Wrangler prints your worker URL, e.g. `https://any3mi-api.<account>.workers.dev`.

### Custom domain (optional)

In Cloudflare dashboard → Workers → your worker → Settings → Domains → add `api.any3mi.com`.

## Wire the Vue frontend

In the project root `.env.local`:

```bash
VITE_ANY3MI_API_URL=https://any3mi-api.<account>.workers.dev
# Only needed if ANY3MI_API_KEYS secret is set on the worker:
# VITE_ANY3MI_API_KEY=a3_test_sk_demo
```

Restart `npm run dev` and use the landing playground.

## Environment variables

| Variable | Where | Required | Description |
|----------|-------|----------|-------------|
| `ORS_API_KEY` | Secret | Yes | OpenRouteService API key |
| `ANY3MI_API_KEYS` | Secret | No | Comma-separated Bearer tokens; omit to allow unauthenticated quotes |
| `ALLOWED_ORIGINS` | `wrangler.toml` | No | CORS origins (comma-separated) |

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/v1/health` | Service status |
| `POST` | `/v1/quote` | Route + GHS price quote |

Request body matches the docs playground:

```json
{
  "origin": { "lat": 5.638, "lng": -0.154 },
  "destination": { "lat": 5.571, "lng": -0.214 },
  "vehicle": "motorbike"
}
```
