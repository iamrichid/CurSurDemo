<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  active: { type: Boolean, default: false },
})

const container = ref(null)
let renderer, scene, camera, mesh, raf

function getAccent() {
  return getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#d4ff00'
}

function init() {
  if (!container.value) return
  const size = 96
  const accent = getAccent()

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(50, 1, 0.1, 10)
  camera.position.z = 2.2

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(size, size)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.value.appendChild(renderer.domElement)

  mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.7, 1),
    new THREE.MeshBasicMaterial({ color: accent, wireframe: true, transparent: true, opacity: 0.9 })
  )
  scene.add(mesh)

  const inner = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.4, 0),
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.3 })
  )
  mesh.add(inner)
  mesh.userData.inner = inner

  let t = 0
  function animate() {
    raf = requestAnimationFrame(animate)
    if (!props.active) return
    t += 0.05
    mesh.rotation.x = t
    mesh.rotation.y = t * 1.3
    mesh.userData.inner.rotation.z = -t * 2
    renderer.render(scene, camera)
  }
  animate()
}

function destroy() {
  cancelAnimationFrame(raf)
  renderer?.dispose()
  renderer?.domElement?.remove()
}

watch(() => props.active, (v) => {
  if (v && !renderer) init()
})

onMounted(() => {
  if (props.active) init()
})

onUnmounted(() => destroy())
</script>

<template>
  <div ref="container" class="three-loader h-24 w-24" aria-hidden="true" />
</template>

<style scoped>
.three-loader :deep(canvas) {
  width: 96px !important;
  height: 96px !important;
}
</style>
