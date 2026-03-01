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
    accountCreatedAt: null,
    followersCount: 0,
    followsCount: 0,
    atprotoPostsCount: 0,
    hasBlueskyProfile: false,
    communityCount: 1,
    labels: [],
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

  it('renders handle inline with display name', () => {
    render(<ProfileHeader profile={createProfile()} {...defaultProps} />)
    expect(screen.getByText(/@test\.bsky\.social/)).toBeInTheDocument()
  })

  it('renders bio with linebreaks', () => {
    const { container } = render(
      <ProfileHeader profile={createProfile({ bio: 'Line 1\nLine 2' })} {...defaultProps} />
    )
    const bioDiv = container.querySelector('div.prose-barazo')
    expect(bioDiv?.innerHTML).toContain('<br>')
  })

  it('renders bio with autolinked URLs (stripped display text)', () => {
    render(
      <ProfileHeader
        profile={createProfile({ bio: 'Visit https://example.com' })}
        {...defaultProps}
      />
    )
    const link = screen.getByRole('link', { name: /example\.com/i })
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

  it('renders an hr separator', () => {
    const { container } = render(<ProfileHeader profile={createProfile()} {...defaultProps} />)
    expect(container.querySelector('hr')).toBeInTheDocument()
  })

  // Section label tests
  it('renders "This forum" section label', () => {
    render(<ProfileHeader profile={createProfile()} {...defaultProps} />)
    expect(screen.getByText('This forum')).toBeInTheDocument()
  })

  it('renders "AT Protocol" section label', () => {
    render(<ProfileHeader profile={createProfile()} {...defaultProps} />)
    expect(screen.getByText('AT Protocol')).toBeInTheDocument()
  })

  it('renders "Barazo-wide" section label when globalActivity present', () => {
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
    expect(screen.getByText('Barazo-wide')).toBeInTheDocument()
  })

  it('does not render "Barazo-wide" section label when globalActivity absent', () => {
    render(<ProfileHeader profile={createProfile()} {...defaultProps} />)
    expect(screen.queryByText('Barazo-wide')).not.toBeInTheDocument()
  })

  // Stats value tests
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

  it('renders Bluesky link with stripped URL display when hasBlueskyProfile is true', () => {
    render(<ProfileHeader profile={createProfile({ hasBlueskyProfile: true })} {...defaultProps} />)
    const link = screen.getByRole('link', { name: /bsky\.app\/profile\/test\.bsky\.social/i })
    expect(link).toHaveAttribute('href', 'https://bsky.app/profile/test.bsky.social')
  })

  it('does not render Bluesky link when hasBlueskyProfile is false', () => {
    render(
      <ProfileHeader profile={createProfile({ hasBlueskyProfile: false })} {...defaultProps} />
    )
    expect(screen.queryByRole('link', { name: /bsky\.app\/profile/i })).not.toBeInTheDocument()
  })

  it('renders votesReceived in "This forum" stats', () => {
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

  it('renders globalActivity stats when present', () => {
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
    expect(screen.getByText(/25 topics/i)).toBeInTheDocument()
    expect(screen.getByText(/60 replies/i)).toBeInTheDocument()
  })

  it('shows full number in title attribute for large counts', () => {
    render(
      <ProfileHeader
        profile={createProfile({ followersCount: 14100, followsCount: 2300 })}
        {...defaultProps}
        postCount={1500}
      />
    )
    expect(screen.getByTitle('14,100')).toBeInTheDocument()
    expect(screen.getByTitle('1,500')).toBeInTheDocument()
  })

  it('abbreviates large numbers with formatCount', () => {
    render(
      <ProfileHeader
        profile={createProfile({ followersCount: 14100 })}
        {...defaultProps}
        postCount={1500}
      />
    )
    expect(screen.getByText(/14\.1K followers/i)).toBeInTheDocument()
    expect(screen.getByText(/1\.5K posts/i)).toBeInTheDocument()
  })

  describe('edit profile button', () => {
    it('shows "Edit profile" link when viewing own profile', () => {
      render(
        <ProfileHeader
          profile={createProfile({ did: 'did:plc:test-user' })}
          {...defaultProps}
          viewerDid="did:plc:test-user"
        />
      )
      const link = screen.getByRole('link', { name: /edit profile/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/u/test.bsky.social/edit')
    })

    it('hides "Edit profile" link when viewing another user profile', () => {
      render(
        <ProfileHeader
          profile={createProfile({ did: 'did:plc:test-user' })}
          {...defaultProps}
          viewerDid="did:plc:other-user"
        />
      )
      expect(screen.queryByRole('link', { name: /edit profile/i })).not.toBeInTheDocument()
    })

    it('hides "Edit profile" link when not authenticated', () => {
      render(
        <ProfileHeader
          profile={createProfile({ did: 'did:plc:test-user' })}
          {...defaultProps}
          viewerDid={null}
        />
      )
      expect(screen.queryByRole('link', { name: /edit profile/i })).not.toBeInTheDocument()
    })
  })

  it('renders AT Protocol account creation date when accountCreatedAt is set', () => {
    const { container } = render(
      <ProfileHeader
        profile={createProfile({ accountCreatedAt: '2024-06-15T10:30:00.000Z' })}
        {...defaultProps}
      />
    )
    const timeEl = container.querySelector('time[datetime="2024-06-15T10:30:00.000Z"]')
    expect(timeEl).toBeInTheDocument()
    expect(timeEl).toHaveTextContent('June 15, 2024')
  })

  it('does not render AT Protocol account creation date when accountCreatedAt is null', () => {
    const { container } = render(
      <ProfileHeader profile={createProfile({ accountCreatedAt: null })} {...defaultProps} />
    )
    expect(container.querySelector('time')).not.toBeInTheDocument()
  })

  it('renders labels section when labels are present', () => {
    render(
      <ProfileHeader
        profile={createProfile({
          labels: [{ val: 'adult-content', src: 'did:plc:test-user', isSelfLabel: true }],
        })}
        {...defaultProps}
      />
    )
    expect(screen.getByText('adult-content')).toBeInTheDocument()
  })

  it('does not render labels section when labels are empty', () => {
    render(<ProfileHeader profile={createProfile({ labels: [] })} {...defaultProps} />)
    expect(screen.queryByText('adult-content')).not.toBeInTheDocument()
  })
})
