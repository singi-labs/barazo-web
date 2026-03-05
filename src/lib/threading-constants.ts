export const MAX_REPLY_DEPTH_DEFAULT = 9999

export const VISUAL_INDENT_CAP = 10

export const INDENT_STEP = { desktop: 22, tablet: 16, mobile: 8 } as const

export const DEFAULT_EXPANDED_LEVELS = 3

export const AUTO_COLLAPSE_SIBLING_THRESHOLD = 5

export const AUTO_COLLAPSE_SHOW_COUNT = 3

/**
 * Opacity values for ancestor thread lines.
 * Index 0 = direct parent (rightmost line), higher indices = further ancestors.
 */
export const LINE_OPACITY = [1, 0.7, 0.5, 0.35, 0.25, 0.2, 0.15, 0.1, 0.1, 0.1] as const
