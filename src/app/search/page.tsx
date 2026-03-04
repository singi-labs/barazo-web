/**
 * Search results page.
 * URL: /search?q={query}
 * Displays full-text search results with type indicators.
 * noindex per specs/prd-web.md robots.txt section.
 * @see specs/prd-web.md Section M9
 */

'use client'

import { Suspense, useState, useEffect } from 'react'
import { getPublicSettings } from '@/lib/api/client'
import { ForumLayout } from '@/components/layout/forum-layout'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { SearchInput } from '@/components/search-input'
import { SearchResults } from '@/components/search-results'
import type { PublicSettings } from '@/lib/api/types'

export default function SearchPage() {
  const [publicSettings, setPublicSettings] = useState<PublicSettings | null>(null)

  useEffect(() => {
    getPublicSettings()
      .then((settings) => setPublicSettings(settings))
      .catch(() => {})
  }, [])

  return (
    <ForumLayout publicSettings={publicSettings}>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Search' }]} />

        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Search</h1>

          <div className="max-w-lg">
            <SearchInput placeholder="Search topics and replies..." />
          </div>
        </div>

        <Suspense
          fallback={
            <div className="animate-pulse space-y-4 py-4">
              <div className="h-16 rounded bg-muted" />
              <div className="h-16 rounded bg-muted" />
            </div>
          }
        >
          <SearchResults />
        </Suspense>
      </div>
    </ForumLayout>
  )
}
