/**
 * StatusBadge - Colored badge for status strings used across admin sybil views.
 * @see specs/prd-web.md Section P2.10
 */

import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  flagged: 'bg-destructive/10 text-destructive',
  monitoring: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  dismissed: 'bg-muted text-muted-foreground',
  banned: 'bg-destructive text-destructive-foreground',
  pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  action_taken: 'bg-green-500/10 text-green-700 dark:text-green-400',
}

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
        STATUS_COLORS[status] ?? 'bg-muted text-muted-foreground'
      )}
    >
      {status}
    </span>
  )
}
