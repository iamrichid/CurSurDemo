<script setup>
import DashboardSidebar from '../components/dashboard/DashboardSidebar.vue'
import ThemeToggle from '../components/shared/ThemeToggle.vue'
</script>

<template>
  <div class="flex min-h-screen bg-surface mesh-bg">
    <DashboardSidebar />
    <main class="flex-1 overflow-y-auto">
      <div class="border-b border-border bg-surface/60 px-6 py-4 backdrop-blur-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 font-mono text-xs text-text-subtle">
            <span class="rounded-md bg-accent-muted px-1.5 py-0.5 font-semibold text-accent">LIVE</span>
            a3_live_sk_••••••••abc123
          </div>
          <div class="flex items-center gap-3">
            <ThemeToggle />
            <span class="text-xs text-text-subtle">Accra Delivery Co.</span>
            <div class="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface-card text-xs font-bold text-accent">
              AD
            </div>
          </div>
        </div>
      </div>

      <div class="p-6">
        <RouterView v-slot="{ Component }">
          <Transition name="panel" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </main>
  </div>
</template>
