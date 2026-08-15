<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import CursorGlow from './components/shared/CursorGlow.vue'
import ToastHost from './components/shared/ToastHost.vue'
import { isCrawlerMode } from './composables/useCrawlerMode.js'

const route = useRoute()
const crawlerMode = computed(() => isCrawlerMode())

const transitionName = computed(() =>
  route.path.startsWith('/dashboard') ? 'panel' : 'page'
)

const showCursorGlow = computed(
  () => !crawlerMode.value && !route.path.startsWith('/dashboard')
)
</script>

<template>
  <CursorGlow v-if="showCursorGlow" />
  <ToastHost />
  <RouterView v-if="crawlerMode" v-slot="{ Component, route: r }">
    <component :is="Component" :key="r.path" />
  </RouterView>
  <RouterView v-else v-slot="{ Component, route: r }">
    <Transition :name="transitionName" mode="out-in">
      <component :is="Component" :key="r.path" />
    </Transition>
  </RouterView>
</template>
