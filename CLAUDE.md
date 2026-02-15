# Barazo Web -- Default Frontend

MIT | Part of [github.com/barazo-forum](https://github.com/barazo-forum)

The default frontend for Barazo forums. Communicates with the AppView backend exclusively via REST API. Forum admins can customize or replace entirely.

## Tech Stack

| Component           | Technology                                                       |
| ------------------- | ---------------------------------------------------------------- |
| Framework           | Next.js 16 / React 19 / TypeScript (strict)                      |
| Styling             | TailwindCSS                                                      |
| Components          | shadcn/ui (Radix primitives) for admin; custom forum components  |
| Colors              | Radix Colors (12-step system) + Flexoki (accent hues)            |
| Icons               | Phosphor Icons (6 weights, replaces Lucide)                      |
| Typography          | Source Sans 3 / Source Code Pro (self-hosted, zero external DNS) |
| Syntax highlighting | Shiki + Flexoki theme (SSR, dual light/dark)                     |
| Testing             | Vitest + vitest-axe + @axe-core/playwright                       |
| Accessibility       | WCAG 2.2 AA from first commit                                    |
| SEO                 | JSON-LD, OpenGraph, sitemaps, SSR                                |

## What This Repo Does

- Server-side rendered forum UI (topics, replies, categories, profiles, search)
- Admin dashboard (moderation, settings, branding) using shadcn/ui
- Communicates with barazo-api via REST API only (fully decoupled)
- Handles AT Protocol OAuth login flow (redirects to user's PDS)
- Markdown rendering for post content (sanitized)

## Mandatory Standards

Read these before writing any code:

1. **Test-Driven Development** -- write tests BEFORE implementation. Use the `test-driven-development` skill.
2. **Strict TypeScript** -- `strict: true`, no `any`, no `@ts-ignore`.
3. **Accessibility** -- WCAG 2.2 AA from first commit. Pagination by default. eslint-plugin-jsx-a11y strict + vitest-axe + @axe-core/playwright in CI.
4. **SEO** -- JSON-LD structured data (DiscussionForumPosting, BreadcrumbList), OpenGraph + Twitter Cards, sitemaps, canonical URLs, robots.txt.
5. **Output sanitization** -- DOMPurify on all user-generated content. Prevent XSS.
6. **Conventional commits** -- `type(scope): description`.
7. **CI checks must pass** -- lint, typecheck, tests, a11y audit, Lighthouse CI on every PR.
8. **Semantic HTML** -- use correct elements (`<nav>`, `<main>`, `<article>`, `<aside>`). No `div` soup.
9. **Keyboard navigation** -- all interactive elements reachable and operable via keyboard. Visible focus indicators.
10. **Radix primitives** -- use Radix (via shadcn/ui) for complex interactive components. Don't build custom dropdowns, dialogs, etc.

## Git Workflow

- **Small changes** (typos, single-file fixes, config tweaks): commit directly to `main`
- **Substantial work** (new features, multi-file changes, refactors): always create a git worktree

## Workspace Docs

Architectural decisions and detailed standards live in the workspace, not in this repo. Load only what's relevant:

```
~/Documents/CoreNotes/Workspaces/Barazo/
├── decisions/frontend.md          SEO patterns, accessibility decisions
├── decisions/features-and-ux.md   MVP scope, onboarding, reactions
├── standards/shared.md            TypeScript, CI/CD, testing, commits, code review
├── standards/frontend.md          Components, SEO implementation, a11y testing tiers
└── research/05-data-models.md     Lexicon schemas (for API response types)
```

## Execution Strategy

**Master plan:** `~/Documents/CoreNotes/Workspaces/Barazo/plans/2026-02-09-mvp-implementation.md`

Before starting any milestone, read the master plan's **Execution Strategy** section. It specifies:

- Which skill to invoke (`subagent-driven-development` or `executing-plans`)
- Which model to use per milestone (the plan has a per-milestone model map)
- Review gates (spec compliance + code quality) that must pass before marking tasks complete

**This repo's milestones (completed during P1):** Implementation milestones Web M1-M14 are internal to this repo and completed during P1 (Core MVP). Web M1-M3 use `opus` (scaffold, design system, auth -- establishes all patterns). Web M4-M14 use `sonnet` (follows established component and page patterns). Reviewers always use `sonnet`.

## Project Context

- **Project owner (Guido) is NOT a software engineer** -- Claude Code is the sole implementer
- All code must be production-quality from the first commit
- This frontend is the reference implementation; third parties may build alternatives
- Focus on AT Protocol patterns (not traditional forum patterns)
- Keep it simple (MVP mindset)
