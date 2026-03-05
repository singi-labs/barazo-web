<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/barazo-forum/.github/main/assets/logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/barazo-forum/.github/main/assets/logo-light.svg">
  <img alt="Barazo Logo" src="https://raw.githubusercontent.com/barazo-forum/.github/main/assets/logo-dark.svg" width="120">
</picture>

# Barazo Web

**Default frontend for Barazo forums -- accessible, themeable, replaceable.**

[![Status: Alpha](https://img.shields.io/badge/status-alpha-orange)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/barazo-forum/barazo-web/actions/workflows/ci.yml/badge.svg)](https://github.com/barazo-forum/barazo-web/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/node-24%20LTS-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)](https://www.typescriptlang.org/)

</div>

---

## Overview

The default frontend for Barazo forums. Communicates with the [barazo-api](https://github.com/barazo-forum/barazo-api) backend exclusively via REST API. Forum admins can customize the theme or replace this frontend entirely. WCAG 2.2 AA compliant from first commit.

---

## Tech Stack

| Component           | Technology                                                       |
| ------------------- | ---------------------------------------------------------------- |
| Framework           | Next.js 16 / React 19 / TypeScript (strict)                      |
| Styling             | TailwindCSS                                                      |
| Components          | shadcn/ui (Radix primitives) for admin; custom forum components  |
| Colors              | Radix Colors (12-step system) + Flexoki (accent hues)            |
| Icons               | Phosphor Icons (6 weights)                                       |
| Typography          | Source Sans 3 / Source Code Pro (self-hosted, zero external DNS) |
| Syntax highlighting | Shiki + Flexoki theme (SSR, dual light/dark)                     |
| Testing             | Vitest + vitest-axe + @axe-core/playwright                       |
| Accessibility       | WCAG 2.2 AA from first commit                                    |
| SEO                 | JSON-LD, OpenGraph, sitemaps, SSR                                |

---

## Features

**19 pages:**

| Route                    | Page                                                      |
| ------------------------ | --------------------------------------------------------- |
| `/`                      | Topic list (home)                                         |
| `/[handle]/[rkey]`       | Topic detail with threaded replies                        |
| `/[handle]/[rkey]/edit`  | Edit topic                                                |
| `/new`                   | Create new topic                                          |
| `/c/[slug]`              | Category view                                             |
| `/search`                | Full-text search                                          |
| `/profile/[handle]`      | User profile                                              |
| `/settings`              | User preferences (maturity, notifications, cross-posting) |
| `/notifications`         | Notification center                                       |
| `/accessibility`         | Accessibility statement                                   |
| `/admin`                 | Admin dashboard                                           |
| `/admin/categories`      | Category management                                       |
| `/admin/moderation`      | Moderation queue                                          |
| `/admin/users`           | User management                                           |
| `/admin/settings`        | Community settings                                        |
| `/admin/content-ratings` | Content maturity settings                                 |
| `/admin/plugins`         | Plugin management (placeholder)                           |
| `/api/health`            | Health endpoint                                           |
| Dynamic                  | Sitemap, robots.txt, OpenGraph image generation           |

**26 components:**

- Forum: topic-list, topic-card, topic-view, topic-form, reply-card, reply-thread, category-nav
- Editor: markdown-editor, markdown-content, markdown-preview
- Interaction: reaction-bar, search-input, pagination, notification-bell, confirm-dialog, report-dialog
- User: user-profile-card, reputation-badge, ban-indicator, self-label-indicator
- Navigation: breadcrumbs, skip-links, theme-toggle, theme-provider
- Layout: forum-layout, admin-layout

**Core capabilities:**

- Dark/light theme toggle
- Block/mute user controls (portable via PDS)
- Age gate dialog (GDPR minimum age 16)
- Self-label indicators on posts
- Breadcrumb navigation with JSON-LD structured data
- OpenGraph image generation per topic
- Sitemap + robots.txt
- Skip links for keyboard navigation

---

## Planned Features

- Plugin management UI (page exists, functionality pending)
- Stripe billing dashboard integration
- PWA (push notifications, offline, add-to-home-screen)
- AI feature UI (semantic search, AI moderation dashboard, translation)
- Cross-community search aggregator UI

---

## Quick Start

**Prerequisites:** Node.js 24 LTS, pnpm, [barazo-api](https://github.com/barazo-forum/barazo-api) running (or mock handlers).

```bash
git clone https://github.com/barazo-forum/barazo-web.git
cd barazo-web
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) to view in the browser.

---

## Development

```bash
pnpm test           # Run all tests
pnpm lint           # ESLint + a11y rules
pnpm typecheck      # TypeScript strict mode
```

Three-tier accessibility testing:

1. **Static analysis:** eslint-plugin-jsx-a11y (strict mode)
2. **Unit tests:** vitest-axe on rendered components
3. **Integration:** @axe-core/playwright in CI

See [CONTRIBUTING.md](https://github.com/barazo-forum/.github/blob/main/CONTRIBUTING.md) for branching strategy, commit format, and code review process.

**Key standards:**

- TypeScript strict mode (no `any`, no `@ts-ignore`)
- Test-driven development (TDD)
- WCAG 2.2 AA from first commit
- Semantic HTML (`<nav>`, `<main>`, `<article>`, `<aside>`)
- Keyboard navigation on all interactive elements
- Conventional commits enforced

---

## Related Repositories

| Repository                                                         | Description                                   | License  |
| ------------------------------------------------------------------ | --------------------------------------------- | -------- |
| [barazo-api](https://github.com/barazo-forum/barazo-api)           | AppView backend (Fastify, firehose, REST API) | AGPL-3.0 |
| [barazo-lexicons](https://github.com/barazo-forum/barazo-lexicons) | AT Protocol lexicon schemas + generated types | MIT      |
| [barazo-deploy](https://github.com/barazo-forum/barazo-deploy)     | Docker Compose deployment templates           | MIT      |
| [barazo-website](https://github.com/barazo-forum/barazo-website)   | Marketing + documentation site                | MIT      |

---

## Community

- **Website:** [barazo.forum](https://barazo.forum)
- **Discussions:** [GitHub Discussions](https://github.com/orgs/barazo-forum/discussions)
- **Issues:** [Report bugs](https://github.com/barazo-forum/barazo-web/issues)

---

## License

**MIT**

See [LICENSE](LICENSE) for full terms.

---

(c) 2026 Barazo
