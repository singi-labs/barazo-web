'use client'

import { useEffect, useState } from 'react'
import { getPublicSettings } from '@/lib/api/client'

/**
 * Client component that replaces the default favicon with a community-uploaded
 * one when available. Renders nothing visible -- only updates <link rel="icon">.
 */
export function DynamicFavicon() {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getPublicSettings()
      .then((settings) => {
        if (!cancelled && settings.faviconUrl) {
          setFaviconUrl(settings.faviconUrl)
        }
      })
      .catch(() => {
        // Ignore -- default /favicon.ico handled by static metadata
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!faviconUrl) return null

  return <link rel="icon" href={faviconUrl} />
}
