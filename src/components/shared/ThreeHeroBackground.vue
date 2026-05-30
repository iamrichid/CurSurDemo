<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const container = ref(null)
let renderer, scene, camera, particles, lines, torus, raf
let mouse = { x: 0, y: 0 }, targetMouse = { x: 0, y: 0 }

const COUNT = 80

function getColors() {
  const style = getComputedStyle(document.documentElement)
  return {
    accent: style.getPropertyValue('--color-accent').trim() || '#d4ff00',
    secondary: style.getPropertyValue('--color-accent-secondary').trim() || '#8b5cf6',
  }
}

function init() {
  if (!container.value) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight
  const { accent, secondary } = getColors()

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100)
  camera.position.z = 5

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.value.appendChild(renderer.domElement)

  // Floating wireframe torus — brand centerpiece
  torus = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.1, 0.28, 120, 16),
    new THREE.MeshBasicMaterial({
      color: accent,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    })
  )
  torus.position.set(2.5, 0.5, -3)
  scene.add(torus)

  const innerTorus = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.02, 8, 64),
    new THREE.MeshBasicMaterial({ color: secondary, transparent: true, opacity: 0.2 })
  )
  innerTorus.position.set(-2, -0.5, -2)
  scene.add(innerTorus)
  torus.userData.inner = innerTorus

  const positions = new Float32Array(COUNT * 3)
  const sizes = new Float32Array(COUNT)
  const velocities = []
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12
    positions[i * 3 + 1] = (Math.random() - 0.5) * 7
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5
    sizes[i] = 0.03 + Math.random() * 0.04
    velocities.push({
      x: (Math.random() - 0.5) * 0.005,
      y: (Math.random() - 0.5) * 0.005,
      z: (Math.random() - 0.5) * 0.003,
    })
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particles = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color: accent,
      size: 0.05,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })
  )
  particles.userData.velocities = velocities
  scene.add(particles)

  const lineGeo = new THREE.BufferGeometry()
  const linePositions = new Float32Array(COUNT * COUNT * 3)
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
  lines = new THREE.LineSegments(
    lineGeo,
    new THREE.LineBasicMaterial({
      color: secondary,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  )
  scene.add(lines)

  const grid = new THREE.GridHelper(14, 28, accent, accent)
  grid.material.opacity = 0.05
  grid.material.transparent = true
  grid.rotation.x = Math.PI / 2
  grid.position.z = -3
  scene.add(grid)

  function onMove(e) {
    const rect = container.value.getBoundingClientRect()
    targetMouse.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    targetMouse.y = -((e.clientY - rect.top) / rect.height - 0.5) * 2
  }
  container.value.addEventListener('mousemove', onMove)
  container.value._onMove = onMove

  let t = 0
  function animate() {
    raf = requestAnimationFrame(animate)
    t += 0.01
    mouse.x += (targetMouse.x - mouse.x) * 0.04
    mouse.y += (targetMouse.y - mouse.y) * 0.04

    camera.position.x = mouse.x * 0.8
    camera.position.y = mouse.y * 0.5
    camera.lookAt(0, 0, 0)

    torus.rotation.x = t * 0.3
    torus.rotation.y = t * 0.5
    torus.material.opacity = 0.08 + Math.sin(t * 1.5) * 0.05
    if (torus.userData.inner) {
      torus.userData.inner.rotation.z = -t * 0.4
      torus.userData.inner.rotation.x = t * 0.2
    }

    const pos = particles.geometry.attributes.position.array
    const vels = particles.userData.velocities
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] += vels[i].x + mouse.x * 0.003
      pos[i * 3 + 1] += vels[i].y + mouse.y * 0.003
      pos[i * 3 + 2] += vels[i].z
      for (const axis of ['x', 'y', 'z']) {
        const idx = axis === 'x' ? i * 3 : axis === 'y' ? i * 3 + 1 : i * 3 + 2
        const limit = axis === 'z' ? 3 : 6
        if (Math.abs(pos[idx]) > limit) vels[i][axis] *= -1
      }
    }
    particles.geometry.attributes.position.needsUpdate = true
    particles.rotation.z = Math.sin(t * 0.5) * 0.03
    particles.material.size = 0.045 + Math.sin(t * 2) * 0.01

    const lp = lines.geometry.attributes.position.array
    let vi = 0
    const CONNECT = 2
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = pos[i * 3] - pos[j * 3]
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1]
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2]
        if (dx * dx + dy * dy + dz * dz < CONNECT * CONNECT) {
          lp[vi++] = pos[i * 3]
          lp[vi++] = pos[i * 3 + 1]
          lp[vi++] = pos[i * 3 + 2]
          lp[vi++] = pos[j * 3]
          lp[vi++] = pos[j * 3 + 1]
          lp[vi++] = pos[j * 3 + 2]
        }
      }
    }
    lines.geometry.setDrawRange(0, vi / 3)
    lines.geometry.attributes.position.needsUpdate = true
    lines.material.opacity = 0.12 + Math.sin(t) * 0.06

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
  container.value?._onMove && container.value.removeEventListener('mousemove', container.value._onMove)
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
  <div ref="container" class="three-hero-bg pointer-events-auto absolute inset-0" aria-hidden="true" />
</template>

<style scoped>
.three-hero-bg :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
