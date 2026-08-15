import { describe, expect, it } from 'vitest'
import {
  isCrawlerRequest,
  isCrawlerUserAgent,
  renderPublicHtml,
  wantsBrowserHtml,
} from '../src/utils/crawler.js'
import worker from '../workers/src/index.js'

function request(url, headers = {}, method = 'GET') {
  return new Request(url, { method, headers })
}

describe('isCrawlerUserAgent', () => {
  it('detects search, social, and AI crawlers', () => {
    expect(isCrawlerUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true)
    expect(isCrawlerUserAgent('Twitterbot/1.0')).toBe(true)
    expect(isCrawlerUserAgent('GPTBot')).toBe(true)
    expect(isCrawlerUserAgent('Cloudflare-Crawler/1.0')).toBe(true)
    expect(isCrawlerUserAgent('Mozilla/5.0 HeadlessChrome/120')).toBe(true)
  })

  it('does not treat normal browsers as crawlers', () => {
    expect(
      isCrawlerUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0'
      )
    ).toBe(false)
    expect(isCrawlerUserAgent('curl/8.7.1')).toBe(false)
    expect(isCrawlerUserAgent('CUBOT KING KONG phone')).toBe(false)
  })
})

describe('wantsBrowserHtml', () => {
  it('prefers HTML when it is listed first', () => {
    expect(
      wantsBrowserHtml(
        request('https://example.com/', {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        })
      )
    ).toBe(true)
  })

  it('keeps */* API clients on JSON', () => {
    expect(wantsBrowserHtml(request('https://example.com/', { Accept: '*/*' }))).toBe(
      false
    )
  })
})

describe('renderPublicHtml', () => {
  it('includes the interactive playground and landing copy', () => {
    const html = renderPublicHtml({ appUrl: 'https://cur-sur-demo.vercel.app' })
    expect(html).toContain('data-content-loaded')
    expect(html).toContain('The Routing &amp; Pricing API for Ghanaian Logistics')
    expect(html).toContain('id="playground"')
    expect(html).toContain('Live Playground')
    expect(html).toContain('East Legon, Accra')
    expect(html).toContain('GH₵ 0.10')
    expect(html).toContain('POST /v1/quote')
    expect(html).toContain('https://cur-sur-demo.vercel.app/#playground')
  })
})

describe('worker root for crawlers', () => {
  const env = { APP_URL: 'https://cur-sur-demo.vercel.app', ALLOWED_ORIGINS: '*' }

  it('returns the public UI HTML instead of JSON', async () => {
    const response = await worker.fetch(
      request('https://any3mi-api.example.workers.dev/', {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)',
        Accept: '*/*',
      }),
      env
    )
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('text/html')
    const body = await response.text()
    expect(body).toContain('Live Playground')
    expect(body).toContain('Quote by address')
    expect(body).not.toContain('"service": "any3mi-api"')
  })

  it('still returns the API catalog for programmatic clients', async () => {
    const response = await worker.fetch(
      request('https://any3mi-api.example.workers.dev/', {
        Accept: 'application/json',
      }),
      env
    )
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    const body = await response.json()
    expect(body.service).toBe('any3mi-api')
    expect(body.quote).toBe('POST /v1/quote')
  })

  it('redirects human browsers to the interactive app', async () => {
    const response = await worker.fetch(
      request('https://any3mi-api.example.workers.dev/', {
        Accept: 'text/html',
        'User-Agent': 'Mozilla/5.0 Chrome/120.0.0.0',
      }),
      env
    )
    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('https://cur-sur-demo.vercel.app/')
  })

  it('treats Purpose: preview as a crawler', async () => {
    const response = await worker.fetch(
      request('https://any3mi-api.example.workers.dev/', {
        Accept: '*/*',
        Purpose: 'preview',
      }),
      env
    )
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('text/html')
  })
})

describe('isCrawlerRequest', () => {
  it('uses Sec-Purpose prerender', () => {
    expect(
      isCrawlerRequest(
        request('https://example.com/', { 'Sec-Purpose': 'prefetch;prerender' })
      )
    ).toBe(true)
  })
})
