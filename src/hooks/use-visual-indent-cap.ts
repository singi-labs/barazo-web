/**
 * Returns the maximum visual indent level based on viewport width.
 * Desktop (>=768px): 4, Tablet (>=481px): 3, Mobile (<481px): 2.
 * Defaults to desktop value during SSR.
 */

import { VISUAL_INDENT_CAPS } from '@/lib/threading-constants'
import { useMediaQuery } from './use-media-query'

export function useVisualIndentCap(): number {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const isTablet = useMediaQuery('(min-width: 481px)')

  if (isDesktop) return VISUAL_INDENT_CAPS.desktop
  if (isTablet) return VISUAL_INDENT_CAPS.tablet
  return VISUAL_INDENT_CAPS.mobile
}
