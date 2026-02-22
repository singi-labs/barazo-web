const chromeLaunchConfig = {
  args: ['--no-sandbox'],
}

// In CI, use the system-installed Chrome
if (process.env.CI) {
  chromeLaunchConfig.executablePath = '/usr/bin/google-chrome-stable'
}

module.exports = {
  defaults: {
    standard: 'WCAG2AA',
    timeout: 30000,
    wait: 1000,
    chromeLaunchConfig,
  },
  urls: [
    'http://localhost:3000/',
    {
      url: 'http://localhost:3000/c/general/',
      // In CI (no backend API), these pages throw during SSR and render error
      // boundaries. Next.js streaming SSR discards all route metadata (including
      // the root layout's static title) when a page component errors. The error
      // boundary sets document.title client-side, but the <title> element is
      // absent from the initial SSR HTML. In production, generateMetadata
      // provides the title on successful renders.
      ignore: ['WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.1.NoTitleEl'],
    },
    {
      url: 'http://localhost:3000/t/test-topic/abc123/',
      ignore: ['WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.1.NoTitleEl'],
    },
    'http://localhost:3000/search/',
    'http://localhost:3000/admin/',
    'http://localhost:3000/settings/',
    'http://localhost:3000/u/alice/',
    'http://localhost:3000/accessibility/',
  ],
}
