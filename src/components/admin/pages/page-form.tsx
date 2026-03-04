/**
 * PageForm - Edit/create form for a static page.
 * Extracted from the admin page editor to keep components under ~150 lines.
 * @see specs/prd-web.md Section M12
 */

import { TopicContentEditor } from '@/components/topic-content-editor'
import type { PageStatus, PageTreeNode } from '@/lib/api/types'

export interface PageFormProps {
  title: string
  slug: string
  content: string
  status: PageStatus
  parentId: string | null
  metaDescription: string
  isEditMode: boolean
  availableParents: PageTreeNode[]
  onTitleChange: (title: string) => void
  onSlugChange: (slug: string) => void
  onContentChange: (content: string) => void
  onStatusChange: (status: PageStatus) => void
  onParentIdChange: (parentId: string | null) => void
  onMetaDescriptionChange: (metaDescription: string) => void
  onSave: () => void
  onCancel: () => void
  onDelete?: () => void
  saving: boolean
}

export function PageForm({
  title,
  slug,
  content,
  status,
  parentId,
  metaDescription,
  isEditMode,
  availableParents,
  onTitleChange,
  onSlugChange,
  onContentChange,
  onStatusChange,
  onParentIdChange,
  onMetaDescriptionChange,
  onSave,
  onCancel,
  onDelete,
  saving,
}: PageFormProps) {
  return (
    <>
      <div className="space-y-4">
        <div>
          <label htmlFor="page-title" className="block text-sm font-medium text-foreground">
            Title
          </label>
          <input
            id="page-title"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Page title"
          />
        </div>

        <div>
          <label htmlFor="page-slug" className="block text-sm font-medium text-foreground">
            Slug
          </label>
          <input
            id="page-slug"
            type="text"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="url-slug"
          />
        </div>

        <div>
          <label htmlFor="page-status" className="block text-sm font-medium text-foreground">
            Status
          </label>
          <select
            id="page-status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value as PageStatus)}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div>
          <label htmlFor="page-parent" className="block text-sm font-medium text-foreground">
            Parent Page
          </label>
          <select
            id="page-parent"
            value={parentId ?? ''}
            onChange={(e) => onParentIdChange(e.target.value || null)}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">None (top-level)</option>
            {availableParents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="page-meta-description"
            className="block text-sm font-medium text-foreground"
          >
            Meta Description
          </label>
          <textarea
            id="page-meta-description"
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            maxLength={320}
            rows={2}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Brief description for search engines"
          />
          <p className="mt-1 text-xs text-muted-foreground">{metaDescription.length}/320</p>
        </div>

        <TopicContentEditor content={content} onChange={onContentChange} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Cancel
        </button>
        {isEditMode && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="ml-auto rounded-md border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            Delete
          </button>
        )}
      </div>
    </>
  )
}
