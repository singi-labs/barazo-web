/**
 * Shared constants used across multiple components.
 */

/** Valid age bracket options for age declaration. */
export const AGE_OPTIONS = [
  { value: 0, label: 'Rather not say' },
  { value: 13, label: '13+' },
  { value: 14, label: '14+' },
  { value: 15, label: '15+' },
  { value: 16, label: '16+' },
  { value: 18, label: '18+' },
] as const
