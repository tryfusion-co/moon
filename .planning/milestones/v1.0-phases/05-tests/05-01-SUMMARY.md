---
phase: 05-tests
plan: "01"
subsystem: tests
tags: [testing, solid, vitest, migration, atoms]
dependency_graph:
  requires: []
  provides: [atom-tests-accordion, atom-tests-alert, atom-tests-badge, atom-tests-bottomsheet, atom-tests-breadcrumb, atom-tests-authenticator, atom-tests-avatar, atom-tests-carousel, atom-tests-checkbox]
  affects: [packages/src/tests/atoms/]
tech_stack:
  added: []
  patterns: [render(() => <X/>), vi.fn, @solidjs/testing-library, fireEvent.input for onInput handlers]
key_files:
  created: []
  modified:
    - packages/src/tests/atoms/Accordion.test.tsx
    - packages/src/tests/atoms/Alert.test.tsx
  deleted:
    - packages/src/tests/accordion.test.tsx
    - packages/src/tests/Alert.test.tsx
    - packages/src/tests/Badge.test.tsx
    - packages/src/tests/BottomSheet.test.tsx
    - packages/src/tests/Breadcrumb.test.tsx
decisions:
  - "Accordion atom test lacked explicit toggle-via-click assertions; added fireEvent.click(summary) toggle suite + size=lg class test from legacy"
  - "Alert atom test lacked soft/positive variant combo; added from legacy coverage"
  - "Badge/BottomSheet/Breadcrumb atom tests already at parity or superset — no modifications needed"
  - "Breadcrumb legacy defaultCurrentPage/aria-current behavior omitted (old React API removed in Solid rewrite; Solid component uses isActive prop, is stateless)"
  - "Authenticator/Avatar/Carousel/Checkbox verified at parity; Checkbox and Authenticator confirmed using fireEvent.input not fireEvent.change"
metrics:
  duration: "~10 minutes"
  completed: "2026-06-01"
  tasks_completed: 2
  files_modified: 2
  files_deleted: 5
  tests_total: 76
---

# Phase 05 Plan 01: Migrate Legacy React Tests (Accordion/Alert/Badge/BottomSheet/Breadcrumb) + Verify Atom-Only Tests Summary

Merged legacy React test coverage (toggle/open-state, variant matrices, compound-component handlers) into Solid atom tests for Accordion/Alert/Badge/BottomSheet/Breadcrumb; verified parity for Authenticator/Avatar/Carousel/Checkbox; deleted 5 flat legacy files.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Merge Accordion/Alert/Badge into atoms; delete flat legacy files | 745557a | +fireEvent.click toggle suite in Accordion, +soft/positive variant in Alert; git rm accordion/Alert/Badge legacy |
| 2 | git rm BottomSheet/Breadcrumb; verify Authenticator/Avatar/Carousel/Checkbox at parity | 11b3ca2 | git rm BottomSheet/Breadcrumb legacy; 4 atom-only tests confirmed green |

## Verification

All 9 owned atom test files pass: 76 tests green.

```
Test Files  9 passed (9)
     Tests  76 passed (76)
```

Zero `@testing-library/react` imports. Zero `jest.` references. All files use `render(() => <X/>)`. Checkbox and Authenticator use `fireEvent.input` (not `fireEvent.change`).

## Deviations from Plan

### Auto-fixed Issues

None - plan executed exactly as written.

### Notes on Parity Decisions

**Accordion**: The atom test already had `initiallyOpen` and `details.open` property checks, but lacked an explicit `fireEvent.click(summary)` toggle flow (legacy's key behavioral coverage). Added the toggle suite as required by plan.

**Breadcrumb**: Legacy test used `defaultCurrentPage` and `aria-current` attributes which reflect old React component behavior. The Solid component was refactored to use `isActive` prop with no `defaultCurrentPage`/`index` props and no `aria-current` attribute. Legacy assertions omitted (they test removed API). Atom test matches the actual Solid component API — this is correct parity.

**Badge/BottomSheet**: Atom tests were already supersets of legacy coverage — no changes needed to the test files themselves; only the legacy flat files were deleted.

## Known Stubs

None.

## Threat Flags

None — test files only, no production surface changes.

## Self-Check: PASSED

- Atom files exist: packages/src/tests/atoms/Accordion.test.tsx, Alert.test.tsx, Badge.test.tsx, BottomSheet.test.tsx, Breadcrumb.test.tsx, Authenticator.test.tsx, Avatar.test.tsx, Carousel.test.tsx, Checkbox.test.tsx
- Legacy files deleted: accordion.test.tsx, Alert.test.tsx, Badge.test.tsx, BottomSheet.test.tsx, Breadcrumb.test.tsx
- Commits 745557a and 11b3ca2 exist
- 76/76 tests pass
