/**
 * ProfileSkeleton - Loading skeleton for the user profile page.
 */

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-4 py-8">
      <div className="h-48 rounded-t-lg bg-muted" />
      <div className="flex items-start gap-4 p-6">
        <div className="h-16 w-16 rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="h-4 w-48 rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
