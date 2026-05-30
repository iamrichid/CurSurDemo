<script setup>
import { RouterLink } from 'vue-router'
import ThemeToggle from '../shared/ThemeToggle.vue'
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 border-b border-border/60 glass">
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
      <RouterLink to="/" class="group flex items-center gap-2.5">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground shadow-md shadow-accent/20 transition-transform duration-300 group-hover:scale-105"
        >
          A3
        </div>
        <span class="text-sm font-semibold tracking-tight text-text">
          ANY<span class="text-accent">3</span>MI
        </span>
      </RouterLink>

      <div class="hidden items-center gap-8 md:flex">
        <RouterLink to="/docs" class="text-sm text-text-muted transition-colors hover:text-text">Docs</RouterLink>
        <a href="#playground" class="text-sm text-text-muted transition-colors hover:text-text">Playground</a>
        <a href="#pricing" class="text-sm text-text-muted transition-colors hover:text-text">Pricing</a>
      </div>

      <div class="flex items-center gap-3">
        <ThemeToggle />
        <RouterLink
          to="/dashboard"
          class="hidden text-sm font-medium text-text-muted transition-colors hover:text-text sm:block"
        >
          Dashboard
        </RouterLink>
        <RouterLink
          to="/dashboard"
          class="ft-btn-primary group relative overflow-hidden px-4 py-2 text-sm"
        >
          <span class="relative z-10">Get API Key</span>
          <span
            class="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full"
          />
        </RouterLink>
      </div>
    </nav>
  </header>
</template>
