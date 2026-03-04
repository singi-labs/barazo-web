/**
 * CategoryForm - Edit/create form for a category with maturity rating.
 * @see specs/prd-web.md Section M11
 */

import type { CategoryTreeNode, MaturityRating } from '@/lib/api/types'
import { SaveButton } from '@/components/admin/save-button'
import { FormLabel } from '@/components/ui/form-label'
import { flattenCategoryTree } from '@/lib/flatten-category-tree'
import type { SaveStatus } from '@/hooks/use-save-state'

export interface EditingCategory {
  id: string | null
  name: string
  slug: string
  description: string
  parentId: string | null
  maturityRating: MaturityRating
}

interface CategoryFormProps {
  editing: EditingCategory
  categories: CategoryTreeNode[]
  onChange: (cat: EditingCategory) => void
  onSave: () => void
  onCancel: () => void
  saveStatus: SaveStatus
}

export function CategoryForm({
  editing,
  categories,
  onChange,
  onSave,
  onCancel,
  saveStatus,
}: CategoryFormProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        {editing.id ? 'Edit Category' : 'New Category'}
      </h2>
      <div className="space-y-4">
        <div>
          <FormLabel htmlFor="cat-name" required>
            Category Name
          </FormLabel>
          <input
            id="cat-name"
            type="text"
            value={editing.name}
            onChange={(e) => onChange({ ...editing, name: e.target.value })}
            required
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        <div>
          <FormLabel htmlFor="cat-slug" required>
            Slug
          </FormLabel>
          <input
            id="cat-slug"
            type="text"
            value={editing.slug}
            onChange={(e) => onChange({ ...editing, slug: e.target.value })}
            required
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        <div>
          <FormLabel htmlFor="cat-desc" optional>
            Description
          </FormLabel>
          <textarea
            id="cat-desc"
            value={editing.description}
            onChange={(e) => onChange({ ...editing, description: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        <div>
          <FormLabel htmlFor="cat-parent" optional>
            Parent Category
          </FormLabel>
          <select
            id="cat-parent"
            value={editing.parentId ?? ''}
            onChange={(e) => onChange({ ...editing, parentId: e.target.value || null })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">None (top level)</option>
            {flattenCategoryTree(categories, {
              excludeId: editing.id ?? undefined,
            }).map(({ category: cat, depth }) => (
              <option key={cat.id} value={cat.id}>
                {'\u00A0'.repeat(depth * 3)}
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FormLabel htmlFor="cat-maturity" required>
            Maturity Rating
          </FormLabel>
          <select
            id="cat-maturity"
            value={editing.maturityRating}
            onChange={(e) =>
              onChange({ ...editing, maturityRating: e.target.value as MaturityRating })
            }
            required
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="safe">Safe</option>
            <option value="mature">Mature</option>
            <option value="adult">Adult</option>
          </select>
        </div>
        <div className="flex gap-2">
          <SaveButton status={saveStatus} onClick={onSave} className="px-3 py-1.5" />
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
