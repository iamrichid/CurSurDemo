<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import CursorGlow from './components/shared/CursorGlow.vue'

const route = useRoute()

const transitionName = computed(() =>
  route.path.startsWith('/dashboard') ? 'panel' : 'page'
)
</script>

<template>
  <CursorGlow />
  <RouterView v-slot="{ Component, route: r }">
    <Transition :name="transitionName" mode="out-in">
      <component :is="Component" :key="r.path" />
    </Transition>
  </RouterView>
</template>
