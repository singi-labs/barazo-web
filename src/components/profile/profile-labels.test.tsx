import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileLabels } from './profile-labels'

describe('ProfileLabels', () => {
  it('returns null when labels array is empty', () => {
    const { container } = render(<ProfileLabels labels={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a self-label with neutral styling', () => {
    render(
      <ProfileLabels labels={[{ val: 'adult-content', src: 'did:plc:user1', isSelfLabel: true }]} />
    )

    const pill = screen.getByText('adult-content')
    expect(pill).toBeInTheDocument()
    expect(pill.className).toContain('bg-muted')
    expect(pill.className).toContain('text-muted-foreground')
  })

  it('renders a self-label with warning styling for known warning values', () => {
    render(<ProfileLabels labels={[{ val: 'porn', src: 'did:plc:user1', isSelfLabel: true }]} />)

    const pill = screen.getByText('porn')
    expect(pill).toBeInTheDocument()
    expect(pill.className).toMatch(/bg-\[var\(--orange-3\)\]/)
    expect(pill.className).toMatch(/text-\[var\(--orange-11\)\]/)
  })

  it('renders a moderator label with ShieldCheck icon', () => {
    render(
      <ProfileLabels
        labels={[{ val: 'verified', src: 'did:plc:mod-service', isSelfLabel: false }]}
      />
    )

    const pill = screen.getByText('verified')
    expect(pill).toBeInTheDocument()
    expect(pill.className).toMatch(/bg-\[var\(--purple-3\)\]/)
    expect(pill.className).toMatch(/text-\[var\(--purple-11\)\]/)
    const icon = pill.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('renders a moderator warning label with ShieldWarning icon', () => {
    render(
      <ProfileLabels
        labels={[{ val: 'impersonation', src: 'did:plc:mod-service', isSelfLabel: false }]}
      />
    )

    const pill = screen.getByText('impersonation')
    expect(pill).toBeInTheDocument()
    expect(pill.className).toMatch(/bg-\[var\(--red-3\)\]/)
    expect(pill.className).toMatch(/text-\[var\(--red-11\)\]/)
    const icon = pill.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('strips ! prefix from display text', () => {
    render(
      <ProfileLabels labels={[{ val: '!warn', src: 'did:plc:mod-service', isSelfLabel: false }]} />
    )

    expect(screen.getByText('warn')).toBeInTheDocument()
    expect(screen.queryByText('!warn')).not.toBeInTheDocument()
  })

  it('renders multiple labels', () => {
    render(
      <ProfileLabels
        labels={[
          { val: 'adult-content', src: 'did:plc:user1', isSelfLabel: true },
          { val: '!warn', src: 'did:plc:mod', isSelfLabel: false },
        ]}
      />
    )

    expect(screen.getByText('adult-content')).toBeInTheDocument()
    expect(screen.getByText('warn')).toBeInTheDocument()
  })
})
