export function getThemeColors() {
  const style = getComputedStyle(document.documentElement)
  const accent = style.getPropertyValue('--color-accent').trim() || '#d4ff00'
  const secondary = style.getPropertyValue('--color-accent-secondary').trim() || '#8b5cf6'
  const surface = style.getPropertyValue('--color-surface').trim() || '#09090b'
  return { accent, secondary, surface }
}

export function hexToThreeColor(hex) {
  const h = hex.startsWith('#') ? hex : `#${hex}`
  return parseInt(h.replace('#', ''), 16)
}
