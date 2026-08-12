<script setup>
import { useTheme } from '../../composables/useTheme'

const { theme, toggleTheme } = useTheme()
</script>

<template>
  <button
    type="button"
    class="theme-toggle group relative flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold transition-all duration-300 hover:border-accent/40"
    :title="theme === 'game' ? 'Switch to SaaS theme' : 'Switch to Game theme'"
    @click="toggleTheme"
  >
    <span
      class="flex h-5 w-5 items-center justify-center rounded bg-surface-muted text-[9px] font-bold uppercase text-accent transition-transform duration-300 group-hover:scale-110"
    >
      {{ theme === 'game' ? 'Gm' : 'Sa' }}
    </span>
    <span class="text-text-muted group-hover:text-text">
      {{ theme === 'game' ? 'Game' : 'SaaS' }}
    </span>
  </button>
</template>
