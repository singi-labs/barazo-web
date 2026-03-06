/**
 * AncestorLines - Renders vertical thread lines for all ancestor depths.
 * Each line is an independent collapse control for that ancestor's sub-thread.
 * Opacity fades from right (direct parent, full) to left (distant ancestor, dim).
 * Chevrons are never shown on ancestor lines (only on the direct parent's ThreadLine).
 */

import { LINE_OPACITY } from '@/lib/threading-constants'
import { ThreadLine } from './thread-line'

export interface AncestorInfo {
  uri: string
  authorName: string
  replyCount: number
  expanded: boolean
}

interface AncestorLinesProps {
  /** Ancestors ordered from outermost (index 0) to innermost (last index). */
  ancestors: AncestorInfo[]
  onToggle: (uri: string) => void
  showChevron: boolean
  /** Width per line in pixels. Should match indent step. */
  lineWidth: number
}

export function AncestorLines({ ancestors, onToggle, lineWidth }: AncestorLinesProps) {
  if (ancestors.length === 0) return null

  return (
    <>
      {ancestors.map((ancestor, index) => {
        const distanceFromRight = ancestors.length - 1 - index
        const opacity = LINE_OPACITY[distanceFromRight] ?? LINE_OPACITY[LINE_OPACITY.length - 1]!

        return (
          <ThreadLine
            key={ancestor.uri}
            expanded={ancestor.expanded}
            onToggle={() => onToggle(ancestor.uri)}
            authorName={ancestor.authorName}
            replyCount={ancestor.replyCount}
            ancestorUri={ancestor.uri}
            opacity={opacity}
            showChevron={false}
            width={lineWidth}
          />
        )
      })}
    </>
  )
}
