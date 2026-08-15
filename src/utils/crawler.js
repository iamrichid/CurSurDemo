import {
  brand,
  docsIntro,
  heroSubcopy,
  pageDescription,
  pageTitle,
} from '../data/brand.js'
import {
  apiEndpoints,
  curlExample,
  jsonResponse,
  vehicles,
} from '../data/docsContent.js'

/** Substrings that appear in known crawler / unfurler / preview user-agents. */
export const CRAWLER_UA_TOKENS = [
  'googlebot',
  'google-inspection',
  'googleother',
  'bingbot',
  'yandex',
  'baiduspider',
  'duckduckbot',
  'slurp',
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'discordbot',
  'whatsapp',
  'telegrambot',
  'applebot',
  'gptbot',
  'chatgpt',
  'claudebot',
  'anthropic',
  'perplexity',
  'ccbot',
  'bytespider',
  'amazonbot',
  'ia_archiver',
  'semrushbot',
  'ahrefsbot',
  'dotbot',
  'mj12bot',
  'petalbot',
  'youbot',
  'meta-externalagent',
  'chrome-lighthouse',
  'headlesschrome',
  'preview',
  'prerender',
  'embedly',
  'quora link preview',
  'pinterest',
  'skypeuripreview',
  'vkshare',
  'cloudflare-crawler',
  'cloudflarebot',
  'cf-crawler',
  'browser rendering',
]

const CRAWLER_WORD_RE = /\b(bot|crawler|spider|crawling)\b/i

export function isCrawlerUserAgent(ua = '') {
  const value = String(ua)
  if (!value) return false
  const lower = value.toLowerCase()
  if (CRAWLER_UA_TOKENS.some((token) => lower.includes(token))) return true
  return CRAWLER_WORD_RE.test(value)
}

export function isCrawlerRequest(request) {
  const ua = request.headers.get('User-Agent') || ''
  const purpose =
    request.headers.get('Purpose') ||
    request.headers.get('Sec-Purpose') ||
    request.headers.get('X-Purpose') ||
    ''
  if (/prefetch|preview|prerender/i.test(purpose)) return true
  return isCrawlerUserAgent(ua)
}

export function isCrawlerClient() {
  if (typeof document !== 'undefined' && document.documentElement.dataset.crawler === 'true') {
    return true
  }
  if (typeof navigator === 'undefined') return false
  if (navigator.webdriver) return true
  if (typeof window !== 'undefined' && (window.__playwright || window.__puppeteer__)) {
    return true
  }
  return isCrawlerUserAgent(navigator.userAgent || '')
}

/** True when the client prefers HTML over JSON (browsers), not wildcard Accept. */
export function wantsBrowserHtml(request) {
  const accept = (request.headers.get('Accept') || '').toLowerCase()
  if (!accept || accept === '*/*') return false
  const htmlIndex = accept.indexOf('text/html')
  if (htmlIndex === -1) return false
  const jsonIndex = accept.indexOf('application/json')
  if (jsonIndex === -1) return true
  return htmlIndex < jsonIndex
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(new RegExp('<', 'g'), '&lt;')
    .replace(new RegExp('>', 'g'), '&gt;')
    .replace(/"/g, '&quot;')
}

function openTag(tag, attrs = '') {
  return '<' + tag + (attrs ? ' ' + attrs : '') + '>'
}

function closeTag(tag) {
  return '<' + '/' + tag + '>'
}

function wrap(tag, inner, attrs = '') {
  return openTag(tag, attrs) + inner + closeTag(tag)
}

function listItems(entries) {
  return entries.map((entry) => wrap('li', entry)).join('')
}

function jsonLd(appUrl) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: brand.name,
        url: appUrl,
        description: pageDescription,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'GHS',
        },
        publisher: {
          '@type': 'Organization',
          name: `${brand.org} ${brand.dept}`,
        },
      },
      {
        '@type': 'WebApplication',
        name: `${brand.name} Playground`,
        url: `${appUrl}/#playground`,
        description:
          'Interactive quote playground: send Accra pickup and drop-off addresses, choose bicycle, motorbike (okada), or car, and get distance, ETA, and GH₵ pricing.',
      },
    ],
  }
}

