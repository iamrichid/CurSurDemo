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
