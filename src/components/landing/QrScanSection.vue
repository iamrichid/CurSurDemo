<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import QRCode from 'qrcode'
import { useScrollReveal } from '../../composables/useScrollReveal'
import { useTheme } from '../../composables/useTheme.js'
import { useToast } from '../../composables/useToast.js'
import { brand } from '../../data/brand.js'

const { el: sectionEl, isVisible } = useScrollReveal()
const { theme } = useTheme()
const toast = useToast()
const canvasRef = ref(null)
const qrReady = ref(false)

const siteUrl = computed(() => {
  const configured = import.meta.env.VITE_SITE_URL?.trim()
  const url = configured || brand.siteUrl
  return url.replace(/\/$/, '')
})

const displayHost = computed(() => siteUrl.value.replace(/^https?:\/\//, ''))

async function renderQr() {
  qrReady.value = false
  if (!canvasRef.value) return
  try {
    const style = getComputedStyle(document.documentElement)
    const dark = style.getPropertyValue('--color-text').trim() || '#18181b'
    const light = style.getPropertyValue('--color-surface-elevated').trim() || '#ffffff'
    await QRCode.toCanvas(canvasRef.value, siteUrl.value, {
      width: 200,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark, light },
    })
    qrReady.value = true
  } catch {
    toast.error('Could not generate QR code')
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(siteUrl.value)
    toast.success('Link copied')
  } catch {
    toast.error('Could not copy link')
  }
}

onMounted(renderQr)
watch(siteUrl, renderQr)
watch(theme, renderQr)
</script>

<template>
  <section
    id="scan"
    ref="sectionEl"
    class="border-t border-border py-20 sm:py-24"
  >
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <div
        class="transition-all duration-700"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <div class="mb-10 text-center">
          <p class="text-xs font-semibold uppercase tracking-widest text-accent">Mobile access</p>
          <h2 class="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Scan to open {{ brand.name }}
          </h2>
          <p class="mx-auto mt-3 max-w-lg text-sm text-text-muted">
            Point your phone camera at the code to jump straight to the site — playground, docs, and API signup.
          </p>
        </div>

        <div
          class="ft-card-glow mx-auto flex max-w-3xl flex-col items-center gap-8 p-6 sm:flex-row sm:gap-10 sm:p-8"
        >
          <div
            class="relative flex shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-elevated p-4 shadow-lg shadow-black/10"
            :class="{ 'animate-pulse': !qrReady }"
          >
            <canvas
              ref="canvasRef"
              class="block h-[200px] w-[200px]"
              role="img"
              :aria-label="`QR code for ${siteUrl}`"
            />
            <div
              class="pointer-events-none absolute inset-4 rounded-lg border-2 border-dashed border-accent/20"
              aria-hidden="true"
            />
          </div>

          <div class="flex flex-1 flex-col items-center text-center sm:items-start sm:text-left">
            <p class="text-xs font-semibold uppercase tracking-wider text-text-subtle">Website URL</p>
            <p class="mt-2 font-mono text-lg font-semibold text-text sm:text-xl">
              {{ displayHost }}
            </p>
            <p class="mt-3 text-sm leading-relaxed text-text-muted">
              Works with iPhone Camera, Google Lens, and any QR scanner. No app install required.
            </p>
            <div class="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
              <a
                :href="siteUrl"
                class="ft-btn-primary px-5 py-2.5 text-sm"
              >
                Open site
              </a>
              <button
                type="button"
                class="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
                @click="copyLink"
              >
                Copy link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
