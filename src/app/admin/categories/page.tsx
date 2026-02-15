/**
 * Admin categories page.
 * URL: /admin/categories
 * Category tree editor with maturity rating per category.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { PencilSimple, Plus, TrashSimple } from '@phosphor-icons/react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import type { CategoryTreeNode, MaturityRating } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

const MATURITY_LABELS: Record<MaturityRating, string> = {
  safe: 'Safe',
  mature: 'Mature',
  adult: 'Adult',
}

const MATURITY_COLORS: Record<MaturityRating, string> = {
  safe: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  mature: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  adult: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

interface EditingCategory {
  id: string | null
  name: string
  slug: string
  description: string
  parentId: string | null
  maturityRating: MaturityRating
}

function CategoryRow({
  category,
  depth,
  onEdit,
  onDelete,
}: {
  category: CategoryTreeNode
  depth: number
  onEdit: (cat: CategoryTreeNode) => void
  onDelete: (id: string) => void
}) {
  return (
    <>
      <div
        data-depth={depth}
        className={cn(
          'flex items-center justify-between rounded-md border border-border bg-card p-3',
          depth > 0 && 'ml-6'
        )}
      >
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">{category.name}</p>
            {category.description && (
              <p className="text-xs text-muted-foreground">{category.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              MATURITY_COLORS[category.maturityRating]
            )}
          >
            {MATURITY_LABELS[category.maturityRating]}
          </span>
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Edit ${category.name}`}
          >
            <PencilSimple size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(category.id)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${category.name}`}
          >
            <TrashSimple size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      {category.children.map((child) => (
        <CategoryRow
          key={child.id}
          category={child}
          depth={depth + 1}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  )
}

export default function AdminCategoriesPage() {
  const { getAccessToken } = useAuth()
  const [categories, setCategories] = useState<CategoryTreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<EditingCategory | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategories()
      setCategories(response.categories)
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchCategories()
  }, [fetchCategories])

  const handleEdit = (cat: CategoryTreeNode) => {
    setEditing({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
      parentId: cat.parentId,
      maturityRating: cat.maturityRating,
    })
  }

  const handleAdd = () => {
    setEditing({
      id: null,
      name: '',
      slug: '',
      description: '',
      parentId: null,
      maturityRating: 'safe',
    })
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id, getAccessToken() ?? '')
      void fetchCategories()
    } catch {
      // Silently handle
    }
  }

  const handleSave = async () => {
    if (!editing) return

    try {
      if (editing.id) {
        await updateCategory(
          editing.id,
          {
            name: editing.name,
            slug: editing.slug,
            description: editing.description || null,
            parentId: editing.parentId,
            maturityRating: editing.maturityRating,
          },
          getAccessToken() ?? ''
        )
      } else {
        await createCategory(
          {
            name: editing.name,
            slug: editing.slug,
            description: editing.description || null,
            parentId: editing.parentId,
            sortOrder: categories.length,
            maturityRating: editing.maturityRating,
          },
          getAccessToken() ?? ''
        )
      }
      setEditing(null)
      void fetchCategories()
    } catch {
      // Silently handle
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={16} aria-hidden="true" />
            Add Category
          </button>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {editing.id ? 'Edit Category' : 'New Category'}
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="cat-name" className="block text-sm font-medium text-foreground">
                  Category Name
                </label>
                <input
                  id="cat-name"
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label htmlFor="cat-slug" className="block text-sm font-medium text-foreground">
                  Slug
                </label>
                <input
                  id="cat-slug"
                  type="text"
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label htmlFor="cat-desc" className="block text-sm font-medium text-foreground">
                  Description
                </label>
                <textarea
                  id="cat-desc"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label htmlFor="cat-maturity" className="block text-sm font-medium text-foreground">
                  Maturity Rating
                </label>
                <select
                  id="cat-maturity"
                  value={editing.maturityRating}
                  onChange={(e) =>
                    setEditing({ ...editing, maturityRating: e.target.value as MaturityRating })
                  }
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="safe">Safe</option>
                  <option value="mature">Mature</option>
                  <option value="adult">Adult</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category list */}
        {loading && <p className="text-sm text-muted-foreground">Loading categories...</p>}

        {!loading && categories.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            No categories yet. Create your first category to organize topics.
          </p>
        )}

        {!loading && categories.length > 0 && (
          <div className="space-y-2">
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                depth={0}
                onEdit={handleEdit}
                onDelete={(id) => void handleDelete(id)}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
