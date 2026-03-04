/**
 * Admin pages list page.
 * URL: /admin/pages
 * Page tree with status badges and CRUD controls.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from '@phosphor-icons/react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import { PageRow } from '@/components/admin/pages/page-row'
import { getAdminPages, deletePage } from '@/lib/api/client'
import type { PageTreeNode } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

export default function AdminPagesPage() {
  const router = useRouter()
  const { getAccessToken } = useAuth()
  const { toast } = useToast()
  const [pages, setPages] = useState<PageTreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchPages = useCallback(async () => {
    setLoadError(null)
    try {
      const response = await getAdminPages(getAccessToken() ?? '')
      setPages(response.pages)
    } catch {
      setLoadError('Failed to load pages. The API may be unreachable.')
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    void fetchPages()
  }, [fetchPages])

  const handleDelete = async (id: string) => {
    setActionError(null)
    const confirmed = window.confirm('Are you sure you want to delete this page?')
    if (!confirmed) return

    try {
      await deletePage(id, getAccessToken() ?? '')
      void fetchPages()
      toast({ title: 'Page deleted' })
    } catch {
      setActionError('Failed to delete page. Please try again.')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Pages</h1>
          <button
            type="button"
            onClick={() => router.push('/admin/pages/new')}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={16} aria-hidden="true" />
            Add Page
          </button>
        </div>

        {actionError && <ErrorAlert message={actionError} onDismiss={() => setActionError(null)} />}

        {loadError && (
          <ErrorAlert message={loadError} variant="page" onRetry={() => void fetchPages()} />
        )}

        {loading && <p className="text-sm text-muted-foreground">Loading pages...</p>}

        {!loading && pages.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            No pages yet. Create your first page for static content like About, Privacy Policy, or
            Terms of Service.
          </p>
        )}

        {!loading && pages.length > 0 && (
          <div className="space-y-2">
            {pages.map((page) => (
              <PageRow
                key={page.id}
                page={page}
                depth={0}
                onDelete={(id) => void handleDelete(id)}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
