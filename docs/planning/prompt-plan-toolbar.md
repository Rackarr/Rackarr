# Prompt Plan: Toolbar Responsiveness

**Spec:** `docs/planning/spec-toolbar.md`
**Target:** v0.4.2

---

## Prompt 1: Fix Tagline Breakpoint

**Goal:** Move tagline hide breakpoint from 900px to 1200px to prevent overlap.

**TDD Steps:**

1. Write test: tagline visible at 1201px
2. Write test: tagline hidden at 1200px
3. Update CSS media query in Toolbar.svelte
4. Run tests, verify pass

**Files:** `Toolbar.svelte`

---

## Prompt 2: Fix Toolbar Layout/Spacing

**Goal:** Remove absolute positioning, use flexbox for consistent spacing.

**TDD Steps:**

1. Write test: toolbar sections have consistent gaps
2. Update `.toolbar-center` to use flexbox (no absolute positioning)
3. Adjust gaps using design tokens
4. Run tests, verify pass

**Files:** `Toolbar.svelte`

---

## Prompt 3: Create IconMenu Component

**Goal:** Add hamburger menu icon (3 horizontal lines).

**TDD Steps:**

1. Create IconMenu.svelte with standard icon props
2. Export from icons/index.ts
3. Verify renders correctly

**Files:** `icons/IconMenu.svelte`, `icons/index.ts`

---

## Prompt 4: Create ToolbarDrawer Component

**Goal:** Create drawer component with grouped menu items.

**TDD Steps:**

1. Write test: drawer renders with correct groups (File, Edit, View)
2. Write test: drawer hidden by default
3. Write test: drawer visible when open prop is true
4. Create ToolbarDrawer.svelte with structure and styling
5. Run tests, verify pass

**Files:** `ToolbarDrawer.svelte`

---

## Prompt 5: Add Hamburger State to Toolbar

**Goal:** Add hamburger icon next to logo, manage drawer state.

**TDD Steps:**

1. Write test: hamburger icon hidden at 1024px+
2. Write test: hamburger icon visible at <1024px
3. Write test: clicking logo/hamburger toggles drawer
4. Add hamburger icon and drawer state to Toolbar
5. Run tests, verify pass

**Files:** `Toolbar.svelte`

---

## Prompt 6: Wire Drawer Actions

**Goal:** Connect drawer menu items to existing toolbar handlers.

**TDD Steps:**

1. Write test: drawer action triggers correct handler
2. Write test: drawer closes after action
3. Wire up all action handlers in ToolbarDrawer
4. Run tests, verify pass

**Files:** `Toolbar.svelte`, `ToolbarDrawer.svelte`

---

## Prompt 7: Keyboard & Accessibility

**Goal:** Add Escape to close, focus trap, ARIA attributes.

**TDD Steps:**

1. Write test: Escape key closes drawer
2. Write test: aria-expanded reflects drawer state
3. Write test: focus moves to drawer on open
4. Implement keyboard handling and ARIA
5. Run tests, verify pass

**Files:** `Toolbar.svelte`, `ToolbarDrawer.svelte`

---

## Prompt 8: Visual Polish & Integration Test

**Goal:** Final visual polish, run full test suite, fix any issues.

**Steps:**

1. Run `npm run test:run` - fix any failures
2. Run `npm run build` - verify no build errors
3. Run `npm run lint` - fix any lint issues
4. Manual visual check at key breakpoints
5. Run E2E tests if applicable

---

## Prompt 9: Release v0.4.2

**Goal:** Commit changes, tag release, push.

**Steps:**

1. Update version in package.json to 0.4.2
2. Update CLAUDE.md version reference
3. Git add, commit with descriptive message
4. Git tag v0.4.2
5. Push to remote

---

## Completion Checklist

- [x] Prompt 1: Fix Tagline Breakpoint
- [x] Prompt 2: Fix Toolbar Layout/Spacing
- [x] Prompt 3: Create IconMenu Component
- [x] Prompt 4: Create ToolbarDrawer Component
- [x] Prompt 5: Add Hamburger State to Toolbar
- [x] Prompt 6: Wire Drawer Actions
- [x] Prompt 7: Keyboard & Accessibility
- [x] Prompt 8: Visual Polish & Integration Test
- [x] Prompt 9: Release v0.4.2
