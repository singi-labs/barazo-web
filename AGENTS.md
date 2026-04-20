# Barazo Web -- Default Frontend

<!-- Auto-generated from barazo-workspace. To propose changes, edit the source:
     https://github.com/singi-labs/barazo-workspace/tree/main/agents-md -->

MIT | Part of [github.com/singi-labs](https://github.com/singi-labs)

The default frontend for Barazo forums. Communicates with the AppView backend exclusively via REST API. Forum admins can customize or replace entirely.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 / React 19 / TypeScript (strict) |
| Styling | TailwindCSS |
| Components | shadcn/ui (Radix primitives) for admin; custom forum components |
| Colors | Radix Colors (12-step system) + Flexoki accent hues |
| Icons | Phosphor Icons (6 weights) |
| Typography | Source Sans 3 / Source Code Pro (self-hosted, zero external DNS) |
| Syntax highlighting | Shiki + Flexoki theme (SSR, dual light/dark) |
| Testing | Vitest + vitest-axe + @axe-core/playwright |
| Accessibility | WCAG 2.2 AA from first commit |
| SEO | JSON-LD, OpenGraph, sitemaps, SSR |

## What This Repo Does

- Server-side rendered forum UI (topics, replies, categories, profiles, search)
- Admin dashboard (moderation, settings, branding) using shadcn/ui
- Communicates with barazo-api via REST API only (fully decoupled)
- Handles AT Protocol OAuth login flow (redirects to user's PDS)
- Markdown rendering for post content (sanitized)

## Frontend-Specific Standards

- WCAG 2.2 AA compliance from first commit -- eslint-plugin-jsx-a11y strict + vitest-axe + @axe-core/playwright in CI
- Semantic HTML -- correct elements (`<nav>`, `<main>`, `<article>`, `<aside>`), no div soup
- Keyboard navigation -- all interactive elements reachable and operable, visible focus indicators
- Radix primitives (via shadcn/ui) for complex interactive components -- no custom dropdowns, dialogs, etc.
- SEO -- JSON-LD structured data (DiscussionForumPosting, BreadcrumbList), OpenGraph + Twitter Cards, sitemaps, canonical URLs
- DOMPurify on all user-generated content rendering

---

## Project-Wide Standards

### About Barazo

Open-source forum software built on the [AT Protocol](https://atproto.com/). Portable identity, member-owned data, no lock-in.

- **Organization:** [github.com/singi-labs](https://github.com/singi-labs)
- **License:** AGPL-3.0 (backend) / MIT (frontend, lexicons, deploy) / CC BY-SA 4.0 + MIT (docs) / Proprietary (website)
- **Contributing:** See [CONTRIBUTING.md](https://github.com/singi-labs/.github/blob/main/CONTRIBUTING.md)

### Coding Standards

1. **Test-Driven Development** -- write tests before implementation (Vitest).
2. **Strict TypeScript** -- `strict: true`, no `any`, no `@ts-ignore`.
3. **Conventional commits** -- `type(scope): description`.
4. **CI must pass** -- lint, typecheck, tests, security scan on every PR.
5. **Input validation** -- Zod schemas on all API inputs and firehose records.
6. **Output sanitization** -- DOMPurify on all user-generated content.
7. **No raw SQL** -- Drizzle ORM with parameterized queries only.
8. **Structured logging** -- Pino logger, never `console.log`.

### Before Starting Any Issue

**Always check for existing work before implementing anything:**

1. Search for open PRs that may already address the issue: `gh pr list --repo singi-labs/<repo> --state open`
2. Search for related branches: `gh api repos/singi-labs/<repo>/branches --paginate`
3. Scan the codebase for partial implementations of the feature
4. Check closed PRs for previously attempted work

The GitHub board may lag behind actual implementation state. Partial or complete implementations may exist without being reflected in issue status. Never duplicate work -- always verify first.

### Git Workflow

All changes go through Pull Requests -- never commit directly to `main`. Branch naming: `type/short-description` (e.g., `feat/add-reactions`, `fix/xss-sanitization`).

**Use git worktrees for all feature work.** Each branch must get its own working directory. This prevents multiple agents from stepping on each other's files and allows parallel work without stashing.

```bash
# Create a worktree for your branch
git worktree add /tmp/<repo>-<branch-name> -b <branch-name> origin/main

# Work in the worktree
cd /tmp/<repo>-<branch-name>

# When done, remove the worktree
git worktree remove /tmp/<repo>-<branch-name>
```

Never work directly in the main checkout (`/singi-labs/repos/<repo>/`). Always create a worktree per issue. Clean up the worktree after the PR is merged.

### AT Protocol Context

- Users own their data (stored on their Personal Data Server)
- The AppView (barazo-api) indexes data from the AT Protocol firehose
- Lexicons (`forum.barazo.*`) define the data schema contract
- Identity is portable via DIDs -- no vendor lock-in
- All record types are validated against lexicon schemas
