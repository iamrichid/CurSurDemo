<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const container = ref(null)
const hovered = ref(false)
const activePin = ref('origin')

let renderer, scene, camera, controls, raf, routeMesh, routeGlow, pulseA, pulseB, pinInterval
let flowParticles = [], trailMeshes = [], curve, vehicle, wheels = [], grid, ROAD_Y, wheelAngle = 0

function getAccent() {
  return getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#d4ff00'
}

function createLowPolyCar(accent) {
  const car = new THREE.Group()
  const bodyMat = new THREE.MeshBasicMaterial({ color: accent })
  const darkMat = new THREE.MeshBasicMaterial({ color: '#141414' })
  const glassMat = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.35 })
  const lightMat = new THREE.MeshBasicMaterial({ color: '#ffffcc' })

  // Lower chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.09, 0.76), bodyMat)
  chassis.position.y = 0.1
  car.add(chassis)

  // Hood (front)
  const hood = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.28), bodyMat)
  hood.position.set(0, 0.13, -0.24)
  car.add(hood)

  // Cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.15, 0.36), bodyMat)
  cabin.position.set(0, 0.24, 0.06)
  car.add(cabin)

  // Windscreen
  const windscreen = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.11, 0.02), glassMat)
  windscreen.position.set(0, 0.27, -0.1)
  windscreen.rotation.x = -0.55
  car.add(windscreen)

  // Rear window
  const rearWindow = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.09, 0.02), glassMat)
  rearWindow.position.set(0, 0.26, 0.2)
  rearWindow.rotation.x = 0.45
  car.add(rearWindow)

  // Trunk
  const trunk = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.16), bodyMat)
  trunk.position.set(0, 0.14, 0.3)
  car.add(trunk)

  // Headlights
  for (const x of [-0.13, 0.13]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.04), lightMat)
    hl.position.set(x, 0.1, -0.38)
    car.add(hl)
  }

  // Taillights
  for (const x of [-0.13, 0.13]) {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.03), new THREE.MeshBasicMaterial({ color: '#ff3333' }))
    tl.position.set(x, 0.11, 0.38)
    car.add(tl)
  }

  // Wheels — stored for spin animation
  const wheelMeshes = []
  const wheelHubMat = new THREE.MeshBasicMaterial({ color: '#222222' })
  const positions = [
    [-0.17, 0.08, -0.26], [0.17, 0.08, -0.26],
    [-0.17, 0.08, 0.26], [0.17, 0.08, 0.26],
  ]
  for (const [x, y, z] of positions) {
    const wheel = new THREE.Group()
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.035, 8, 16), darkMat)
    tire.rotation.y = Math.PI / 2
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 10), wheelHubMat)
    hub.rotation.z = Math.PI / 2
    wheel.add(tire, hub)
    wheel.position.set(x, y, z)
    car.add(wheel)
    wheelMeshes.push(wheel)
  }

  // Shadow blob
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.28, 16),
    new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.35 })
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.02
  car.add(shadow)

  // Headlight beams
  for (const x of [-0.1, 0.1]) {
    const beam = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.35, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.06, side: THREE.DoubleSide })
    )
    beam.rotation.x = Math.PI / 2
    beam.position.set(x, 0.08, -0.55)
    car.add(beam)
  }

  car.userData.wheelMeshes = wheelMeshes
  return car
}

function orientVehicleOnCurve(group, progress) {
  const pt = curve.getPoint(progress)
  const tangent = curve.getTangent(progress)
  tangent.y = 0
  if (tangent.lengthSq() < 0.0001) tangent.set(0, 0, -1)
  tangent.normalize()

  group.position.set(pt.x, ROAD_Y, pt.z)
  const forward = new THREE.Vector3(0, 0, -1)
  group.quaternion.setFromUnitVectors(forward, tangent)
  return pt
}

