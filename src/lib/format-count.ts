/**
 * Abbreviates large numbers for display (e.g., 1500 -> "1.5K").
 * Full number should be shown via title attribute for accessibility.
 */
export function formatCount(n: number): string {
  if (n < 1000) return n.toString()
  if (n < 1_000_000) {
    const k = n / 1000
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`
  }
  const m = n / 1_000_000
  return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`
}
