/**
 * Root loading state -- shown during route transitions.
 * Renders a skeleton that matches the forum layout structure.
 */

export default function RootLoading() {
  return (
    <div className="container py-6">
      {/* Heading skeleton */}
      <div className="mb-6 space-y-2">
        <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Topic list skeleton */}
      <div className="space-y-3" role="status" aria-label="Loading content">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              {/* Avatar placeholder */}
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="min-w-0 flex-1 space-y-2">
                {/* Title */}
                <div className="h-5 w-3/4 animate-pulse rounded-md bg-muted" />
                {/* Meta line */}
                <div className="h-3 w-1/2 animate-pulse rounded-md bg-muted" />
              </div>
              {/* Reply count */}
              <div className="h-6 w-12 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        ))}
        <span className="sr-only">Loading forum content</span>
      </div>
    </div>
  )
}
