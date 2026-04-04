/**
 * NotificationsSection — per-community notification level selector.
 * Three levels: All notifications / Mentions only / None.
 * @see specs/prd-web.md Section M8
 */

'use client'

import type { NotificationLevel } from '@/lib/notification-level'

interface NotificationsSectionProps {
  notificationLevel: NotificationLevel
  onLevelChange: (level: NotificationLevel) => void
}

const LEVELS: { value: NotificationLevel; label: string; description: string }[] = [
  {
    value: 'all',
    label: 'All notifications',
    description: 'Replies, reactions, and mentions',
  },
  {
    value: 'mentions_only',
    label: 'Mentions only',
    description: 'Only when someone mentions your handle',
  },
  {
    value: 'none',
    label: 'None',
    description: 'No notifications from this community',
  },
]

export function NotificationsSection({
  notificationLevel,
  onLevelChange,
}: NotificationsSectionProps) {
  return (
    <fieldset className="space-y-4 rounded-lg border border-border p-4">
      <legend className="px-2 text-sm font-semibold text-foreground">Notifications</legend>
      <p className="text-sm text-muted-foreground">
        Notifications appear in your notification inbox on this forum. AT Protocol login does not
        provide an email address, so notifications are not sent via email.
      </p>
      <div className="space-y-3">
        {LEVELS.map(({ value, label, description }) => {
          const inputId = `notification-level-${value}`
          return (
            <div key={value} className="flex cursor-pointer items-start gap-3">
              <input
                id={inputId}
                type="radio"
                name="notification-level"
                value={value}
                checked={notificationLevel === value}
                onChange={() => onLevelChange(value)}
                className="mt-0.5 h-4 w-4 border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
              />
              <label htmlFor={inputId} className="flex cursor-pointer flex-col">
                <span className="text-sm font-medium text-foreground">{label}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </label>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}
