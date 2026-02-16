import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for Barazo Web accessibility testing.
 * Uses Chromium only -- cross-browser testing is unnecessary for a11y audits.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: 'e2e',

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry once locally to reduce flakiness, never on CI */
  retries: process.env.CI ? 0 : 1,

  /* Single worker on CI for deterministic results */
  workers: process.env.CI ? 1 : undefined,

  /* Reporters */
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'on-failure' }]],

  use: {
    /* Base URL for all page.goto() calls */
    baseURL: 'http://localhost:3000',

    /* Capture traces on failure for debugging */
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Start the Next.js standalone server before running tests */
  webServer: {
    command:
      'mkdir -p .next/standalone/.next && cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public && node .next/standalone/server.js',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    env: {
      PORT: '3000',
      HOSTNAME: '0.0.0.0',
    },
  },
})
