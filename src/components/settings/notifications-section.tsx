/**
 * NotificationsSection - Notification preference toggles.
 * @see specs/prd-web.md Section M8
 */

'use client'

interface NotificationsSectionProps {
  notifyReplies: boolean
  notifyMentions: boolean
  notifyReactions: boolean
  onRepliesChange: (enabled: boolean) => void
  onMentionsChange: (enabled: boolean) => void
  onReactionsChange: (enabled: boolean) => void
}

export function NotificationsSection({
  notifyReplies,
  notifyMentions,
  notifyReactions,
  onRepliesChange,
  onMentionsChange,
  onReactionsChange,
}: NotificationsSectionProps) {
  return (
    <fieldset className="space-y-4 rounded-lg border border-border p-4">
      <legend className="px-2 text-sm font-semibold text-foreground">Notifications</legend>
      <p className="text-sm text-muted-foreground">
        Notifications appear in your notification inbox on this forum. AT Protocol login does not
        provide an email address, so notifications are not sent via email.
      </p>
      <div className="space-y-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={notifyReplies}
            onChange={(e) => onRepliesChange(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="text-sm text-foreground">Replies to my posts</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={notifyMentions}
            onChange={(e) => onMentionsChange(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="text-sm text-foreground">Mentions of my handle</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={notifyReactions}
            onChange={(e) => onReactionsChange(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="text-sm text-foreground">Reactions on my posts</span>
        </label>
      </div>
    </fieldset>
  )
}
