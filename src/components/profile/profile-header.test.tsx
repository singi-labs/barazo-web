import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileHeader } from './profile-header'
import type { UserProfile } from '@/lib/api/types'

// Mock next/image
vi.mock('next/image', () => ({
  default: function MockImage(props: Record<string, unknown>) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Mock useAuth hook (used by BlockMuteButton)
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    getAccessToken: () => null,
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    authFetch: vi.fn(),
  }),
}))

// Mock useToast hook (used by BlockMuteButton via useRequireAuth)
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
    dismiss: vi.fn(),
  }),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  redirect: vi.fn(),
}))

function createProfile(overrides?: Partial<UserProfile>): UserProfile {
  return {
    did: 'did:plc:test-user',
    handle: 'test.bsky.social',
    displayName: 'Test User',
    avatarUrl: 'https://cdn.bsky.social/avatar/test.jpg',
    bannerUrl: null,
    bio: null,
    role: 'user',
    firstSeenAt: '2026-02-14T12:00:00.000Z',
    lastActiveAt: '2026-02-14T12:00:00.000Z',
    followersCount: 0,
    followsCount: 0,
    atprotoPostsCount: 0,
    hasBlueskyProfile: false,
    communityCount: 1,
    activity: {
      topicCount: 0,
      replyCount: 0,
      reactionsReceived: 0,
      votesReceived: 0,
    },
    ...overrides,
  }
}

const defaultProps = {
  handle: 'test.bsky.social',
  reputationScore: 0,
  postCount: 0,
  joinDate: 'February 14, 2026',
  isBlocked: false,
  isMuted: false,
  onBlockToggle: vi.fn(),
  onMuteToggle: vi.fn(),
  viewerDid: null,
}

describe('ProfileHeader', () => {
  it('renders display name', () => {
    render(<ProfileHeader profile={createProfile()} {...defaultProps} />)
    expect(screen.getByRole('heading', { name: /test user/i })).toBeInTheDocument()
  })

  it('renders handle', () => {
    render(<ProfileHeader profile={createProfile()} {...defaultProps} />)
    expect(screen.getByText(/@test\.bsky\.social/)).toBeInTheDocument()
  })

  it('renders bio with linebreaks', () => {
    const { container } = render(
      <ProfileHeader profile={createProfile({ bio: 'Line 1\nLine 2' })} {...defaultProps} />
    )
    // The bio div uses dangerouslySetInnerHTML, select by div.mt-2.text-muted-foreground
    const bioDiv = container.querySelector('div.mt-2.text-sm.text-muted-foreground')
    expect(bioDiv?.innerHTML).toContain('<br>')
  })

  it('renders bio with autolinked URLs', () => {
    render(
      <ProfileHeader
        profile={createProfile({ bio: 'Visit https://example.com' })}
        {...defaultProps}
      />
    )
    const link = screen.getByRole('link', { name: /https:\/\/example\.com/i })
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('sanitizes XSS in bio', () => {
    const { container } = render(
      <ProfileHeader
        profile={createProfile({ bio: '<script>alert("xss")</script>' })}
        {...defaultProps}
      />
    )
    expect(container.querySelector('script')).toBeNull()
  })

  it('renders avatar from URL', () => {
    render(<ProfileHeader profile={createProfile()} {...defaultProps} />)
    const img = screen.getByAltText("Test User's avatar")
    expect(img).toBeInTheDocument()
  })

  it('renders fallback avatar when no URL', () => {
    render(<ProfileHeader profile={createProfile({ avatarUrl: null })} {...defaultProps} />)
    expect(screen.queryByAltText("Test User's avatar")).not.toBeInTheDocument()
  })

  it('renders followers and following counts', () => {
    render(
      <ProfileHeader
        profile={createProfile({ followersCount: 150, followsCount: 75 })}
        {...defaultProps}
      />
    )
    expect(screen.getByText(/150 followers/i)).toBeInTheDocument()
    expect(screen.getByText(/75 following/i)).toBeInTheDocument()
  })

  it('renders Bluesky link when hasBlueskyProfile is true', () => {
    render(<ProfileHeader profile={createProfile({ hasBlueskyProfile: true })} {...defaultProps} />)
    const link = screen.getByRole('link', { name: /view on bluesky/i })
    expect(link).toHaveAttribute('href', 'https://bsky.app/profile/test.bsky.social')
  })

  it('does not render Bluesky link when hasBlueskyProfile is false', () => {
    render(
      <ProfileHeader profile={createProfile({ hasBlueskyProfile: false })} {...defaultProps} />
    )
    expect(screen.queryByRole('link', { name: /view on bluesky/i })).not.toBeInTheDocument()
  })

  it('renders votesReceived in stats', () => {
    render(
      <ProfileHeader
        profile={createProfile({
          activity: { topicCount: 5, replyCount: 10, reactionsReceived: 20, votesReceived: 15 },
        })}
        {...defaultProps}
        postCount={15}
      />
    )
    expect(screen.getByText(/15 votes/i)).toBeInTheDocument()
  })

  it('renders globalActivity section when present', () => {
    render(
      <ProfileHeader
        profile={createProfile({
          globalActivity: {
            topicCount: 25,
            replyCount: 60,
            reactionsReceived: 120,
            votesReceived: 55,
          },
        })}
        {...defaultProps}
      />
    )
    expect(screen.getByText(/activity across all communities/i)).toBeInTheDocument()
    expect(screen.getByText(/25 topics/i)).toBeInTheDocument()
  })

  it('does not render globalActivity section when absent', () => {
    render(<ProfileHeader profile={createProfile()} {...defaultProps} />)
    expect(screen.queryByText(/activity across all communities/i)).not.toBeInTheDocument()
  })
})
