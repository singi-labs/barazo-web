# Manual Accessibility Walkthrough

Human checkpoint for WCAG 2.2 AA compliance. Run before each major release.

## Pages to Test

1. Homepage (`/`)
2. Category page (`/c/general/`)
3. Topic page (`/t/{slug}/{rkey}/`)
4. Search page (`/search/`)
5. Admin dashboard (`/admin/`)
6. Settings page (`/settings/`)
7. Profile page (`/u/{handle}/`)
8. Accessibility statement (`/accessibility/`)

---

## VoiceOver + Safari Walkthrough (macOS)

**Setup:** Open Safari, enable VoiceOver (Cmd+F5), navigate to the dev server.

For each page:

### Landmarks and Headings

- [ ] VoiceOver announces the page title on load
- [ ] Rotor (VO+U) shows correct landmarks: banner, navigation, main, contentinfo
- [ ] Heading hierarchy is logical (h1 > h2 > h3, no skipped levels)
- [ ] No duplicate h1 elements

### Navigation

- [ ] Skip-to-content link is the first focusable element and works
- [ ] Main navigation items are announced with correct roles
- [ ] Current page/section is indicated (aria-current or equivalent)
- [ ] Dropdown menus announce expanded/collapsed state

### Interactive Elements

- [ ] All buttons announce their purpose (no "button, button")
- [ ] Form inputs have associated labels (announced by VoiceOver)
- [ ] Required fields are announced as required
- [ ] Error messages are announced when they appear (live region or focus management)
- [ ] Dialog/modal focus is trapped and escape closes it
- [ ] Toast notifications are announced via live region

### Content

- [ ] Images have meaningful alt text (or are marked decorative)
- [ ] Links announce their destination (no "click here")
- [ ] Tables have proper headers and captions
- [ ] Lists are announced as lists with item count

### Dynamic Content

- [ ] Loading states are announced
- [ ] Content updates (new posts, search results) are announced
- [ ] Pagination controls announce current page and total

---

## Keyboard-Only Walkthrough

**Setup:** Do not use a mouse or trackpad. Navigate entirely with keyboard.

For each page:

### Focus Management

- [ ] Tab order follows visual layout (left-to-right, top-to-bottom)
- [ ] Focus indicator is clearly visible on all interactive elements
- [ ] No focus traps (can always Tab out of any component, except modals)
- [ ] Focus returns to trigger element after closing modal/dropdown
- [ ] Skip-to-content link works (Tab once from page load, Enter)

### Navigation

- [ ] All navigation items reachable via Tab
- [ ] Dropdown menus: Enter/Space opens, arrow keys navigate, Escape closes
- [ ] Tab key moves between top-level nav items (not into closed dropdowns)

### Forms

- [ ] All form fields reachable via Tab
- [ ] Checkboxes toggle with Space
- [ ] Radio buttons navigate with arrow keys
- [ ] Select/dropdown opens with Enter/Space, arrow keys navigate, Enter selects
- [ ] Form submits with Enter from text input
- [ ] Validation errors focusable and reachable

### Interactive Components

- [ ] Buttons activate with Enter and Space
- [ ] Accordion panels toggle with Enter/Space
- [ ] Tabs switch with arrow keys
- [ ] Tooltips appear on focus (not just hover)
- [ ] Context menus open with Shift+F10 or dedicated key

### Content Interaction

- [ ] Markdown editor: Tab inserts content (not focus change) when editing
- [ ] Reaction buttons reachable and activatable
- [ ] Pagination controls navigable
- [ ] Sort/filter controls operable

### Page-Specific Checks

- [ ] **Search:** Focus moves to results after search submission
- [ ] **Admin:** All admin actions (ban, delete, move) keyboard-accessible
- [ ] **Settings:** All preference toggles keyboard-operable
- [ ] **Topic:** Reply button, quote selection, and reaction picker all reachable

---

## Recording Results

Date: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
Tester: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
Browser/OS: \_\_\_\_\_\_\_\_\_\_\_\_\_\_

### Issues Found

| Page | Issue | WCAG Criterion | Severity | Status |
| ---- | ----- | -------------- | -------- | ------ |
|      |       |                |          |        |

Severity: Critical (blocks access), Major (significant barrier), Minor (inconvenience)
Status: Open, Fixed (with PR link), Won't Fix (with justification)
