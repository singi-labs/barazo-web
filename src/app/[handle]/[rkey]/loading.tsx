/**
 * Thread loading state -- shown while a topic and its replies are loading.
 * Matches the topic view layout with skeleton placeholders.
 */

export default function ThreadLoading() {
  return (
    <div className="container py-6" role="status" aria-label="Loading topic">
      {/* Breadcrumb skeleton */}
      <div className="mb-4 flex items-center gap-2">
        <div className="h-3 w-12 animate-pulse rounded-md bg-muted" />
        <div className="h-3 w-3 animate-pulse rounded-md bg-muted" />
        <div className="h-3 w-20 animate-pulse rounded-md bg-muted" />
        <div className="h-3 w-3 animate-pulse rounded-md bg-muted" />
        <div className="h-3 w-40 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Topic skeleton */}
      <div className="mt-4 rounded-lg border border-border bg-card p-6">
        {/* Title */}
        <div className="h-7 w-3/4 animate-pulse rounded-md bg-muted" />
        {/* Author + date */}
        <div className="mt-3 flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
          <div className="h-3 w-20 animate-pulse rounded-md bg-muted" />
        </div>
        {/* Content lines */}
        <div className="mt-6 space-y-2">
          <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
        </div>
      </div>

      {/* Replies skeleton */}
      <div className="mt-8 space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded-md bg-muted" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-4/5 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading topic and replies</span>
    </div>
  )
}