export function renderPublicHtml({ appUrl }) {
  const origin = String(appUrl || brand.siteUrl).replace(/\/$/, '')
  const title = escapeHtml(pageTitle)
  const description = escapeHtml(pageDescription)
  const href = (path) => `href="${escapeHtml(origin + path)}"`

  const endpoints = apiEndpoints
    .map((item) =>
      wrap(
        'li',
        wrap('code', escapeHtml(item.method) + ' ' + escapeHtml(item.path)) +
          ' — ' +
          escapeHtml(item.desc)
      )
    )
    .join('')

  const vehicleItems = vehicles
    .map((item) =>
      wrap(
        'li',
        wrap('strong', escapeHtml(item.label)) +
          ' (' +
          escapeHtml(item.id) +
          ') — ' +
          escapeHtml(item.desc)
      )
    )
    .join('')

  const nav = wrap(
    'nav',
    [
      wrap('a', 'Home', href('/')),
      wrap('a', 'Docs', href('/docs')),
      wrap('a', 'Playground', href('/#playground')),
      wrap('a', 'Pricing', href('/#pricing')),
      wrap('a', 'How it works', href('/#how-it-works')),
      wrap('a', 'Get API Key', href('/dashboard/login?intent=key')),
    ].join(' ')
  )

  const hero = wrap(
    'section',
    [
      wrap('h1', 'The Routing &amp; Pricing API for Ghanaian Logistics'),
      wrap('p', escapeHtml(heroSubcopy)),
      wrap(
        'p',
        [
          wrap('a', 'Get API Key', href('/dashboard/login?intent=key')),
          ' · ',
          wrap('a', 'Try the interactive playground', href('/#playground')),
          ' · ',
          wrap('a', 'Read the docs', href('/docs')),
        ].join('')
      ),
      wrap(
        'ul',
        listItems(['99.9% uptime', 'GHS-native pricing', '&lt;200ms response'])
      ),
    ].join(''),
    'id="hero"'
  )

  const howItWorks = wrap(
    'section',
    [
      wrap('h2', 'How It Works'),
      wrap('p', 'Three steps from signup to live pricing on your platform.'),
      wrap(
        'ol',
        listItems([
          wrap('strong', 'Get API Key') +
            ' — Sign up in seconds and receive live API credentials. No credit card required to start.',
          wrap('strong', 'Plug in Coordinates') +
            ' — Send pickup and drop-off addresses (or lat/lng). ' +
            escapeHtml(brand.name) +
            ' geocodes and routes server-side.',
          wrap('strong', 'Get Accurate Cedi Pricing') +
            ' — Receive distance, duration, and a dynamic GH₵ quote tailored to the vehicle type.',
        ])
      ),
    ].join(''),
    'id="how-it-works"'
  )

  const playground = wrap(
    'section',
    [
      wrap('h2', 'Live Playground — Quote by address'),
      wrap(
        'p',
        'Send pickup and drop-off addresses — ' +
          escapeHtml(brand.name) +
          ' geocodes, routes, and prices the trip in Ghana Cedis. Open the interactive UI at ' +
          wrap('a', escapeHtml(origin) + '/#playground', href('/#playground')) +
          '.'
      ),
      wrap(
        'p',
        'Example: East Legon, Accra → Kwame Nkrumah Circle, Accra on a motorbike (okada).'
      ),
      wrap('h3', 'Request'),
      wrap('pre', wrap('code', escapeHtml(curlExample))),
      wrap('h3', 'Response'),
      wrap('pre', wrap('code', escapeHtml(jsonResponse))),
    ].join(''),
    'id="playground"'
  )

  const pricing = wrap(
    'section',
    [
      wrap('h2', 'Simple, Transparent Pricing'),
      wrap(
        'p',
        'Start free, then pay only for what you use. No hidden fees, no monthly minimums. GH₵ native — no USD conversion fees.'
      ),
      wrap(
        'article',
        [
          wrap('h3', 'Free Tier'),
          wrap('p', 'GH₵ 0 forever. Perfect for prototyping and early-stage apps.'),
          wrap(
            'ul',
            listItems([
              '500 API calls / month',
              'All vehicle types',
              'Accra metro coverage',
              'Community support',
            ])
          ),
        ].join('')
      ),
      wrap(
        'article',
        [
          wrap('h3', 'Pay-As-You-Go'),
          wrap(
            'p',
            'GH₵ 0.10 per API call after the free tier. Scale as delivery volume grows.'
          ),
          wrap(
            'ul',
            listItems([
              'Unlimited API calls',
              'Nationwide coverage',
              'Custom pricing matrix',
              'Priority support',
              '99.9% SLA',
              'MoMo wallet billing',
            ])
          ),
        ].join('')
      ),
    ].join(''),
    'id="pricing"'
  )

  const docs = wrap(
    'section',
    [
      wrap('h2', 'API'),
      wrap('p', escapeHtml(docsIntro)),
      wrap('h3', 'Endpoints'),
      wrap('ul', endpoints),
      wrap('h3', 'Vehicle types'),
      wrap('ul', vehicleItems),
      wrap(
        'p',
        wrap('a', 'Full interactive documentation', href('/docs'))
      ),
    ].join(''),
    'id="docs"'
  )

  const head = wrap(
    'head',
    [
      openTag('meta', 'charset="utf-8"'),
      openTag('meta', 'name="viewport" content="width=device-width, initial-scale=1"'),
      wrap('title', title),
      openTag('meta', `name="description" content="${description}"`),
      openTag('link', `rel="canonical" href="${escapeHtml(origin)}/"`),
      openTag('meta', 'property="og:type" content="website"'),
      openTag('meta', `property="og:url" content="${escapeHtml(origin)}/"`),
      openTag('meta', `property="og:title" content="${title}"`),
      openTag('meta', `property="og:description" content="${description}"`),
      openTag('meta', 'name="twitter:card" content="summary"'),
      openTag('meta', `name="twitter:title" content="${title}"`),
      openTag('meta', `name="twitter:description" content="${description}"`),
      wrap('script', JSON.stringify(jsonLd(origin)), 'type="application/ld+json"'),
    ].join('')
  )

  const body = wrap(
    'body',
    wrap(
      'main',
      [
        wrap(
          'header',
          wrap(
            'p',
            escapeHtml(brand.name) +
              ' · ' +
              escapeHtml(brand.org) +
              ' ' +
              escapeHtml(brand.dept)
          ) + nav
        ),
        hero,
        howItWorks,
        playground,
        pricing,
        docs,
      ].join(''),
      'data-content-loaded data-app-ready'
    )
  )

  return (
    '<!doctype html>' +
    wrap('html', head + body, 'lang="en"')
  )
}
