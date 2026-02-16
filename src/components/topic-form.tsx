/**
 * TopicForm - Complete topic creation/edit form.
 * Title, category, tags, markdown editor with preview, cross-post options.
 * Client-side validation matching API Zod schemas.
 * @see specs/prd-web.md Section 4 (Editor Components)
 */

'use client'

import { useState, useCallback } from 'react'
import type { CreateTopicInput } from '@/lib/api/types'
import { cn } from '@/lib/utils'
import { MarkdownEditor } from './markdown-editor'
import { MarkdownPreview } from './markdown-preview'
import { CrossPostAuthDialog } from './crosspost-auth-dialog'
import { useAuth } from '@/hooks/use-auth'

interface TopicFormValues {
  title: string
  content: string
  category: string
  tags?: string[]
  crossPostBluesky?: boolean
  crossPostFrontpage?: boolean
}

interface FormErrors {
  title?: string
  content?: string
  category?: string
}

interface TopicFormProps {
  onSubmit: (values: CreateTopicInput) => void | Promise<void>
  initialValues?: Partial<TopicFormValues>
  mode?: 'create' | 'edit'
  categories?: Array<{ slug: string; name: string }>
  submitting?: boolean
  className?: string
}

const CATEGORIES_FALLBACK = [
  { slug: 'general', name: 'General Discussion' },
  { slug: 'development', name: 'Development' },
  { slug: 'frontend', name: 'Frontend' },
  { slug: 'backend', name: 'Backend' },
  { slug: 'feedback', name: 'Feedback & Ideas' },
  { slug: 'meta', name: 'Meta' },
]

function validate(values: TopicFormValues): FormErrors {
  const errors: FormErrors = {}

  if (!values.title.trim()) {
    errors.title = 'Title is required'
  } else if (values.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters'
  } else if (values.title.trim().length > 200) {
    errors.title = 'Title must be at most 200 characters'
  }

  if (!values.content.trim()) {
    errors.content = 'Content is required'
  } else if (values.content.trim().length < 10) {
    errors.content = 'Content must be at least 10 characters'
  }

  if (!values.category) {
    errors.category = 'Category is required'
  }

  return errors
}

export function TopicForm({
  onSubmit,
  initialValues,
  mode = 'create',
  categories = CATEGORIES_FALLBACK,
  submitting = false,
  className,
}: TopicFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [content, setContent] = useState(initialValues?.content ?? '')
  const [category, setCategory] = useState(initialValues?.category ?? '')
  const [tagInput, setTagInput] = useState(initialValues?.tags?.join(', ') ?? '')
  const [crossPostBluesky, setCrossPostBluesky] = useState(initialValues?.crossPostBluesky ?? true)
  const [crossPostFrontpage, setCrossPostFrontpage] = useState(
    initialValues?.crossPostFrontpage ?? false
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const [showCrossPostAuthDialog, setShowCrossPostAuthDialog] = useState(false)
  const { crossPostScopesGranted, requestCrossPostAuth } = useAuth()

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      const values: TopicFormValues = {
        title,
        content,
        category,
        tags: tagInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        crossPostBluesky,
        crossPostFrontpage,
      }

      const validationErrors = validate(values)
      setErrors(validationErrors)

      if (Object.keys(validationErrors).length > 0) {
        return
      }

      onSubmit({
        title: values.title.trim(),
        content: values.content.trim(),
        category: values.category,
        tags: values.tags?.length ? values.tags : undefined,
        crossPostBluesky: values.crossPostBluesky,
        crossPostFrontpage: values.crossPostFrontpage,
      })
    },
    [title, content, category, tagInput, crossPostBluesky, crossPostFrontpage, onSubmit]
  )

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
      noValidate
      aria-label={mode === 'create' ? 'Create new topic' : 'Edit topic'}
    >
      {/* Title */}
      <div className="space-y-1">
        <label htmlFor="topic-title" className="block text-sm font-medium text-foreground">
          Title
        </label>
        <input
          id="topic-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a descriptive title"
          aria-invalid={errors.title ? 'true' : undefined}
          aria-describedby={errors.title ? 'topic-title-error' : undefined}
          className={cn(
            'block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            errors.title && 'border-destructive'
          )}
        />
        {errors.title && (
          <p id="topic-title-error" className="text-sm text-destructive" role="alert">
            {errors.title}
          </p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-1">
        <label htmlFor="topic-category" className="block text-sm font-medium text-foreground">
          Category
        </label>
        <select
          id="topic-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-invalid={errors.category ? 'true' : undefined}
          aria-describedby={errors.category ? 'topic-category-error' : undefined}
          className={cn(
            'block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            errors.category && 'border-destructive'
          )}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category && (
          <p id="topic-category-error" className="text-sm text-destructive" role="alert">
            {errors.category}
          </p>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-1">
        <label htmlFor="topic-tags" className="block text-sm font-medium text-foreground">
          Tags
        </label>
        <input
          id="topic-tags"
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="Comma-separated tags (e.g., discussion, help)"
          className={cn(
            'block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        />
      </div>

      {/* Content - Write/Preview tabs */}
      <div className="space-y-1">
        <div role="tablist" aria-label="Editor mode" className="flex gap-1 border-b border-border">
          <button
            type="button"
            role="tab"
            id="tab-write"
            aria-selected={activeTab === 'write'}
            aria-controls="tabpanel-write"
            onClick={() => setActiveTab('write')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium transition-colors',
              activeTab === 'write'
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Write
          </button>
          <button
            type="button"
            role="tab"
            id="tab-preview"
            aria-selected={activeTab === 'preview'}
            aria-controls="tabpanel-preview"
            onClick={() => setActiveTab('preview')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium transition-colors',
              activeTab === 'preview'
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Preview
          </button>
        </div>

        <div
          id="tabpanel-write"
          role="tabpanel"
          aria-labelledby="tab-write"
          hidden={activeTab !== 'write'}
        >
          <MarkdownEditor
            value={content}
            onChange={setContent}
            id="topic-content"
            label="Content"
            error={errors.content}
          />
        </div>

        <div
          id="tabpanel-preview"
          role="tabpanel"
          aria-labelledby="tab-preview"
          hidden={activeTab !== 'preview'}
        >
          <MarkdownPreview content={content} />
        </div>
      </div>

      {/* Cross-post options */}
      {mode === 'create' && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">Cross-post</legend>
          {crossPostScopesGranted ? (
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={crossPostBluesky}
                  onChange={(e) => setCrossPostBluesky(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
                />
                <span className="text-sm text-foreground">Share on Bluesky</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={crossPostFrontpage}
                  onChange={(e) => setCrossPostFrontpage(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
                />
                <span className="text-sm text-foreground">Share on Frontpage</span>
              </label>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Cross-posting requires additional permissions.
              </p>
              <button
                type="button"
                onClick={() => setShowCrossPostAuthDialog(true)}
                className={cn(
                  'text-sm font-medium text-primary transition-colors',
                  'hover:text-primary-hover underline underline-offset-4',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                )}
              >
                Authorize cross-posting
              </button>
            </div>
          )}
        </fieldset>
      )}

      <CrossPostAuthDialog
        open={showCrossPostAuthDialog}
        onAuthorize={() => {
          setShowCrossPostAuthDialog(false)
          void requestCrossPostAuth()
        }}
        onCancel={() => setShowCrossPostAuthDialog(false)}
      />

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors',
            'hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          {submitting
            ? mode === 'create'
              ? 'Creating...'
              : 'Saving...'
            : mode === 'create'
              ? 'Create Topic'
              : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
