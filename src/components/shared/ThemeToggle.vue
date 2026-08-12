<script setup>
import { useTheme } from '../../composables/useTheme'
import { useToast } from '../../composables/useToast.js'

const { theme, cycleTheme, themeLabel } = useTheme()
const toast = useToast()

function handleToggle() {
  cycleTheme()
  toast.info(`Switched to ${themeLabel()} theme`, { duration: 2500 })
}
</script>

<template>
  <button
    type="button"
    class="theme-toggle group relative flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold transition-all duration-300 hover:border-accent/40"
    :title="`Theme: ${themeLabel()}. Click to switch.`"
    :aria-label="`Theme: ${themeLabel()}. Click to switch.`"
    @click="handleToggle"
  >
    <span
      class="flex h-5 w-5 items-center justify-center rounded bg-surface-muted text-[9px] font-bold uppercase text-accent transition-transform duration-300 group-hover:scale-110"
    >
      <svg
        v-if="theme === 'light'"
        class="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <svg
        v-else-if="theme === 'game'"
        class="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <svg
        v-else
        class="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </span>
    <span class="text-text-muted group-hover:text-text">
      {{ themeLabel() }}
    </span>
  </button>
</template>
