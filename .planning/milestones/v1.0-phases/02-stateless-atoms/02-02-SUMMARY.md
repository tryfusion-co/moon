---
phase: 02-stateless-atoms
plan: 02
subsystem: components
tags: [solid-js, badge, chip, avatar, createSignal, mergeProps, splitProps, tdd]
dependency_graph:
  requires:
    - "Phase 1 toolchain: vite-plugin-solid, vitest, @solidjs/testing-library, jsxImportSource:solid-js"
    - "packages/src/assets/icons/User.tsx (ported Solid icon, Avatar fallback)"
    - "packages/src/helpers/mergeClasses.ts"
    - "packages/src/types/index.ts"
  provides:
    - "Solid Badge atom — splitProps pattern, BadgeVariants type"
    - "Solid Chip atom — createSignal uncontrolled toggle, ChipSizes/ChipVariants types"
    - "Solid Avatar atom — User icon fallback, inline class (D-05), AvatarSizes/AvatarVariants types"
    - "src/tests/atoms/ directory with 3 passing Solid test files"
    - "vitest.config.ts extended to include src/tests/atoms/**/*.test.tsx"
  affects:
    - "packages/src/components/Badge.tsx"
    - "packages/src/components/Chip.tsx"
    - "packages/src/components/Avatar.tsx"
    - "packages/src/tests/atoms/Badge.test.tsx"
    - "packages/src/tests/atoms/Chip.test.tsx"
    - "packages/src/tests/atoms/Avatar.test.tsx"
    - "packages/vitest.config.ts"
tech_stack:
  added: []
  patterns:
    - "mergeProps+splitProps canonical translation (D-01): replaces React destructured defaults"
    - "createSignal getter-call semantics (Chip): active() not active"
    - "Inline mergeClasses in JSX class attr (D-05): not hoisted to const"
    - "local.children || <User /> fallback (Avatar): ternary/|| fine for parity"
    - "TDD RED->GREEN cycle per atom: failing test committed, then source ported"
key_files:
  created:
    - packages/src/tests/atoms/Badge.test.tsx
    - packages/src/tests/atoms/Chip.test.tsx
    - packages/src/tests/atoms/Avatar.test.tsx
  modified:
    - packages/src/components/Badge.tsx
    - packages/src/components/Chip.tsx
    - packages/src/components/Avatar.tsx
    - packages/vitest.config.ts
decisions:
  - "Chip isActive has no mergeProps default — undefined when unset enables uncontrolled mode; controlled when prop is explicitly passed"
  - "Chip class list excludes local.class (matches React original which also omits className from its class list)"
  - "vitest.config.ts include extended to src/tests/atoms/**/*.test.tsx (Rule 3 fix)"
metrics:
  duration: "~10 minutes"
  completed_date: "2026-06-01"
  tasks_completed: 3
  tasks_total: 3
  files_created: 3
  files_modified: 4
---

# Phase 02 Plan 02: Port Badge, Chip, Avatar to SolidJS Summary

**One-liner:** Ported Badge, Chip, and Avatar from React to SolidJS using mergeProps+splitProps canonical pattern; Chip's useState translated to createSignal with getter-call semantics for uncontrolled active toggle; Avatar uses inline class (D-05) and User icon fallback; all 12 Solid tests pass.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 RED | Badge failing tests | bf459e6 |
| 1 GREEN | Port Badge.tsx to Solid | a57afe4 |
| 2 RED | Chip failing tests | 6c59c9a |
| 2 GREEN | Port Chip.tsx to Solid with createSignal | c974183 |
| 3 RED | Avatar failing tests | 0f238c2 |
| 3 GREEN | Port Avatar.tsx to Solid with User fallback | d1d3b20 |

## Decisions Made

- **Chip controlled/uncontrolled:** React's original has a quirk: destructuring `isActive = false` makes `isActive` always falsy, so `isActive ?? active` always resolves to `active` (the signal), and `isActive === undefined` is never true. The Solid port corrects the intent: `isActive` has no mergeProps default (stays `undefined` when not passed), making `local.isActive ?? active()` truly conditional. When the prop is provided it controls; when absent the internal signal controls.
- **Chip class list has no local.class:** The React original does not include `className` in its `mergeClasses(...)` call. Parity preserved.
- **vitest.config.ts extended:** Phase 1 hardcoded `include: ["src/tests/toolchain.test.tsx"]` which blocked running new atom tests. Extended to also include `src/tests/atoms/**/*.test.tsx`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Extended vitest.config.ts include to cover atoms tests**
- **Found during:** Task 1 verification
- **Issue:** vitest.config.ts `include` was hardcoded to only `src/tests/toolchain.test.tsx`; running `npx vitest run src/tests/atoms/Badge.test.tsx` returned "No test files found"
- **Fix:** Added `"src/tests/atoms/**/*.test.tsx"` to the `include` array. Comment updated to explain Phase 01 gate vs Phase 02+ atom tests.
- **Files modified:** packages/vitest.config.ts
- **Commit:** bf459e6 (included with first RED commit)

## TDD Gate Compliance

| Phase | Commit | Type |
|-------|--------|------|
| RED (Badge) | bf459e6 | test(02-02) |
| GREEN (Badge) | a57afe4 | feat(02-02) |
| RED (Chip) | 6c59c9a | test(02-02) |
| GREEN (Chip) | c974183 | feat(02-02) |
| RED (Avatar) | 0f238c2 | test(02-02) |
| GREEN (Avatar) | d1d3b20 | feat(02-02) |

All RED gates confirmed failing before GREEN implementation. All GREEN gates pass 12/12 tests.

## Known Stubs

None. All three components render their class output correctly and Avatar wires to the real User icon component.

## Threat Surface Review

No new network endpoints, auth paths, or file access patterns introduced. Pure render components with no side effects.

## Self-Check

| Check | Result |
|-------|--------|
| packages/src/components/Badge.tsx | FOUND |
| packages/src/components/Chip.tsx | FOUND |
| packages/src/components/Avatar.tsx | FOUND |
| packages/src/tests/atoms/Badge.test.tsx | FOUND |
| packages/src/tests/atoms/Chip.test.tsx | FOUND |
| packages/src/tests/atoms/Avatar.test.tsx | FOUND |
| Commit bf459e6 (Badge RED) | FOUND |
| Commit a57afe4 (Badge GREEN) | FOUND |
| Commit 6c59c9a (Chip RED) | FOUND |
| Commit c974183 (Chip GREEN) | FOUND |
| Commit 0f238c2 (Avatar RED) | FOUND |
| Commit d1d3b20 (Avatar GREEN) | FOUND |
| All 12 tests pass | PASS |

## Self-Check: PASSED
