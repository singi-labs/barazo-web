/**
 * Returns thread indent configuration based on viewport width.
 * - indentStep: pixels per indent level
 * - showChevron: whether to render the chevron icon (hidden on mobile)
 */

import { INDENT_STEP } from '@/lib/threading-constants'
import { useMediaQuery } from './use-media-query'

interface ThreadIndent {
  indentStep: number
  showChevron: boolean
}

export function useThreadIndent(): ThreadIndent {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const isTablet = useMediaQuery('(min-width: 481px)')

  if (isDesktop) return { indentStep: INDENT_STEP.desktop, showChevron: true }
  if (isTablet) return { indentStep: INDENT_STEP.tablet, showChevron: true }
  return { indentStep: INDENT_STEP.mobile, showChevron: false }
}
