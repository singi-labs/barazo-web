/**
 * Maturity-aware SEO helpers.
 * Determines meta tags, JSON-LD inclusion, and OG tag inclusion
 * based on content maturity ratings (safe/mature/adult).
 * @see decisions/frontend.md Section: Content Maturity + SEO
 */

import type { Metadata } from 'next'
import type { MaturityRating } from '@/lib/api/types'

/** Maturity tier ordering for comparison. */
const MATURITY_ORDER: Record<MaturityRating, number> = {
  safe: 0,
  mature: 1,
  adult: 2,
}

/**
 * Returns the higher (more restrictive) of two maturity ratings.
 * Used to combine community-level and category-level ratings.
 */
export function getEffectiveMaturity(
  communityRating: MaturityRating,
  categoryRating: MaturityRating
): MaturityRating {
  return MATURITY_ORDER[communityRating] >= MATURITY_ORDER[categoryRating]
    ? communityRating
    : categoryRating
}

/**
 * Returns metadata fields to merge based on the effective maturity rating.
 * - safe: no special tags
 * - mature: adds rating meta tag
 * - adult: sets noindex/nofollow
 */
export function getMaturityMeta(rating: MaturityRating): Partial<Metadata> {
  switch (rating) {
    case 'safe':
      return {}
    case 'mature':
      return {
        other: { rating: 'mature' },
      }
    case 'adult':
      return {
        robots: { index: false, follow: false },
      }
  }
}

/** Whether JSON-LD structured data should be included for this rating. */
export function shouldIncludeJsonLd(rating: MaturityRating): boolean {
  return rating !== 'adult'
}

/** Whether OpenGraph tags should be included for this rating. */
export function shouldIncludeOgTags(rating: MaturityRating): boolean {
  return rating !== 'adult'
}
