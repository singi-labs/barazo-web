/**
 * robots.txt configuration.
 * Disallows admin, auth, API, and search pages.
 * Blocks SEO bots and AI crawlers by default.
 * @see specs/prd-web.md Section 5 (robots.txt)
 */

import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://barazo.forum'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/auth/', '/api/', '/search', '/settings', '/notifications'],
      },
      {
        userAgent: ['SemrushBot', 'AhrefsBot', 'MJ12bot', 'BLEXBot'],
        disallow: '/',
      },
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'CCBot', 'Google-Extended'],
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
