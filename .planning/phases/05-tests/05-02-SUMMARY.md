---
phase: 05-tests
plan: "02"
subsystem: tests/atoms
tags: [test-migration, solid, portal, atoms]
dependency_graph:
  requires: []
  provides: [atoms/Button.test, atoms/CircularProgress.test, atoms/Dialog.test, atoms/Drawer.test, atoms/Dropdown.test, atoms/Chip.test, atoms/FormGroup.test, atoms/Input.test, atoms/LinearProgress.test]
  affects: [packages/src/tests/atoms/]
tech_stack:
  added: []
  patterns: [render(() => <X/>), vi.fn(), document.body portal query, HTMLDialogElement mock]
key_files:
  created: []
  modified:
    - packages/src/tests/atoms/Button.test.tsx
  deleted:
    - packages/src/tests/Button.test.tsx
    - packages/src/tests/CircularProgress.test.tsx
    - packages/src/tests/Dialog.test.tsx
    - packages/src/tests/Drawer.test.tsx
    - packages/src/tests/Dropdown.test.tsx
decisions:
  - "Dropdown legacy tests not migrated: tested nonexistent state API (defaultOpen/show-hide); Solid component is stateless — atom test correctly covers actual API"
  - "CircularProgress legacy tests not merged: all assertions duplicated or superseded by more precise atom tests"
  - "Dialog legacy tests not merged: atom test already more comprehensive (portal, mock wiring, box/backdrop structure)"
metrics:
  duration: "~3 minutes"
  completed: "2026-06-01"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 05 Plan 02: Legacy React Test Migration to Solid Atoms — Summary

**One-liner:** Merged legacy React onClick/portal coverage into 9 Solid atom tests; git rm'd 5 flat legacy files; 254 atom tests green.

## Tasks Completed

| # | Task | Commit | Key Changes |
|---|------|--------|-------------|
| 1 | Merge legacy Button+CircularProgress; verify Chip/LinearProgress | e46f68b | +onClick vi.fn test to atoms/Button; git rm Button+CircularProgress legacy |
| 2 | Merge legacy Dialog/Drawer/Dropdown portals; verify FormGroup/Input | b732c44 | git rm Dialog+Drawer+Dropdown legacy; 5 atom tests confirmed at parity |

## Verification Results

```
Test Files  34 passed (34)
     Tests  254 passed (254)
```

All 9 owned atom test files pass. Zero `@testing-library/react` imports, zero `jest.` references in owned files.

## What Was Done

**Task 1 — Button + CircularProgress:**
- `atoms/Button.test.tsx`: Added `onClick` handler test (vi.fn + fireEvent.click) from legacy. Existing atom already covered class order, modifier matrix, disabled spread.
- `atoms/CircularProgress.test.tsx`: No gaps found — atom test supersedes legacy (data-value, size modifier, custom class, rest props all covered).
- `atoms/Chip.test.tsx` / `atoms/LinearProgress.test.tsx`: Atom-only files verified at full parity.
- `git rm` packages/src/tests/Button.test.tsx, CircularProgress.test.tsx

**Task 2 — Dialog + Drawer + Dropdown (portals) + FormGroup + Input:**
- `atoms/Dialog.test.tsx`: Already comprehensive — portal-to-body, showModal/close vi.fn mocks, Trigger/Close/Header/box/backdrop. No legacy gaps.
- `atoms/Drawer.test.tsx`: Same — portal-to-body, showModal/close mocks, Header/box/backdrop, Close+onClick handler. No legacy gaps.
- `atoms/Dropdown.test.tsx`: Legacy tested a stateful `defaultOpen` API that does not exist in the Solid component. Atom test correctly covers the actual stateless rendering API. Legacy behavior assertions were invalid.
- `atoms/FormGroup.test.tsx` / `atoms/Input.test.tsx`: Verified at parity. Input test covers class modifiers, type/rest props forwarding.
- `git rm` packages/src/tests/Dialog.test.tsx, Drawer.test.tsx, Dropdown.test.tsx

## Deviations from Plan

**1. [Analysis] Dropdown legacy tests not translatable**
- **Found during:** Task 2
- **Issue:** Legacy Dropdown tests used `defaultOpen` prop and expected show/hide behavior based on click state. The actual Solid Dropdown component has no state — it is a pure rendering wrapper. Legacy tests were testing a different component API.
- **Fix:** Did not add invalid behavior assertions. Atom test already correctly covers the actual Solid Dropdown API (Trigger span display:contents, Content div structure, class merging).
- **Files modified:** None (atom test unchanged)

**2. [Analysis] CircularProgress legacy assertions fully superseded**
- Legacy tested `progressbar` role (not present in Solid component) and basic class assertions already covered by atom test with greater precision. No meaningful unique behavior to migrate.

## Known Stubs

None — all atom tests assert against real component behavior.

## Threat Flags

None — test files only, no new network endpoints or security surface.

## Self-Check: PASSED

- packages/src/tests/atoms/Button.test.tsx: FOUND
- packages/src/tests/atoms/CircularProgress.test.tsx: FOUND
- packages/src/tests/atoms/Dialog.test.tsx: FOUND
- packages/src/tests/atoms/Drawer.test.tsx: FOUND
- packages/src/tests/atoms/Dropdown.test.tsx: FOUND
- packages/src/tests/atoms/Chip.test.tsx: FOUND
- packages/src/tests/atoms/FormGroup.test.tsx: FOUND
- packages/src/tests/atoms/Input.test.tsx: FOUND
- packages/src/tests/atoms/LinearProgress.test.tsx: FOUND
- Commit e46f68b: FOUND
- Commit b732c44: FOUND
- Flat legacy files absent: Button, CircularProgress, Dialog, Drawer, Dropdown — CONFIRMED
