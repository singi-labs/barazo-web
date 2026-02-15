/**
 * Tests for MutedContentWrapper component.
 * Collapses content matching muted words with accessible expand/collapse.
 * @see specs/prd-web.md Section M8
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { MutedContentWrapper } from './muted-content-wrapper'

describe('MutedContentWrapper', () => {
  it('renders children when no muted words match', () => {
    render(
      <MutedContentWrapper content="Hello world" mutedWords={['spam']}>
        <p>Hello world</p>
      </MutedContentWrapper>
    )
    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.queryByText(/content hidden/i)).not.toBeInTheDocument()
  })

  it('collapses content when a muted word matches', () => {
    render(
      <MutedContentWrapper content="This is spam content" mutedWords={['spam']}>
        <p>This is spam content</p>
      </MutedContentWrapper>
    )
    expect(screen.queryByText('This is spam content')).not.toBeInTheDocument()
    expect(screen.getByText(/content hidden \(muted word: spam\)/i)).toBeInTheDocument()
  })

  it('matches muted words case-insensitively', () => {
    render(
      <MutedContentWrapper content="This is SPAM content" mutedWords={['spam']}>
        <p>This is SPAM content</p>
      </MutedContentWrapper>
    )
    expect(screen.getByText(/content hidden \(muted word: spam\)/i)).toBeInTheDocument()
  })

  it('shows the first matching muted word in the label', () => {
    render(
      <MutedContentWrapper content="offensive spam text" mutedWords={['spam', 'offensive']}>
        <p>offensive spam text</p>
      </MutedContentWrapper>
    )
    // Should show whichever word matched first in the muted words list
    expect(screen.getByText(/content hidden \(muted word: spam\)/i)).toBeInTheDocument()
  })

  it('expands content on click', async () => {
    const user = userEvent.setup()
    render(
      <MutedContentWrapper content="spam post here" mutedWords={['spam']}>
        <p>spam post here</p>
      </MutedContentWrapper>
    )

    // Content hidden initially
    expect(screen.queryByText('spam post here')).not.toBeInTheDocument()

    // Click to expand
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('spam post here')).toBeInTheDocument()
  })

  it('collapses content again on second click', async () => {
    const user = userEvent.setup()
    render(
      <MutedContentWrapper content="spam post here" mutedWords={['spam']}>
        <p>spam post here</p>
      </MutedContentWrapper>
    )

    // Expand
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('spam post here')).toBeInTheDocument()

    // Collapse again
    await user.click(screen.getByRole('button'))
    expect(screen.queryByText('spam post here')).not.toBeInTheDocument()
  })

  it('sets aria-expanded correctly', async () => {
    const user = userEvent.setup()
    render(
      <MutedContentWrapper content="spam content" mutedWords={['spam']}>
        <p>spam content</p>
      </MutedContentWrapper>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')

    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('renders children directly when mutedWords is empty', () => {
    render(
      <MutedContentWrapper content="Any content" mutedWords={[]}>
        <p>Any content</p>
      </MutedContentWrapper>
    )
    expect(screen.getByText('Any content')).toBeInTheDocument()
  })

  it('matches whole words only (not substrings)', () => {
    render(
      <MutedContentWrapper content="This is a classic example" mutedWords={['ass']}>
        <p>This is a classic example</p>
      </MutedContentWrapper>
    )
    // "classic" contains "ass" but should not match as a whole word
    expect(screen.getByText('This is a classic example')).toBeInTheDocument()
    expect(screen.queryByText(/content hidden/i)).not.toBeInTheDocument()
  })

  it('announces state change to screen readers via aria-live', async () => {
    const user = userEvent.setup()
    render(
      <MutedContentWrapper content="spam content" mutedWords={['spam']}>
        <p>spam content</p>
      </MutedContentWrapper>
    )

    // Should have a live region for state announcements
    const liveRegion = screen.getByRole('status')
    expect(liveRegion).toBeInTheDocument()

    await user.click(screen.getByRole('button'))
    expect(liveRegion).toHaveTextContent(/content revealed/i)
  })

  it('passes axe accessibility check when collapsed', async () => {
    const { container } = render(
      <MutedContentWrapper content="spam content" mutedWords={['spam']}>
        <p>spam content</p>
      </MutedContentWrapper>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('passes axe accessibility check when expanded', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MutedContentWrapper content="spam content" mutedWords={['spam']}>
        <p>spam content</p>
      </MutedContentWrapper>
    )
    await user.click(screen.getByRole('button'))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
