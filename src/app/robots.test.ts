/**
 * Tests for robots.txt configuration.
 * @see specs/prd-web.md Section 5 (robots.txt)
 */

import { describe, it, expect } from 'vitest'
import robots from './robots'

describe('robots.txt', () => {
  function getRules() {
    const result = robots()
    return Array.isArray(result.rules) ? result.rules : [result.rules]
  }

  it('allows general crawlers on public pages', () => {
    const rules = getRules()
    expect(rules[0]).toMatchObject({
      userAgent: '*',
      allow: '/',
    })
  })

  it('disallows admin, auth, API, and non-public pages', () => {
    const rules = getRules()
    expect(rules[0]!.disallow).toEqual(
      expect.arrayContaining([
        '/admin/',
        '/auth/',
        '/api/',
        '/search',
        '/settings',
        '/notifications',
      ])
    )
  })

  it('blocks SEO bots', () => {
    const rules = getRules()
    expect(rules[1]!.userAgent).toEqual(
      expect.arrayContaining(['SemrushBot', 'AhrefsBot', 'MJ12bot'])
    )
    expect(rules[1]!.disallow).toBe('/')
  })

  it('blocks AI crawlers', () => {
    const rules = getRules()
    expect(rules[2]!.userAgent).toEqual(
      expect.arrayContaining(['GPTBot', 'ClaudeBot', 'CCBot', 'Google-Extended'])
    )
    expect(rules[2]!.disallow).toBe('/')
  })

  it('includes sitemap directive', () => {
    const result = robots()
    expect(result.sitemap).toMatch(/\/sitemap\.xml$/)
  })
})
