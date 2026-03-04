/**
 * TopicForm - Complete topic creation/edit form.
 * Title, category, tags, markdown editor with preview, cross-post options.
 * Client-side validation matching API Zod schemas.
 * @see specs/prd-web.md Section 4 (Editor Components)
 */

'use client'

import { useState, useCallback } from 'react'
import type { CreateTopicInput, CategoryTreeNode } from '@/lib/api/types'
import { cn } from '@/lib/utils'
import { TopicMetaFields } from '@/components/topic-meta-fields'
import { TopicContentEditor } from '@/components/topic-content-editor'
import { TopicCrossPostSection } from '@/components/topic-cross-post-section'
import { CrossPostAuthDialog } from '@/components/crosspost-auth-dialog'
import { validateTopicForm } from '@/components/topic-form-validation'
import type { TopicFormValues, FormErrors } from '@/components/topic-form-validation'
import { useAuth } from '@/hooks/use-auth'

interface TopicFormProps {
  onSubmit: (values: CreateTopicInput) => void | Promise<void>
  initialValues?: Partial<TopicFormValues>
  mode?: 'create' | 'edit'
  categories?: CategoryTreeNode[]
  submitting?: boolean
  className?: string
}

const CATEGORIES_FALLBACK: CategoryTreeNode[] = [
  {
    id: 'fallback-general',
    slug: 'general',
    name: 'General Discussion',
    description: null,
    parentId: null,
    sortOrder: 0,
    communityDid: '',
    maturityRating: 'safe',
    createdAt: '',
    updatedAt: '',
    children: [],
  },
]

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
      const validationErrors = validateTopicForm(values)
      setErrors(validationErrors)
      if (Object.keys(validationErrors).length > 0) return
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
      <TopicMetaFields
        title={title}
        category={category}
        tagInput={tagInput}
        categories={categories}
        errors={errors}
        onTitleChange={setTitle}
        onCategoryChange={setCategory}
        onTagInputChange={setTagInput}
      />

      <TopicContentEditor content={content} onChange={setContent} error={errors.content} required />

      {mode === 'create' && (
        <TopicCrossPostSection
          crossPostScopesGranted={crossPostScopesGranted}
          crossPostBluesky={crossPostBluesky}
          crossPostFrontpage={crossPostFrontpage}
          onCrossPostBlueskyChange={setCrossPostBluesky}
          onCrossPostFrontpageChange={setCrossPostFrontpage}
          onAuthorizeClick={() => setShowCrossPostAuthDialog(true)}
        />
      )}

      <CrossPostAuthDialog
        open={showCrossPostAuthDialog}
        onAuthorize={() => {
          setShowCrossPostAuthDialog(false)
          void requestCrossPostAuth()
        }}
        onCancel={() => setShowCrossPostAuthDialog(false)}
      />

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
