import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const distDir = join(rootDir, 'dist')
const port = 4173
const baseUrl = `http://127.0.0.1:${port}`

const routes = [
  { path: '/', outFile: join(distDir, 'index.html') },
  { path: '/docs', outFile: join(distDir, 'docs', 'index.html') },
]

function waitForServer(url, timeoutMs = 30_000) {
  const started = Date.now()
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const response = await fetch(url)
        if (response.ok) return resolve()
      } catch {
        // preview still booting
      }
      if (Date.now() - started > timeoutMs) {
        reject(new Error(`Timed out waiting for ${url}`))
        return
      }
      setTimeout(tick, 250)
    }
    tick()
  })
}

function startPreview() {
  return spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
    cwd: rootDir,
    stdio: 'ignore',
    env: { ...process.env, NODE_ENV: 'production' },
  })
}

function injectAppHtml(template, appHtml) {
  return template.replace(
    /<div id="app"[^>]*>[\s\S]*?<\/div>(?=\s*<main id="site-document")/,
    `<div id="app" data-prerendered data-content-loaded data-app-ready>${appHtml}</div>`
  )
}

async function prerenderRoute(page, routePath) {
  await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('#app[data-app-ready]', { timeout: 30_000 })
  await page.waitForTimeout(300)
  return page.locator('#app').innerHTML()
}

async function main() {
  const preview = startPreview()
  let browser

  try {
    await waitForServer(baseUrl)
    try {
      browser = await chromium.launch({ headless: true })
    } catch (err) {
      console.warn(
        'Skipping prerender: Playwright browser unavailable.',
        err instanceof Error ? err.message : err
      )
      console.warn('Run `npx playwright install chromium` locally to prerender Vue routes.')
      return
    }

    const page = await browser.newPage()
    let shell = readFileSync(join(distDir, 'index.html'), 'utf8')

    for (const route of routes) {
      const appHtml = await prerenderRoute(page, route.path)
      const rendered = injectAppHtml(shell, appHtml)
      mkdirSync(dirname(route.outFile), { recursive: true })
      writeFileSync(route.outFile, rendered, 'utf8')
      shell = rendered
      console.log(`Prerendered ${route.path} -> ${route.outFile}`)
    }
  } finally {
    if (browser) await browser.close()
    preview.kill('SIGTERM')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
