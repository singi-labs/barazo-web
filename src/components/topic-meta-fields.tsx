/**
 * TopicMetaFields - Title, category, and tags inputs for topic form.
 * @see specs/prd-web.md Section 4 (Editor Components)
 */

import { cn } from '@/lib/utils'
import { FormLabel } from '@/components/ui/form-label'

interface TopicMetaFieldsProps {
  title: string
  category: string
  tagInput: string
  categories: Array<{ slug: string; name: string }>
  errors: { title?: string; category?: string }
  onTitleChange: (title: string) => void
  onCategoryChange: (category: string) => void
  onTagInputChange: (tags: string) => void
}

export function TopicMetaFields({
  title,
  category,
  tagInput,
  categories,
  errors,
  onTitleChange,
  onCategoryChange,
  onTagInputChange,
}: TopicMetaFieldsProps) {
  return (
    <>
      <div className="space-y-1">
        <FormLabel htmlFor="topic-title" required>
          Title
        </FormLabel>
        <input
          id="topic-title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter a descriptive title"
          required
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

      <div className="space-y-1">
        <FormLabel htmlFor="topic-category" required>
          Category
        </FormLabel>
        <select
          id="topic-category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          required
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

      <div className="space-y-1">
        <FormLabel htmlFor="topic-tags" optional>
          Tags
        </FormLabel>
        <input
          id="topic-tags"
          type="text"
          value={tagInput}
          onChange={(e) => onTagInputChange(e.target.value)}
          placeholder="Comma-separated tags (e.g., discussion, help)"
          className={cn(
            'block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        />
      </div>
    </>
  )
}
