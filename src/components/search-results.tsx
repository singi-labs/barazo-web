/**
 * SearchResults - Fetches and displays search results based on query params.
 * Must be wrapped in <Suspense> because it reads useSearchParams.
 * @see specs/prd-web.md Section M9
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { SearchResultCard } from '@/components/search-result-card'
import { searchContent } from '@/lib/api/client'
import type { SearchResult, SearchResponse } from '@/lib/api/types'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function SearchResults() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''

  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const performSearch = useCallback(async (q: string) => {
    if (!q) {
      setResults([])
      setTotal(null)
      setSearched(false)
      return
    }

    setLoading(true)
    try {
      const response: SearchResponse = await searchContent({ q })
      setResults(response.results)
      setTotal(response.total)
      setSearched(true)
    } catch {
      setResults([])
      setTotal(0)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialQuery) {
      void performSearch(initialQuery)
    }
  }, [initialQuery, performSearch])

  return (
    <div aria-live="polite">
      {loading && (
        <div className="animate-pulse space-y-4 py-4">
          <div className="h-16 rounded bg-muted" />
          <div className="h-16 rounded bg-muted" />
        </div>
      )}

      {!loading && !searched && !initialQuery && (
        <p className="py-8 text-center text-muted-foreground">
          Enter a search term to find topics and replies.
        </p>
      )}

      {!loading && searched && results.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No results found for &ldquo;{initialQuery}&rdquo;. Try a different search term.
        </p>
      )}

      {!loading && searched && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {total} result{total !== 1 ? 's' : ''} for &ldquo;{initialQuery}&rdquo;
          </p>

          <ul className="space-y-3">
            {results.map((result) => (
              <li key={result.uri}>
                <SearchResultCard result={result} formatDate={formatDate} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
