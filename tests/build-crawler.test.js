import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('build output for crawlers', () => {
  it('keeps readable static document content outside #app', () => {
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8')
    expect(html).toContain('id="site-document"')
    expect(html).toContain('Live Playground — Quote by address')
    expect(html).toMatch(/<div id="app"><\/div>/)
  })
})
