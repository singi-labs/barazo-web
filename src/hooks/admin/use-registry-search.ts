/**
 * Hook for searching the plugin registry.
 * @see specs/prd-web.md Section M13
 */

'use client'

import { useState, useCallback } from 'react'
import { searchPluginRegistry } from '@/lib/api/client'
import type { RegistryPlugin } from '@/lib/api/types'

export function useRegistrySearch() {
  const [results, setResults] = useState<RegistryPlugin[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const search = useCallback(async (params: { q?: string; category?: string; source?: string }) => {
    setLoading(true)
    setError(null)
    setHasSearched(true)
    try {
      const response = await searchPluginRegistry(params)
      setResults(response.plugins)
    } catch {
      setError('Failed to search the plugin registry.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  return { results, loading, error, hasSearched, search }
}
