export function isCrawlerMode() {
  if (typeof document === 'undefined') return false
  return document.documentElement.dataset.crawler === 'true'
}

export function markAppReady(root) {
  if (root) {
    root.setAttribute('data-content-loaded', '')
    root.setAttribute('data-app-ready', '')
  }
  document.documentElement.dataset.appReady = 'true'
}
