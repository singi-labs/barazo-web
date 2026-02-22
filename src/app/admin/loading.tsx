/**
 * Admin loading state -- shown during admin route transitions.
 * Matches the admin dashboard layout with stat card skeletons.
 */

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* Page title skeleton */}
      <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />

      {/* Stat cards skeleton */}
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        role="status"
        aria-label="Loading admin dashboard"
      >
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
            </div>
            <div className="mt-3 h-7 w-16 animate-pulse rounded-md bg-muted" />
            <div className="mt-1 h-4 w-24 animate-pulse rounded-md bg-muted" />
          </div>
        ))}
        <span className="sr-only">Loading admin dashboard</span>
      </div>
    </div>
  )
}
