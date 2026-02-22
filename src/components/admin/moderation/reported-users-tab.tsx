/**
 * ModerationReportedUsersTab - Users sorted by report count.
 * @see specs/prd-web.md Section M11
 */

import { Prohibit } from '@phosphor-icons/react'
import { formatDate } from '@/lib/format'
import type { ReportedUser } from '@/lib/api/types'

interface ModerationReportedUsersTabProps {
  users: ReportedUser[]
}

export function ModerationReportedUsersTab({ users }: ModerationReportedUsersTabProps) {
  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div key={user.did} className="rounded-md border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{user.handle}</p>
              <p className="text-xs text-muted-foreground">
                {user.reportCount} reports &middot; Latest: {formatDate(user.latestReportAt)}
              </p>
              {user.bannedFromOtherCommunities > 0 && (
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-destructive">
                  <Prohibit size={12} aria-hidden="true" />
                  Banned from {user.bannedFromOtherCommunities} other communities
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      {users.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">No reported users.</p>
      )}
    </div>
  )
}
