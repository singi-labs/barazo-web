/**
 * Tests for the Edit Profile page.
 * Covers auth gating, own-profile check, form rendering,
 * PDS sync indicators, save/cancel, and field reset.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditProfilePage } from './page'
import type { CommunityProfile } from '@/lib/api/types'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = vi.fn()
const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: vi.fn(),
  }),
  redirect: vi.fn(),
}))

const mockUseAuth = vi.fn()
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
}))

const mockUseCommunityProfile = vi.fn()
vi.mock('@/hooks/use-community-profile', () => ({
  useCommunityProfile: () => mockUseCommunityProfile(),
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
    dismiss: vi.fn(),
  }),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createCommunityProfile(overrides?: Partial<CommunityProfile>): CommunityProfile {
  return {
    did: 'did:plc:user-jay-001',
    handle: 'jay.bsky.team',
    displayName: 'Jay',
    avatarUrl: 'https://cdn.bsky.social/avatar/jay.jpg',
    bannerUrl: null,
    bio: 'Community admin and AT Protocol enthusiast.',
    communityDid: 'did:plc:test-community-123',
    hasOverride: false,
    source: {
      displayName: 'Jay',
      avatarUrl: 'https://cdn.bsky.social/avatar/jay.jpg',
      bannerUrl: null,
      bio: 'Community admin and AT Protocol enthusiast.',
    },
    ...overrides,
  }
}

function defaultAuth(overrides?: Record<string, unknown>) {
  return {
    user: { did: 'did:plc:user-jay-001', handle: 'jay.bsky.team' },
    isAuthenticated: true,
    isLoading: false,
    getAccessToken: () => 'mock-token',
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    authFetch: vi.fn(),
    ...overrides,
  }
}

function defaultCommunityProfile(overrides?: Record<string, unknown>) {
  return {
    communityDid: 'did:plc:test-community-123',
    profile: createCommunityProfile(),
    loading: false,
    saving: false,
    error: null,
    success: false,
    displayName: '',
    bio: '',
    setDisplayName: vi.fn(),
    setBio: vi.fn(),
    handleSave: vi.fn(),
    handleReset: vi.fn(),
    handleAvatarUpload: vi.fn(),
    handleBannerUpload: vi.fn(),
    handleAvatarRemove: vi.fn(),
    handleBannerRemove: vi.fn(),
    showResetConfirm: false,
    setShowResetConfirm: vi.fn(),
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('EditProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue(defaultAuth())
    mockUseCommunityProfile.mockReturnValue(defaultCommunityProfile())
  })

  describe('auth gating', () => {
    it('redirects to home when not authenticated', async () => {
      mockUseAuth.mockReturnValue(
        defaultAuth({ user: null, isAuthenticated: false, getAccessToken: () => null })
      )

      render(<EditProfilePage params={{ handle: 'jay.bsky.team' }} />)

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/')
      })
    })

    it('does not redirect when authenticated', () => {
      render(<EditProfilePage params={{ handle: 'jay.bsky.team' }} />)
      expect(mockReplace).not.toHaveBeenCalled()
    })
  })

  describe('own profile check', () => {
    it('redirects when viewing another user profile', async () => {
      render(<EditProfilePage params={{ handle: 'alex.bsky.team' }} />)

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/profile/alex.bsky.team')
      })
    })
  })

  describe('form rendering', () => {
    it('renders display name input', () => {
      render(<EditProfilePage params={{ handle: 'jay.bsky.team' }} />)
      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument()
    })

    it('renders bio textarea', () => {
      render(<EditProfilePage params={{ handle: 'jay.bsky.team' }} />)
      expect(screen.getByLabelText(/bio/i)).toBeInTheDocument()
    })

    it('renders save button', () => {
      render(<EditProfilePage params={{ handle: 'jay.bsky.team' }} />)
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    })

    it('renders cancel link', () => {
      render(<EditProfilePage params={{ handle: 'jay.bsky.team' }} />)
      const cancel = screen.getByRole('link', { name: /cancel/i })
      expect(cancel).toHaveAttribute('href', '/profile/jay.bsky.team')
    })
  })

  describe('PDS sync indicators', () => {
    it('shows "Synced from AT Protocol" when no override exists', () => {
      mockUseCommunityProfile.mockReturnValue(
        defaultCommunityProfile({
          profile: createCommunityProfile({ hasOverride: false }),
          displayName: '',
          bio: '',
        })
      )

      render(<EditProfilePage params={{ handle: 'jay.bsky.team' }} />)
      const indicators = screen.getAllByText(/synced from at protocol/i)
      expect(indicators.length).toBeGreaterThanOrEqual(1)
    })

    it('shows "Custom for this community" when override exists', () => {
      mockUseCommunityProfile.mockReturnValue(
        defaultCommunityProfile({
          profile: createCommunityProfile({ hasOverride: true }),
          displayName: 'Custom Jay',
          bio: 'Custom bio',
        })
      )

      render(<EditProfilePage params={{ handle: 'jay.bsky.team' }} />)
      const indicators = screen.getAllByText(/custom for this community/i)
      expect(indicators.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('save and cancel', () => {
    it('calls handleSave on form submit', async () => {
      const handleSave = vi.fn((e: React.FormEvent) => e.preventDefault())
      mockUseCommunityProfile.mockReturnValue(defaultCommunityProfile({ handleSave }))

      const user = userEvent.setup()
      render(<EditProfilePage params={{ handle: 'jay.bsky.team' }} />)

      await user.click(screen.getByRole('button', { name: /save/i }))
      expect(handleSave).toHaveBeenCalled()
    })

    it('disables save button while saving', () => {
      mockUseCommunityProfile.mockReturnValue(defaultCommunityProfile({ saving: true }))

      render(<EditProfilePage params={{ handle: 'jay.bsky.team' }} />)
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
    })
  })

  describe('reset to AT Protocol', () => {
    it('shows reset buttons for each field when override exists', () => {
      mockUseCommunityProfile.mockReturnValue(
        defaultCommunityProfile({
          profile: createCommunityProfile({ hasOverride: true }),
          displayName: 'Custom Jay',
          bio: 'Custom bio',
        })
      )

      render(<EditProfilePage params={{ handle: 'jay.bsky.team' }} />)
      const resetButtons = screen.getAllByRole('button', { name: /reset to at protocol/i })
      expect(resetButtons.length).toBe(2)
    })

    it('calls setDisplayName with empty string when reset display name', async () => {
      const setDisplayName = vi.fn()
      mockUseCommunityProfile.mockReturnValue(
        defaultCommunityProfile({
          profile: createCommunityProfile({ hasOverride: true }),
          displayName: 'Custom Jay',
          bio: '',
          setDisplayName,
        })
      )

      const user = userEvent.setup()
      render(<EditProfilePage params={{ handle: 'jay.bsky.team' }} />)

      const resetButtons = screen.getAllByRole('button', { name: /reset to at protocol/i })
      await user.click(resetButtons[0]!)
      expect(setDisplayName).toHaveBeenCalledWith('')
    })
  })

  describe('loading state', () => {
    it('shows loading state while profile loads', () => {
      mockUseCommunityProfile.mockReturnValue(
        defaultCommunityProfile({ loading: true, profile: null })
      )

      render(<EditProfilePage params={{ handle: 'jay.bsky.team' }} />)
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('shows error message', () => {
      mockUseCommunityProfile.mockReturnValue(
        defaultCommunityProfile({ error: 'Failed to load community profile.' })
      )

      render(<EditProfilePage params={{ handle: 'jay.bsky.team' }} />)
      expect(screen.getByText(/failed to load community profile/i)).toBeInTheDocument()
    })
  })
})
