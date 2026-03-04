/**
 * 404 page for public pages.
 * Displayed when a page slug does not match any published page.
 */

import { ForumLayout } from '@/components/layout/forum-layout'

export default function PageNotFound() {
  return (
    <ForumLayout>
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          The page you are looking for does not exist or has been removed.
        </p>
      </div>
    </ForumLayout>
  )
}
