/**
 * Admin page editor - Create or edit a static page.
 * URL: /admin/pages/new (create) or /admin/pages/{id} (edit)
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import { PageForm } from '@/components/admin/pages/page-form'
import { generateSlug } from '@/components/admin/pages/slug-generator'
import {
  getAdminPage,
  getAdminPages,
  createPage,
  updatePage,
  deletePage,
} from '@/lib/api/client'
import type { PageStatus, PageTreeNode } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

interface PageFormState {
  title: string
  slug: string
  status: PageStatus
  parentId: string | null
  metaDescription: string
  content: string
}

const INITIAL_FORM: PageFormState = {
  title: '',
  slug: '',
  status: 'draft',
  parentId: null,
  metaDescription: '',
  content: '',
}

export default function AdminPageEditorPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const isCreateMode = id === 'new'

  const { getAccessToken } = useAuth()
  const { toast } = useToast()

  const [form, setForm] = useState<PageFormState>(INITIAL_FORM)
  const [availablePages, setAvailablePages] = useState<PageTreeNode[]>([])
  const [loading, setLoading] = useState(!isCreateMode)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const flattenPages = useCallback(
    (nodes: PageTreeNode[], result: PageTreeNode[] = []): PageTreeNode[] => {
      for (const node of nodes) {
        if (node.id !== id) {
          result.push(node)
          flattenPages(node.children, result)
        }
        // Skip descendants of the current page entirely
      }
      return result
    },
    [id]
  )

  useEffect(() => {
    const loadData = async () => {
      const token = getAccessToken() ?? ''
      try {
        const pagesResponse = await getAdminPages(token)
        setAvailablePages(flattenPages(pagesResponse.pages))

        if (!isCreateMode) {
          const page = await getAdminPage(id, token)
          setForm({
            title: page.title,
            slug: page.slug,
            status: page.status,
            parentId: page.parentId,
            metaDescription: page.metaDescription ?? '',
            content: page.content,
          })
        }
      } catch {
        setError('Failed to load page data.')
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [id, isCreateMode, getAccessToken, flattenPages])

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      ...(isCreateMode ? { slug: generateSlug(value) } : {}),
    }))
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      setError('Title and slug are required.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const token = getAccessToken() ?? ''
      const input = {
        title: form.title,
        slug: form.slug,
        content: form.content,
        status: form.status,
        metaDescription: form.metaDescription || null,
        parentId: form.parentId,
      }

      if (isCreateMode) {
        await createPage(input, token)
        toast({ title: 'Page created' })
      } else {
        await updatePage(id, input, token)
        toast({ title: 'Page updated' })
      }
      router.push('/admin/pages')
    } catch {
      setError('Failed to save page. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this page?')
    if (!confirmed) return

    try {
      await deletePage(id, getAccessToken() ?? '')
      toast({ title: 'Page deleted' })
      router.push('/admin/pages')
    } catch {
      setError('Failed to delete page. Please try again.')
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-sm text-muted-foreground">Loading page...</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-foreground">
          {isCreateMode ? 'Create Page' : 'Edit Page'}
        </h1>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        <PageForm
          title={form.title}
          slug={form.slug}
          content={form.content}
          status={form.status}
          parentId={form.parentId}
          metaDescription={form.metaDescription}
          isEditMode={!isCreateMode}
          availableParents={availablePages}
          onTitleChange={handleTitleChange}
          onSlugChange={(slug) => setForm((prev) => ({ ...prev, slug }))}
          onContentChange={(content) => setForm((prev) => ({ ...prev, content }))}
          onStatusChange={(status) => setForm((prev) => ({ ...prev, status }))}
          onParentIdChange={(parentId) => setForm((prev) => ({ ...prev, parentId }))}
          onMetaDescriptionChange={(metaDescription) =>
            setForm((prev) => ({ ...prev, metaDescription }))
          }
          onSave={() => void handleSave()}
          onCancel={() => router.push('/admin/pages')}
          onDelete={() => void handleDelete()}
          saving={saving}
        />
      </div>
    </AdminLayout>
  )
}
