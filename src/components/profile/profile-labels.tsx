import { ShieldCheck, ShieldWarning } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface ProfileLabelsProps {
  labels: Array<{
    val: string
    src: string
    isSelfLabel: boolean
  }>
}

const WARNING_LABELS = new Set([
  '!warn',
  '!hide',
  '!no-unauthenticated',
  'porn',
  'sexual',
  'nudity',
  'gore',
  'impersonation',
])

function isWarningLabel(val: string): boolean {
  return val.startsWith('!') || WARNING_LABELS.has(val)
}

export function ProfileLabels({ labels }: ProfileLabelsProps) {
  if (labels.length === 0) {
    return null
  }

  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {labels.map((label) => {
        const isWarning = isWarningLabel(label.val)
        const displayText = label.val.startsWith('!') ? label.val.slice(1) : label.val

        let pillClasses: string
        let icon: React.ReactNode = null

        if (label.isSelfLabel) {
          pillClasses = isWarning
            ? 'bg-[var(--orange-3)] text-[var(--orange-11)]'
            : 'bg-muted text-muted-foreground'
        } else {
          pillClasses = isWarning
            ? 'bg-[var(--red-3)] text-[var(--red-11)]'
            : 'bg-[var(--purple-3)] text-[var(--purple-11)]'
          icon = isWarning ? (
            <ShieldWarning size={12} aria-hidden="true" />
          ) : (
            <ShieldCheck size={12} aria-hidden="true" />
          )
        }

        return (
          <span
            key={`${label.src}-${label.val}`}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              pillClasses
            )}
          >
            {icon}
            {displayText}
          </span>
        )
      })}
    </div>
  )
}
