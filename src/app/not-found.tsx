/**
 * Custom 404 page -- shown when a route is not matched or notFound() is called.
 * Server component for SEO (renders to static HTML).
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { MagnifyingGlass, House } from '@phosphor-icons/react/dist/ssr'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <main className="w-full max-w-md text-center">
        <p className="mb-2 text-5xl font-bold text-muted-foreground" aria-hidden="true">
          404
        </p>
        <h1 className="mb-2 text-xl font-bold text-foreground">Page not found</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <House size={16} aria-hidden="true" />
            Go home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <MagnifyingGlass size={16} aria-hidden="true" />
            Search
          </Link>
        </div>
      </main>
    </div>
  )
}
