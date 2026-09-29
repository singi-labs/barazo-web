/**
 * Admin community rules management page.
 * URL: /admin/rules
 * CRUD for named, ordered rules with version history.
 */

'use client'
// Needs useState, useEffect, useCallback for data management and user interactions.

import { useState, useEffect, useCallback } from 'react'
import { Plus, ArrowUp, ArrowDown, Pencil, Trash, Clock } from '@phosphor-icons/react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import { SaveButton } from '@/components/admin/save-button'
import { useSaveState } from '@/hooks/use-save-state'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import {
  getCommunityRules,
  createCommunityRule,
  updateCommunityRule,
  deleteCommunityRule,
  reorderCommunityRules,
  getCommunitySettings,
} from '@/lib/api/client'
import type { CommunityRule } from '@/lib/api/types'
import { FormLabel } from '@/components/ui/form-label'

export default function AdminRulesPage() {
  const { getAccessToken } = useAuth()
  const { toast } = useToast()
  const [rules, setRules] = useState<CommunityRule[]>([])
  const [communityDid, setCommunityDid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Edit/create state
  const [editingRule, setEditingRule] = useState<CommunityRule | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const saveSt = useSaveState()

  // Reorder state
  const [hasReorderChanges, setHasReorderChanges] = useState(false)
  const reorderSaveSt = useSaveState()

  const fetchData = useCallback(async () => {
    setLoadError(null)
    try {
      const token = getAccessToken() ?? ''
      const settings = await getCommunitySettings(token)
      const did = settings.communityDid
      if (!did) {
        setLoadError('Community not initialized.')
        return
      }
      setCommunityDid(did)
      const response = await getCommunityRules(did)
      setRules(response.data)
    } catch {
      setLoadError('Failed to load rules. The API may be unreachable.')
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const handleCreate = async () => {
    if (!communityDid || !formTitle.trim() || !formDescription.trim()) return
    setActionError(null)
    saveSt.startSaving()
    try {
      await createCommunityRule(
        communityDid,
        {
          title: formTitle.trim(),
          description: formDescription.trim(),
        },
        getAccessToken() ?? ''
      )
      saveSt.onSaved()
      setIsCreating(false)
      setFormTitle('')
      setFormDescription('')
      toast({ title: 'Rule created' })
      void fetchData()
    } catch {
      saveSt.reset()
      setActionError('Failed to create rule.')
    }
  }

  const handleUpdate = async () => {
    if (!communityDid || !editingRule || !formTitle.trim() || !formDescription.trim()) return
    setActionError(null)
    saveSt.startSaving()
    try {
      await updateCommunityRule(
        communityDid,
        editingRule.id,
        {
          title: formTitle.trim(),
          description: formDescription.trim(),
        },
        getAccessToken() ?? ''
      )
      saveSt.onSaved()
      setEditingRule(null)
      setFormTitle('')
      setFormDescription('')
      toast({ title: 'Rule updated (new version created)' })
      void fetchData()
    } catch {
      saveSt.reset()
      setActionError('Failed to update rule.')
    }
  }

  const handleDelete = async (ruleId: number) => {
    if (!communityDid) return
    const confirmed = window.confirm(
      'Are you sure you want to archive this rule? Historical references will be preserved.'
    )
    if (!confirmed) return
    setActionError(null)
    try {
      await deleteCommunityRule(communityDid, ruleId, getAccessToken() ?? '')
      toast({ title: 'Rule archived' })
      void fetchData()
    } catch {
      setActionError('Failed to archive rule.')
    }
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const updated = [...rules]
    const prev = updated[index - 1]
    const curr = updated[index]
    if (!prev || !curr) return
    updated[index - 1] = curr
    updated[index] = prev
    setRules(updated)
    setHasReorderChanges(true)
  }

  const handleMoveDown = (index: number) => {
    if (index >= rules.length - 1) return
    const updated = [...rules]
    const next = updated[index + 1]
    const curr = updated[index]
    if (!next || !curr) return
    updated[index + 1] = curr
    updated[index] = next
    setRules(updated)
    setHasReorderChanges(true)
  }

  const handleSaveOrder = async () => {
    if (!communityDid) return
    reorderSaveSt.startSaving()
    try {
      await reorderCommunityRules(
        communityDid,
        {
          order: rules.map((rule, idx) => ({ id: rule.id, displayOrder: idx })),
        },
        getAccessToken() ?? ''
      )
      reorderSaveSt.onSaved()
      setHasReorderChanges(false)
      toast({ title: 'Rules reordered' })
    } catch {
      reorderSaveSt.reset()
      setActionError('Failed to save order.')
    }
  }

  const startEditing = (rule: CommunityRule) => {
    setEditingRule(rule)
    setIsCreating(false)
    setFormTitle(rule.title)
    setFormDescription(rule.description)
    saveSt.reset()
  }

  const startCreating = () => {
    setEditingRule(null)
    setIsCreating(true)
    setFormTitle('')
    setFormDescription('')
    saveSt.reset()
  }

  const cancelForm = () => {
    setEditingRule(null)
    setIsCreating(false)
    setFormTitle('')
    setFormDescription('')
    saveSt.reset()
  }

  const isFormOpen = isCreating || editingRule !== null

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Community Rules</h1>
          {!isFormOpen && (
            <button
              type="button"
              onClick={startCreating}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus size={16} aria-hidden="true" />
              Add Rule
            </button>
          )}
        </div>

        {actionError && <ErrorAlert message={actionError} onDismiss={() => setActionError(null)} />}
        {loadError && (
          <ErrorAlert message={loadError} variant="page" onRetry={() => void fetchData()} />
        )}

        {/* Create/Edit form */}
        {isFormOpen && (
          <div className="rounded-lg border border-border bg-card p-4 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              {isCreating ? 'New Rule' : 'Edit Rule'}
            </h2>
            {editingRule && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={12} aria-hidden="true" />
                Editing creates a new version. Historical references are preserved.
              </p>
            )}
            <div>
              <FormLabel htmlFor="rule-title" required>
                Title
              </FormLabel>
              <input
                id="rule-title"
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                maxLength={200}
                required
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                placeholder="e.g., Be respectful"
              />
            </div>
            <div>
              <FormLabel htmlFor="rule-description" required>
                Description
              </FormLabel>
              <textarea
                id="rule-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                required
                rows={4}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                placeholder="Full rule text visible to members..."
              />
            </div>
            <div className="flex items-center gap-2">
              <SaveButton
                status={saveSt.status}
                onClick={() => void (isCreating ? handleCreate() : handleUpdate())}
                label={isCreating ? 'Create Rule' : 'Save Changes'}
              />
              <button
                type="button"
                onClick={cancelForm}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading && <p className="text-sm text-muted-foreground">Loading rules...</p>}

        {!loading && rules.length === 0 && !isFormOpen && (
          <p className="py-8 text-center text-muted-foreground">
            No community rules yet. Rules help members understand expected behavior and give
            moderators structured reasons for actions.
          </p>
        )}

        {/* Rules list */}
        {!loading && rules.length > 0 && (
          <div className="space-y-2">
            {rules.map((rule, index) => (
              <div
                key={rule.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
                    aria-label={`Move "${rule.title}" up`}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === rules.length - 1}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
                    aria-label={`Move "${rule.title}" down`}
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold text-foreground">{rule.title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {rule.description}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEditing(rule)}
                    className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={`Edit "${rule.title}"`}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(rule.id)}
                    className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Archive "${rule.title}"`}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reorder save button */}
        {hasReorderChanges && (
          <SaveButton
            status={reorderSaveSt.status}
            onClick={() => void handleSaveOrder()}
            label="Save Order"
          />
        )}
      </div>
    </AdminLayout>
  )
}
