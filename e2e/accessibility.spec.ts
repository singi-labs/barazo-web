import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Accessibility tests for all Barazo page types.
 * Tests against WCAG 2.0 A, WCAG 2.0 AA, and WCAG 2.2 AA criteria.
 *
 * Dynamic pages (/c/[slug], /t/[slug]/[rkey], /u/[handle]) may render
 * error/fallback pages when no API is running. This is acceptable --
 * we test the rendered HTML for a11y violations regardless.
 */

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa'] as const

const pages = [
  { name: 'Homepage', path: '/' },
  { name: 'Category page', path: '/c/general/' },
  { name: 'Topic page', path: '/t/test-topic/abc123/' },
  { name: 'Search page', path: '/search/' },
  { name: 'Admin dashboard', path: '/admin/' },
  { name: 'Settings page', path: '/settings/' },
  { name: 'Profile page', path: '/u/alice/' },
  { name: 'Accessibility statement', path: '/accessibility/' },
]

for (const { name, path } of pages) {
  test(`${name} (${path}) has no accessibility violations`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' })

    const results = await new AxeBuilder({ page }).withTags([...WCAG_TAGS]).analyze()

    expect(results.violations).toEqual([])
  })
}
