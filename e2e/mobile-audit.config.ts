import { defineConfig } from '@playwright/test'

/**
 * Playwright config for mobile audit against staging.
 * No local webServer needed -- tests hit staging directly.
 */
export default defineConfig({
  testDir: '.',
  testMatch: 'mobile-audit.spec.ts',

  retries: 0,
  workers: 1,

  reporter: [['html', { open: 'on-failure' }], ['list']],

  use: {
    baseURL: 'https://staging.barazo.forum',
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'mobile-audit',
      use: {},
    },
  ],
})
