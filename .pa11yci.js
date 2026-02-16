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
    'http://localhost:3000/c/general/',
    'http://localhost:3000/t/test-topic/abc123/',
    'http://localhost:3000/search/',
    'http://localhost:3000/admin/',
    'http://localhost:3000/settings/',
    'http://localhost:3000/u/alice/',
    'http://localhost:3000/accessibility/',
  ],
}
