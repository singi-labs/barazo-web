/**
 * Admin route layout.
 * Gates all /admin/* pages on authentication + admin role.
 * Shows loading skeleton while auth state initializes,
 * redirects non-admin users to the homepage.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?returnTo=${encodeURIComponent('/admin')}`)
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role !== 'admin') {
      router.replace('/')
    }
  }, [isLoading, isAuthenticated, user?.role, router])

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 p-6" role="status" aria-label="Loading admin panel">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-32 rounded bg-muted" />
        <span className="sr-only">Loading admin panel</span>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return <>{children}</>
}
