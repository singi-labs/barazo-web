/**
 * Admin categories page.
 * URL: /admin/categories
 * Category tree editor with maturity rating per category.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from '@phosphor-icons/react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import { CategoryRow } from '@/components/admin/categories/category-row'
import { CategoryForm } from '@/components/admin/categories/category-form'
import type { EditingCategory } from '@/components/admin/categories/category-form'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api/client'
import type { CategoryTreeNode } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'
import { useSaveState } from '@/hooks/use-save-state'

export default function AdminCategoriesPage() {
  const { getAccessToken } = useAuth()
  const saveMachine = useSaveState()
  const [categories, setCategories] = useState<CategoryTreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<EditingCategory | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoadError(null)
    try {
      const response = await getCategories()
      setCategories(response.categories)
    } catch {
      setLoadError('Failed to load categories. The API may be unreachable.')
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
    setActionError(null)
    try {
      await deleteCategory(id, getAccessToken() ?? '')
      void fetchCategories()
    } catch {
      setActionError('Failed to delete category. Please try again.')
    }
  }

  const handleSave = async () => {
    if (!editing) return
    saveMachine.startSaving()
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
      saveMachine.reset()
    } catch {
      saveMachine.reset()
      setActionError('Failed to save category. Please try again.')
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

        {actionError && <ErrorAlert message={actionError} onDismiss={() => setActionError(null)} />}

        {editing && (
          <CategoryForm
            editing={editing}
            categories={categories}
            onChange={setEditing}
            onSave={() => void handleSave()}
            onCancel={() => setEditing(null)}
            saveStatus={saveMachine.status}
          />
        )}

        {loadError && (
          <ErrorAlert message={loadError} variant="page" onRetry={() => void fetchCategories()} />
        )}

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
