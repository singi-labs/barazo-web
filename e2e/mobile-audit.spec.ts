import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { join } from 'node:path'

/**
 * One-off mobile viewport audit against staging.
 * Checks horizontal overflow and a11y at 375px width.
 * Run: pnpm exec playwright test e2e/mobile-audit.spec.ts --config e2e/mobile-audit.config.ts
 */

const pages = [
  { name: 'Homepage', path: '/' },
  { name: 'Category page', path: '/c/general/' },
  { name: 'Topic page', path: '/t/test-topic/abc123/' },
  { name: 'Search page', path: '/search/' },
  { name: 'Admin dashboard', path: '/admin/' },
  { name: 'Settings page', path: '/settings/' },
  { name: 'Profile page', path: '/u/jay/' },
  { name: 'Accessibility statement', path: '/accessibility/' },
  { name: 'Login page', path: '/login/' },
  { name: 'Legal - Privacy', path: '/legal/privacy/' },
  { name: 'Legal - Terms', path: '/legal/terms/' },
]

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa'] as const

test.describe('Mobile viewport audit (375px)', () => {
  for (const { name, path } of pages) {
    test(`${name} (${path}) — no horizontal overflow`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' })
      // Allow layout to settle
      await page.waitForTimeout(1000)

      // Screenshot for visual review
      await page.screenshot({
        path: join(
          'e2e',
          'screenshots',
          'mobile',
          `${name.toLowerCase().replace(/\s+/g, '-')}.png`
        ),
        fullPage: true,
      })

      // Check for horizontal overflow
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })

      if (hasOverflow) {
        // Find the overflowing elements for debugging
        const overflowingElements = await page.evaluate(() => {
          const viewportWidth = document.documentElement.clientWidth
          const elements: string[] = []
          document.querySelectorAll('*').forEach((el) => {
            const rect = el.getBoundingClientRect()
            if (rect.right > viewportWidth + 1) {
              const tag = el.tagName.toLowerCase()
              const id = el.id ? `#${el.id}` : ''
              const cls =
                el.className && typeof el.className === 'string'
                  ? `.${el.className.split(' ').slice(0, 3).join('.')}`
                  : ''
              elements.push(`${tag}${id}${cls} (right: ${Math.round(rect.right)}px)`)
            }
          })
          return elements.slice(0, 10)
        })

        expect(
          hasOverflow,
          `Horizontal overflow detected. Overflowing elements:\n${overflowingElements.join('\n')}`
        ).toBe(false)
      }
    })

    test(`${name} (${path}) — no a11y violations at mobile`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(1000)

      const results = await new AxeBuilder({ page }).withTags([...WCAG_TAGS]).analyze()

      expect(results.violations).toEqual([])
    })
  }
})