function init() {
  if (!container.value) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight
  const accent = getAccent()

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
  camera.position.set(0, 2.8, 5.5)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.enablePan = false
  controls.minDistance = 5
  controls.maxDistance = 12
  controls.maxPolarAngle = Math.PI / 2.1
  controls.autoRotate = true
  controls.autoRotateSpeed = hovered.value ? 0.2 : 0.8

  grid = new THREE.GridHelper(8, 16, accent, accent)
  grid.material.opacity = 0.2
  grid.material.transparent = true
  scene.add(grid)

  const planeGeo = new THREE.PlaneGeometry(8, 8, 24, 24)
  const planeMat = new THREE.MeshBasicMaterial({
    color: accent,
    wireframe: true,
    transparent: true,
    opacity: 0.06,
  })
  const plane = new THREE.Mesh(planeGeo, planeMat)
  plane.rotation.x = -Math.PI / 2
  plane.position.y = 0.01
  scene.add(plane)

  ROAD_Y = 0.06
  const waypoints = [
    new THREE.Vector3(2.2, ROAD_Y, -1.5),
    new THREE.Vector3(1.4, ROAD_Y, -0.8),
    new THREE.Vector3(0.6, ROAD_Y, -0.1),
    new THREE.Vector3(-0.2, ROAD_Y, 0.7),
    new THREE.Vector3(-1.1, ROAD_Y, 1.3),
    new THREE.Vector3(-2, ROAD_Y, 1.8),
  ]
  const start = waypoints[0]
  const end = waypoints[waypoints.length - 1]
  curve = new THREE.CatmullRomCurve3(waypoints, false, 'catmullrom', 0.4)

  routeMesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 80, 0.05, 6, false),
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.9 })
  )
  scene.add(routeMesh)

  routeGlow = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 80, 0.12, 6, false),
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.12 })
  )
  scene.add(routeGlow)

  // Flow particles traveling along the road
  for (let i = 0; i < 28; i++) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 8, 8),
      new THREE.MeshBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    )
    mesh.userData.offset = i / 28
    scene.add(mesh)
    flowParticles.push(mesh)
  }

  function makeMarker(pos, color) {
    const group = new THREE.Group()
    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16),
      new THREE.MeshBasicMaterial({ color })
    )
    core.position.set(pos.x, ROAD_Y + 0.06, pos.z)
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.2, 0.3, 32),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    )
    ring.position.set(pos.x, ROAD_Y + 0.01, pos.z)
    ring.rotation.x = -Math.PI / 2
    const pulseRing = new THREE.Mesh(
      new THREE.RingGeometry(0.15, 0.16, 32),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
    )
    pulseRing.position.set(pos.x, ROAD_Y + 0.02, pos.z)
    pulseRing.rotation.x = -Math.PI / 2
    pulseRing.userData.baseScale = 1
    group.add(core, ring, pulseRing)
    return { group, core, ring, pulseRing }
  }

  pulseA = makeMarker(start, accent)
  pulseB = makeMarker(end, accent)
  scene.add(pulseA.group, pulseB.group)

  vehicle = createLowPolyCar(accent)
  wheels = vehicle.userData.wheelMeshes
  scene.add(vehicle)

  // Vehicle exhaust trail pool
  for (let i = 0; i < 12; i++) {
    const t = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
    )
    t.userData.life = 0
    scene.add(t)
    trailMeshes.push(t)
  }

  let t = 0
  let vehicleProgress = 0
  let trailIdx = 0
  let lastPt = curve.getPoint(0)

  function animate() {
    raf = requestAnimationFrame(animate)
    t += 0.014
    controls.autoRotateSpeed = hovered.value ? 0.15 : 0.7
    controls.update()

    // Drive along route with tangent-based steering
    vehicleProgress = (vehicleProgress + 0.0018) % 1
    const pt = orientVehicleOnCurve(vehicle, vehicleProgress)

    // Subtle suspension bounce
    vehicle.position.y = ROAD_Y + Math.abs(Math.sin(t * 6 + vehicleProgress * 20)) * 0.012

    // Spin wheels based on distance traveled
    const dist = pt.distanceTo(lastPt)
    wheelAngle += dist * 12
    wheels.forEach((w) => { w.rotation.x = wheelAngle })
    lastPt.copy(pt)

    // Spawn tire dust at rear wheels
    if (dist > 0.001 && Math.floor(t * 40) % 2 === 0) {
      const trail = trailMeshes[trailIdx % trailMeshes.length]
      const back = curve.getTangent(vehicleProgress).normalize().multiplyScalar(-0.2)
      trail.position.set(pt.x + back.x, ROAD_Y + 0.03, pt.z + back.z)
      trail.userData.life = 1
      trail.scale.setScalar(0.6)
      trailIdx++
    }
    trailMeshes.forEach((trail) => {
      if (trail.userData.life > 0) {
        trail.userData.life -= 0.03
        trail.material.opacity = trail.userData.life * 0.25
        trail.scale.setScalar(0.6 + (1 - trail.userData.life) * 1.5)
      }
    })

    // Flow particles along route
    flowParticles.forEach((p) => {
      const prog = (t * 0.12 + p.userData.offset) % 1
      const fp = curve.getPoint(prog)
      p.position.set(fp.x, ROAD_Y + 0.07 + Math.sin(prog * 20 + t * 4) * 0.02, fp.z)
      p.material.opacity = 0.25 + Math.sin(prog * Math.PI) * 0.75
      p.scale.setScalar(0.6 + Math.sin(t * 3 + p.userData.offset * 10) * 0.2)
    })

    // Pulsing route glow
    routeGlow.material.opacity = 0.08 + Math.sin(t * 2.5) * 0.06
    routeMesh.material.opacity = hovered.value ? 1 : 0.7 + Math.sin(t * 1.5) * 0.15

    // Marker animations
    const pulse = 1 + Math.sin(t * 3) * 0.15
    ;[pulseA, pulseB].forEach((m, idx) => {
      const active = idx === 0 ? activePin.value === 'origin' : activePin.value === 'dest'
      m.core.scale.setScalar(active && hovered.value ? pulse * 1.3 : pulse)
      m.ring.scale.setScalar(1 + Math.sin(t * 2 + idx) * 0.2)
      const ps = 1 + ((t * 0.8 + idx * 0.5) % 1) * 2.5
      m.pulseRing.scale.setScalar(ps)
      m.pulseRing.material.opacity = 0.6 * (1 - ((t * 0.8 + idx * 0.5) % 1))
    })

    // Grid breathe
    grid.material.opacity = 0.15 + Math.sin(t) * 0.05

    renderer.render(scene, camera)
  }
  animate()

  pinInterval = setInterval(() => {
    activePin.value = activePin.value === 'origin' ? 'dest' : 'origin'
  }, 2200)
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
  clearInterval(pinInterval)
  controls?.dispose()
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
  <div
    class="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface-card ft-card-glow"
    v-motion
    :initial="{ opacity: 0, scale: 0.96 }"
    :enter="{ opacity: 1, scale: 1, transition: { delay: 300, duration: 700 } }"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <div ref="container" class="absolute inset-0 cursor-grab active:cursor-grabbing" />

    <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent" />

    <div class="pointer-events-none absolute left-[68%] top-[22%] -translate-x-1/2 -translate-y-full">
      <div
        class="mb-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-medium shadow-sm transition-transform duration-300"
        :class="activePin === 'origin' ? 'scale-110 bg-accent text-accent-foreground' : 'bg-surface-card text-text border border-border'"
      >
        East Legon
      </div>
    </div>
    <div class="pointer-events-none absolute left-[28%] top-[62%] -translate-x-1/2 -translate-y-full">
      <div
        class="mb-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-medium shadow-sm transition-transform duration-300"
        :class="activePin === 'dest' ? 'scale-110 bg-accent text-accent-foreground' : 'bg-surface-card text-text border border-border'"
      >
        Circle
      </div>
    </div>

    <div class="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg border border-border bg-surface/90 px-3 py-2 backdrop-blur-sm">
      <span class="text-[10px] font-medium text-text-muted">Accra Metro</span>
      <span class="font-mono text-[10px] text-accent">
        {{ hovered ? 'Drag to orbit · Scroll to zoom' : 'Live road route · Car' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
:deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
