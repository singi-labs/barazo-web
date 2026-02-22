/**
 * SuspicionBar - Visual progress bar showing suspicion ratio with color coding.
 * @see specs/prd-web.md Section P2.10
 */

import { cn } from '@/lib/utils'

interface SuspicionBarProps {
  ratio: number
}

export function SuspicionBar({ ratio }: SuspicionBarProps) {
  const percent = Math.round(ratio * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div
          className={cn(
            'h-full rounded-full',
            percent >= 70 ? 'bg-destructive' : percent >= 40 ? 'bg-yellow-500' : 'bg-green-500'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{percent}%</span>
    </div>
  )
}
