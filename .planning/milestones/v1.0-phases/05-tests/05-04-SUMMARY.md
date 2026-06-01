---
phase: 05-tests
plan: 04
subsystem: testing
tags: [solidjs, vitest, testing-library, solid-testing-library, Table, TabList, Tag, Tooltip, Select, Switch, Textarea]

requires:
  - phase: 04-compound-portal-composite
    provides: "Solid components for Table/TabList/Tag/Tooltip/Select/Switch/Textarea; CR-01 Select onInput bridge"
provides:
  - "7 authoritative Solid atom tests in src/tests/atoms/ — one per component"
  - "4 legacy React test files deleted (Table, TabList, Tag, Tooltip)"
  - "Select CR-01 onInput bridge verified with assertion"
affects: [05-05-tests-config-cleanup]

tech-stack:
  added: []
  patterns:
    - "render(() => <X/>) Solid wrapper form mandatory — all 60 assertions use it"
    - "fireEvent.input for onInput-bridged components (Select, Switch)"
    - "@solidjs/testing-library — all 7 files; zero @testing-library/react"
    - "vi.fn() for callback spies; vi.* throughout"

key-files:
  created: []
  modified:
    - packages/src/tests/atoms/Table.test.tsx
    - packages/src/tests/atoms/TabList.test.tsx
    - packages/src/tests/atoms/Tag.test.tsx
    - packages/src/tests/atoms/Tooltip.test.tsx
    - packages/src/tests/atoms/Select.test.tsx
    - packages/src/tests/atoms/Switch.test.tsx
    - packages/src/tests/atoms/Textarea.test.tsx

key-decisions:
  - "Select component binds onInput (not onChange) on native <select>; public API prop named onChange per React parity (CR-01 fix confirmed)"
  - "Atom tests were already superset of legacy for TabList/Switch/Textarea — no merging needed, just legacy deletion"
  - "Tag: added info-context variant test from legacy; Tooltip: added nested Trigger+Content rendering test"
  - "Table: added getByText assertions for header/data cell text content (from legacy)"

patterns-established:
  - "Legacy React test parity: translate className= to class=, jest.fn to vi.fn, render(<X/>) to render(() => <X/>)"
  - "Controlled-input testing: fireEvent.input for components binding onInput (Switch, Select)"

requirements-completed: [TEST-01]

duration: 15min
completed: 2026-06-01
---

# Phase 5 Plan 04: Legacy Test Migration — Table/TabList/Tag/Tooltip + Select/Switch/Textarea Parity Summary

**7 Solid atom tests consolidated with legacy React coverage; 4 flat legacy files deleted; Select onInput bridge (CR-01) confirmed via fireEvent.input assertion**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-06-01T10:37:00Z
- **Completed:** 2026-06-01T10:44:00Z
- **Tasks:** 2
- **Files modified:** 4 (Table, Tag, Tooltip atoms enriched; 4 legacy files deleted via git rm)

## Accomplishments

- Merged legacy React Table/TabList/Tag/Tooltip coverage into corresponding Solid atom tests — each atom test is now the single authoritative source
- Deleted 4 flat legacy React test files (Table, TabList, Tag, Tooltip) via `git rm`
- Verified Switch and Textarea atom tests: correct (`render(() =>`, `vi.fn`, `fireEvent.input`) — no changes needed
- Confirmed Select onInput bridge (CR-01): `Select.tsx` binds `onInput={handleInput}` which calls `local.onChange`; atom test fires `fireEvent.input` and asserts `onChange` callback fires — parity gap resolved
- All 60 tests across 7 files pass green

## Select onChange/onInput Parity Finding (CR-01)

**Binding confirmed:** `Select.tsx` does NOT use a native `onChange` on the DOM `<select>`. Instead:
1. The public prop `onChange` is typed as `JSX.EventHandler<HTMLSelectElement, Event>` (React API parity)
2. Internally a `handleInput` function calls `local.onChange(e)` when invoked
3. The DOM `<select>` binds `onInput={handleInput}`

**Test assertion (already in Select.test.tsx):**
```tsx
fireEvent.input(sel);         // fires native input event
expect(spy).toHaveBeenCalledTimes(1);  // onChange callback fires via bridge
```

**Verdict:** No behavioral gap vs React. The onInput bridge correctly maps Solid's synchronous input event semantics to the public `onChange` API. CR-01 fix is verified.

## Task Commits

1. **Task 1: Merge legacy Table/TabList; verify Switch/Textarea atom parity** - `ad3a77b` (feat)
   - Table.test.tsx: added `getByText` text-content assertions from legacy
   - Tag.test.tsx: added info-context variant test, visible-text assertion, custom-class test
   - Tooltip.test.tsx: added nested Trigger+Content children rendering test
   - git rm Table.test.tsx, TabList.test.tsx (legacy React)

2. **Task 2: Delete legacy Tag/Tooltip; verify Select onInput bridge (CR-01)** - `6dd48b0` (feat)
   - git rm Tag.test.tsx, Tooltip.test.tsx (legacy React)
   - Select onInput bridge reading and assertion confirmed

## Files Created/Modified

- `packages/src/tests/atoms/Table.test.tsx` — Added `screen.getByText` text-content assertions (legacy parity)
- `packages/src/tests/atoms/Tag.test.tsx` — Added info-context variant, visible-text, custom-class tests (legacy parity)
- `packages/src/tests/atoms/Tooltip.test.tsx` — Added nested Trigger+Content rendering test (legacy parity)
- `packages/src/tests/atoms/Switch.test.tsx` — Unchanged (already correct: fireEvent.input, vi.fn)
- `packages/src/tests/atoms/Textarea.test.tsx` — Unchanged (already correct: render(() =>, vi.*)
- `packages/src/tests/atoms/Select.test.tsx` — Unchanged (CR-01 assertion already present)
- `packages/src/tests/atoms/TabList.test.tsx` — Unchanged (atom test already superset of legacy)
- **DELETED:** `packages/src/tests/Table.test.tsx` (legacy React)
- **DELETED:** `packages/src/tests/TabList.test.tsx` (legacy React)
- **DELETED:** `packages/src/tests/Tag.test.tsx` (legacy React)
- **DELETED:** `packages/src/tests/Tooltip.test.tsx` (legacy React)

## Decisions Made

- **Select binding confirmed as onInput:** The component comment in Select.tsx explains the React vs Solid `onChange`/`onInput` semantics clearly. The CR-01 fix is correct and the test fires the right event.
- **TabList atom test is already a superset of legacy:** The legacy test had 3 assertions; the atom test had 13 covering defaultActiveIndex, aria-selected, class, tabIndex, onTabChange callback. No merging needed.
- **Switch/Textarea atom tests already correct:** Both files already use `render(() =>`, `vi.fn`, `fireEvent.input` (Switch). No changes needed.

## Deviations from Plan

None — plan executed exactly as written. The atom tests for TabList, Switch, Textarea already contained equal or richer coverage than legacy. Tag, Tooltip, and Table needed minor enrichment (adding 2-4 assertions each from legacy). Select was already complete with CR-01 assertion.

## Issues Encountered

- Worktree was behind main (base at 9181381; main at 06c0b9a). Rebased onto main before starting work. The atoms/ directory was not present until rebase completed.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All 7 atom test files are the single authoritative source for their components
- 4 flat legacy React test files deleted
- Zero `@testing-library/react` imports, zero `jest.` references in owned files
- All 60 tests pass green
- Ready for plan 05-05 (vitest.config.ts / eslint.config.js cleanup of legacy ignores)

---
*Phase: 05-tests*
*Completed: 2026-06-01*
