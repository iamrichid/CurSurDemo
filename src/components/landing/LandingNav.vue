<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ThemeToggle from '../shared/ThemeToggle.vue'

const route = useRoute()
const menuOpen = ref(false)

watch(
  () => route.path,
  () => {
    menuOpen.value = false
  }
)

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 border-b border-border/60 glass">
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
      <RouterLink to="/" class="group flex items-center gap-2.5" @click="closeMenu">
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
        <a href="/#playground" class="text-sm text-text-muted transition-colors hover:text-text">Playground</a>
        <a href="/#pricing" class="text-sm text-text-muted transition-colors hover:text-text">Pricing</a>
        <a href="/#scan" class="text-sm text-text-muted transition-colors hover:text-text">Scan QR</a>
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <RouterLink
          to="/dashboard/overview"
          class="hidden text-sm font-medium text-text-muted transition-colors hover:text-text sm:block"
        >
          Dashboard
        </RouterLink>
        <RouterLink
          to="/dashboard/login?intent=key"
          class="hidden ft-btn-primary group relative overflow-hidden px-4 py-2 text-sm sm:inline-flex"
        >
          <span class="relative z-10">Get API Key</span>
          <span
            class="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full"
          />
        </RouterLink>

        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:border-accent/40 hover:text-text md:hidden"
          :aria-expanded="menuOpen"
          aria-label="Open menu"
          @click="menuOpen = !menuOpen"
        >
          <svg v-if="!menuOpen" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </nav>

    <Transition name="mobile-nav">
      <div
        v-if="menuOpen"
        class="border-t border-border bg-surface-elevated/95 px-4 py-4 backdrop-blur-xl md:hidden"
      >
        <div class="flex flex-col gap-1">
          <RouterLink
            to="/docs"
            class="rounded-lg px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
            @click="closeMenu"
          >
            Docs
          </RouterLink>
          <a
            href="/#playground"
            class="rounded-lg px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
            @click="closeMenu"
          >
            Playground
          </a>
          <a
            href="/#pricing"
            class="rounded-lg px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
            @click="closeMenu"
          >
            Pricing
          </a>
          <a
            href="/#scan"
            class="rounded-lg px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
            @click="closeMenu"
          >
            Scan QR
          </a>
          <RouterLink
            to="/dashboard/overview"
            class="rounded-lg px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
            @click="closeMenu"
          >
            Dashboard
          </RouterLink>
          <RouterLink
            to="/dashboard/login?intent=key"
            class="ft-btn-primary mt-2 px-4 py-2.5 text-center text-sm"
            @click="closeMenu"
          >
            Get API Key
          </RouterLink>
        </div>
      </div>
    </Transition>
  </header>
</template>
