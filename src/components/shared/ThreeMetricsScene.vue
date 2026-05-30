<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const container = ref(null)
let renderer, scene, camera, bars = [], orbitParticles = [], raf

const heights = [2.4, 0.48, 1.85, 0.142]
const labels = ['2.4M', '48', '18.5k', '142ms']

function getAccent() {
  return getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#d4ff00'
}

function init() {
  if (!container.value) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight
  const accent = getAccent()

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 50)
  camera.position.set(0, 2.5, 5)
  camera.lookAt(0, 0.8, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.value.appendChild(renderer.domElement)

  // Floor grid
  const grid = new THREE.GridHelper(6, 12, accent, accent)
  grid.material.opacity = 0.15
  grid.material.transparent = true
  scene.add(grid)

  // Animated metric bars
  heights.forEach((targetH, i) => {
    const geo = new THREE.BoxGeometry(0.5, 0.01, 0.5)
    const mat = new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.55,
    })
    const bar = new THREE.Mesh(geo, mat)
    bar.position.set((i - 1.5) * 1.2, 0, 0)
    bar.userData.targetH = targetH * 0.35
    bar.userData.phase = i * 0.8
    scene.add(bar)
    bars.push(bar)

    // Glowing cap
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.04, 0.52),
      new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.9 })
    )
    cap.userData.isCap = true
    bar.add(cap)
    cap.position.y = 0.02
  })

  // Orbiting particles
  for (let i = 0; i < 40; i++) {
    const p = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 6, 6),
      new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending })
    )
    p.userData.angle = (i / 40) * Math.PI * 2
    p.userData.radius = 2.5 + Math.random() * 1.5
    p.userData.speed = 0.003 + Math.random() * 0.004
    p.userData.y = Math.random() * 2
    scene.add(p)
    orbitParticles.push(p)
  }

  let t = 0
  function animate() {
    raf = requestAnimationFrame(animate)
    t += 0.016

    bars.forEach((obj) => {
      if (obj.userData.isCap) return
      const grow = obj.userData.targetH * (0.5 + 0.5 * Math.sin(t * 0.8 + obj.userData.phase))
      obj.scale.y = Math.max(grow, 0.01)
      obj.position.y = grow / 2
      obj.material.opacity = 0.35 + Math.sin(t + obj.userData.phase) * 0.2
      const cap = obj.children[0]
      if (cap) cap.position.y = grow / 2 + 0.02
    })

    orbitParticles.forEach((obj) => {
      obj.userData.angle += obj.userData.speed
      obj.position.x = Math.cos(obj.userData.angle) * obj.userData.radius
      obj.position.z = Math.sin(obj.userData.angle) * obj.userData.radius
      obj.position.y = obj.userData.y + Math.sin(t * 2 + obj.userData.angle) * 0.3
      obj.material.opacity = 0.2 + Math.sin(t * 3 + obj.userData.angle) * 0.3
    })

    camera.position.x = Math.sin(t * 0.2) * 0.5
    camera.lookAt(0, 0.8, 0)

    renderer.render(scene, camera)
  }
  animate()
}

function onResize() {
  if (!container.value || !renderer) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

function destroy() {
  cancelAnimationFrame(raf)
  renderer?.dispose()
  renderer?.domElement?.remove()
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  init()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  destroy()
})
</script>

<template>
  <div ref="container" class="metrics-three-bg absolute inset-0 opacity-60" aria-hidden="true" />
</template>

<style scoped>
.metrics-three-bg :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
