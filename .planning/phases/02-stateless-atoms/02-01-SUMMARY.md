---
phase: 02-stateless-atoms
plan: "01"
subsystem: components
tags: [solid, atoms, button, iconbutton, tag, tdd]
dependency_graph:
  requires: [Phase 01 toolchain — solid-js, vitest, vite-plugin-solid, tsconfig preserve]
  provides: [Button solid atom, IconButton solid atom, Tag solid atom, src/tests/atoms/ test directory]
  affects: [packages/src/components/Button.tsx, packages/src/components/IconButton.tsx, packages/src/components/Tag.tsx]
tech_stack:
  added: []
  patterns: [mergeProps+splitProps canonical pattern, JSX.ButtonHTMLAttributes, JSX.HTMLAttributes, TDD red-green]
key_files:
  created:
    - packages/src/tests/atoms/Button.test.tsx
    - packages/src/tests/atoms/IconButton.test.tsx
    - packages/src/tests/atoms/Tag.test.tsx
  modified:
    - packages/src/components/Button.tsx
    - packages/src/components/IconButton.tsx
    - packages/src/components/Tag.tsx
    - packages/vitest.config.ts
decisions:
  - "Tag does not spread rest props onto div (matches React original which also omitted spread)"
  - "Tag default size is 'xs' not 'md' — read from source, confirmed via test"
  - "vitest.config.ts include extended to cover src/tests/atoms/**/*.test.tsx (Rule 3 fix — blocked execution)"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-01"
  tasks_completed: 3
  files_changed: 7
---

# Phase 02 Plan 01: Port Button, IconButton, Tag to SolidJS — Summary

**One-liner:** Three spread atoms (Button, IconButton, Tag) ported React to Solid via mergeProps+splitProps with TDD red-green cycle and 10 passing class-parity tests.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 (RED) | Button test (failing) | df945be | packages/src/tests/atoms/Button.test.tsx, packages/vitest.config.ts |
| 1 (GREEN) | Port Button.tsx | 6da90c8 | packages/src/components/Button.tsx |
| 2 (RED) | IconButton test (failing) | 57255c4 | packages/src/tests/atoms/IconButton.test.tsx |
| 2 (GREEN) | Port IconButton.tsx | bcec6d8 | packages/src/components/IconButton.tsx |
| 3 (RED) | Tag test (failing) | 00d0365 | packages/src/tests/atoms/Tag.test.tsx |
| 3 (GREEN) | Port Tag.tsx | 3caf3b4 | packages/src/components/Tag.tsx |

## Verification

All 10 tests pass:
```
Test Files  3 passed (3)
Tests  10 passed (10)
```

Acceptance criteria verified:
- All three files contain `splitProps` and `mergeProps`
- Zero `from "react"` in all three source files
- Zero `className` in all three source files
- All exported type names preserved: `ButtonSizes`, `ButtonVariants`, `IconButtonSizes`, `IconButtonVariants`, `TagSizes`, `TagVariants`
- `JSX.ButtonHTMLAttributes<HTMLButtonElement>` in Button and IconButton
- `JSX.HTMLAttributes<HTMLDivElement>` in Tag
- Tag mergeProps default for size is `"xs"` (verified by test + grep)
- Modifier order parity with React originals verified by tests

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] vitest include filter prevented running atoms tests**
- **Found during:** Task 1 (RED phase — `npx vitest run src/tests/atoms/Button.test.tsx` returned "No test files found")
- **Issue:** `packages/vitest.config.ts` had `include: ["src/tests/toolchain.test.tsx"]` — a hard filter from Phase 01 that explicitly excluded everything else. The CLI filter argument is overridden by the config `include`.
- **Fix:** Extended `include` to `["src/tests/toolchain.test.tsx", "src/tests/atoms/**/*.test.tsx"]` with a comment explaining Phase 02 atoms addition. Toolchain test unaffected.
- **Files modified:** `packages/vitest.config.ts`
- **Commit:** df945be (included in the Button RED commit)

**2. [Rule 3 - Blocking] Worktree branch was behind main (missing Phase 01 toolchain)**
- **Found during:** Initial setup — worktree branch `worktree-agent-ae78d595a3c9676e7` was at pre-Phase01 commit `9181381` (no solid-js, no vitest.config.ts, old react-jsx tsconfig)
- **Fix:** `git rebase main` to bring worktree up to date with Phase 01 completed toolchain
- **Impact:** None to code; enabled all subsequent work

## TDD Gate Compliance

RED to GREEN cycle followed for each atom:
1. `test(02-01)` commit (RED gate) — tests written and confirmed failing before implementation
2. `feat(02-01)` commit (GREEN gate) — implementation added, all tests pass

RED confirmation for each:
- Button: 1 of 4 tests failed (class prop test — React used className, not class)
- IconButton: 1 of 3 tests failed (same className vs class issue)
- Tag: 1 of 3 tests failed (class prop not applied by React version)

## Known Stubs

None — all three atoms render their full class output from props; no hardcoded empty values, no placeholder text. Children flow through correctly in Tag.

## Threat Flags

None — these are pure render functions with no network, no auth paths, no file access, no schema changes.

## Self-Check: PASSED

Files exist:
- packages/src/components/Button.tsx — FOUND
- packages/src/components/IconButton.tsx — FOUND
- packages/src/components/Tag.tsx — FOUND
- packages/src/tests/atoms/Button.test.tsx — FOUND
- packages/src/tests/atoms/IconButton.test.tsx — FOUND
- packages/src/tests/atoms/Tag.test.tsx — FOUND

Commits exist (verified via git log):
- df945be — FOUND (test RED Button + vitest fix)
- 6da90c8 — FOUND (feat GREEN Button)
- 57255c4 — FOUND (test RED IconButton)
- bcec6d8 — FOUND (feat GREEN IconButton)
- 00d0365 — FOUND (test RED Tag)
- 3caf3b4 — FOUND (feat GREEN Tag)
