/**
 * Tests for ModerationControls component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { ModerationControls } from './moderation-controls'

describe('ModerationControls', () => {
  it('renders nothing when user is not a moderator', () => {
    render(<ModerationControls isModerator={false} onAction={vi.fn()} />)
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('renders moderation actions for moderators', () => {
    render(<ModerationControls isModerator={true} onAction={vi.fn()} />)
    expect(screen.getByRole('group', { name: /moderation/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /lock/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /pin/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('shows confirmation dialog before executing destructive action', async () => {
    const user = userEvent.setup()
    render(<ModerationControls isModerator={true} onAction={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('executes action after confirmation', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(<ModerationControls isModerator={true} onAction={onAction} />)
    await user.click(screen.getByRole('button', { name: /delete/i }))
    await user.click(screen.getByRole('button', { name: /confirm/i }))
    expect(onAction).toHaveBeenCalledWith('delete')
  })

  it('cancels action when dialog is dismissed', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(<ModerationControls isModerator={true} onAction={onAction} />)
    await user.click(screen.getByRole('button', { name: /delete/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onAction).not.toHaveBeenCalled()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('reflects locked state', () => {
    render(<ModerationControls isModerator={true} isLocked={true} onAction={vi.fn()} />)
    expect(screen.getByRole('button', { name: /unlock/i })).toBeInTheDocument()
  })

  it('reflects pinned state', () => {
    render(<ModerationControls isModerator={true} isPinned={true} onAction={vi.fn()} />)
    expect(screen.getByRole('button', { name: /unpin/i })).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<ModerationControls isModerator={true} onAction={vi.fn()} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  describe('pin scope selector', () => {
    it('should show scope selector in pin confirmation dialog', async () => {
      const user = userEvent.setup()
      render(
        <ModerationControls isModerator={true} isPinned={false} isAdmin={true} onAction={vi.fn()} />
      )
      await user.click(screen.getByRole('button', { name: /pin topic/i }))
      expect(screen.getByLabelText('This category')).toBeInTheDocument()
      expect(screen.getByLabelText('Forum-wide')).toBeInTheDocument()
    })

    it('should not show forum-wide option for non-admin moderators', async () => {
      const user = userEvent.setup()
      render(
        <ModerationControls
          isModerator={true}
          isPinned={false}
          isAdmin={false}
          onAction={vi.fn()}
        />
      )
      await user.click(screen.getByRole('button', { name: /pin topic/i }))
      expect(screen.getByLabelText('This category')).toBeInTheDocument()
      expect(screen.queryByLabelText('Forum-wide')).not.toBeInTheDocument()
    })

    it('should default to category scope when isAdmin is not provided', async () => {
      const user = userEvent.setup()
      render(<ModerationControls isModerator={true} isPinned={false} onAction={vi.fn()} />)
      await user.click(screen.getByRole('button', { name: /pin topic/i }))
      expect(screen.getByLabelText('This category')).toBeInTheDocument()
      expect(screen.queryByLabelText('Forum-wide')).not.toBeInTheDocument()
    })

    it('should pass scope option when confirming pin with category scope', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      render(
        <ModerationControls
          isModerator={true}
          isPinned={false}
          isAdmin={true}
          onAction={onAction}
        />
      )
      await user.click(screen.getByRole('button', { name: /pin topic/i }))
      // Category is selected by default
      await user.click(screen.getByRole('button', { name: /confirm/i }))
      expect(onAction).toHaveBeenCalledWith('pin', { scope: 'category' })
    })

    it('should pass scope option when confirming pin with forum-wide scope', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      render(
        <ModerationControls
          isModerator={true}
          isPinned={false}
          isAdmin={true}
          onAction={onAction}
        />
      )
      await user.click(screen.getByRole('button', { name: /pin topic/i }))
      await user.click(screen.getByLabelText('Forum-wide'))
      await user.click(screen.getByRole('button', { name: /confirm/i }))
      expect(onAction).toHaveBeenCalledWith('pin', { scope: 'forum' })
    })

    it('should not show scope selector for unpin action', async () => {
      const user = userEvent.setup()
      render(
        <ModerationControls isModerator={true} isPinned={true} isAdmin={true} onAction={vi.fn()} />
      )
      await user.click(screen.getByRole('button', { name: /unpin topic/i }))
      expect(screen.queryByLabelText('This category')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Forum-wide')).not.toBeInTheDocument()
    })

    it('should not pass scope option for non-pin actions', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      render(<ModerationControls isModerator={true} isAdmin={true} onAction={onAction} />)
      await user.click(screen.getByRole('button', { name: /delete/i }))
      await user.click(screen.getByRole('button', { name: /confirm/i }))
      expect(onAction).toHaveBeenCalledWith('delete')
    })

    it('should reset scope to category when dialog is cancelled and reopened', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      render(
        <ModerationControls
          isModerator={true}
          isPinned={false}
          isAdmin={true}
          onAction={onAction}
        />
      )
      // Open, select forum-wide, cancel
      await user.click(screen.getByRole('button', { name: /pin topic/i }))
      await user.click(screen.getByLabelText('Forum-wide'))
      await user.click(screen.getByRole('button', { name: /cancel/i }))

      // Reopen -- should default to category
      await user.click(screen.getByRole('button', { name: /pin topic/i }))
      const categoryRadio = screen.getByLabelText('This category') as HTMLInputElement
      expect(categoryRadio.checked).toBe(true)
    })

    it('should show warning when pinnedCount is 5 or more', async () => {
      const user = userEvent.setup()
      render(
        <ModerationControls
          isModerator={true}
          isPinned={false}
          pinnedCount={6}
          onAction={vi.fn()}
        />
      )
      await user.click(screen.getByRole('button', { name: /pin topic/i }))
      expect(screen.getByText(/6 pinned topics/)).toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should not show warning when pinnedCount is below 5', async () => {
      const user = userEvent.setup()
      render(
        <ModerationControls
          isModerator={true}
          isPinned={false}
          pinnedCount={3}
          onAction={vi.fn()}
        />
      )
      await user.click(screen.getByRole('button', { name: /pin topic/i }))
      expect(screen.queryByText(/pinned topics/)).not.toBeInTheDocument()
    })

    it('should not show warning when pinnedCount is not provided', async () => {
      const user = userEvent.setup()
      render(<ModerationControls isModerator={true} isPinned={false} onAction={vi.fn()} />)
      await user.click(screen.getByRole('button', { name: /pin topic/i }))
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('passes axe accessibility check with pin scope selector open', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <ModerationControls isModerator={true} isPinned={false} isAdmin={true} onAction={vi.fn()} />
      )
      await user.click(screen.getByRole('button', { name: /pin topic/i }))
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
