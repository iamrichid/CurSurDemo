<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { brand } from '../../data/brand.js'

const route = useRoute()

const navItems = [
  { to: '/dashboard/overview', label: 'Overview', icon: 'chart' },
  { to: '/dashboard/billing', label: 'Billing', icon: 'wallet' },
  { to: '/dashboard/keys', label: 'API Keys', icon: 'key' },
  { to: '/dashboard/pricing', label: 'Pricing Matrix', icon: 'sliders' },
  { to: '/dashboard/docs', label: 'API Docs', icon: 'code' },
]
</script>

<template>
  <aside class="flex w-64 shrink-0 flex-col border-r border-border bg-surface-elevated">
    <div class="flex items-center gap-2.5 border-b border-border px-5 py-5">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-xs font-bold text-accent-foreground shadow-sm shadow-accent/20">
        A3
      </div>
      <div>
        <p class="text-sm font-semibold text-text">ANY<span class="text-accent">3</span>MI</p>
        <p class="text-[10px] text-text-subtle">{{ brand.org }} · {{ brand.dept }}</p>
      </div>
    </div>

    <nav class="flex-1 space-y-0.5 p-3">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
        :class="
          route.path === item.to
            ? 'bg-accent-muted text-accent'
            : 'text-text-muted hover:bg-surface-muted hover:text-text'
        "
      >
        <span
          v-if="route.path === item.to"
          class="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent"
        />
        <svg v-if="item.icon === 'chart'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        <svg v-else-if="item.icon === 'wallet'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
        <svg v-else-if="item.icon === 'key'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
        <svg v-else-if="item.icon === 'sliders'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
        <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="border-t border-border p-4">
      <RouterLink
        to="/"
        class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-text-subtle transition-colors hover:bg-surface-muted hover:text-text"
      >
        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to site
      </RouterLink>
    </div>
  </aside>
</template>
