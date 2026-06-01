---
phase: 03-stateful-atoms-carousel
plan: "01"
subsystem: form-atoms
tags: [solid-js, checkbox, input, textarea, tdd, vitest]
dependency_graph:
  requires: []
  provides: [Checkbox.solid, Input.solid, Textarea.solid, vitest-infrastructure]
  affects: [03-05-barrel-wiring]
tech_stack:
  added: [vitest.config.ts, vite-plugin-solid (test), @solidjs/testing-library (test)]
  patterns: [mergeProps+splitProps, inline-class-mergeClasses, no-destructure]
key_files:
  created:
    - packages/vitest.config.ts
    - packages/src/tests/toolchain.test.tsx
    - packages/src/tests/atoms/Checkbox.test.tsx
    - packages/src/tests/atoms/Input.test.tsx
    - packages/src/tests/atoms/Textarea.test.tsx
  modified:
    - packages/src/components/Checkbox.tsx
    - packages/src/components/Input.tsx
    - packages/src/components/Textarea.tsx
    - packages/tsconfig.json
    - packages/src/tests/setupTests.ts
decisions:
  - "Ternary branch for Checkbox (label vs bare) preferred over Show per D-03/plan guidance"
  - "No mergeProps for Checkbox (no prop defaults needed)"
  - "Checkbox label branch: static moon-checkbox on input, caller class on label — exact React parity"
  - "vitest.config.ts matches main branch version; include glob covers src/tests/atoms/**"
  - "tsconfig.json updated: jsx=preserve, jsxImportSource=solid-js, moduleResolution=bundler"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-01"
  tasks_completed: 2
  files_changed: 10
---

# Phase 3 Plan 01: Port Checkbox, Input, Textarea to SolidJS Summary

**One-liner:** Stateless form-input atoms ported to SolidJS with splitProps + mergeClasses class parity and 21 passing vitest tests.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Port Checkbox.tsx to Solid (label + bare branches) | e0a90e0 | Checkbox.tsx, Checkbox.test.tsx, vitest.config.ts, tsconfig.json, setupTests.ts, toolchain.test.tsx |
| 2 | Port Input.tsx and Textarea.tsx to Solid | 507f007 | Input.tsx, Textarea.tsx, Input.test.tsx, Textarea.test.tsx |

## Verification

All acceptance criteria passed:

- `grep -c 'from "react"'` returns 0 for all 3 components
- `grep -c 'className'` returns 0 for all 3 components
- `grep -c 'splitProps'` returns >= 1 for all 3 components
- `export type InputSizes`, `InputVariants`, `TextareaSizes`, `TextareaVariants` all preserved (1 each)
- `npx vitest run src/tests/atoms/Checkbox.test.tsx src/tests/atoms/Input.test.tsx src/tests/atoms/Textarea.test.tsx` passes (21/21 tests)

## Component Patterns

**Checkbox** — no `mergeProps` (no defaults); `splitProps(props, ["class", "label"])`. Two branches:
- Bare: `<input type="checkbox" class={mergeClasses("moon-checkbox", local.class)} {...rest} />`
- Label: `<label class={local.class}><input class="moon-checkbox" {...rest} /><span>{local.label}</span></label>`

**Input** — `mergeProps({ size: "md", variant: "fill", error: false })` + `splitProps(merged, ["class", "type", "size", "variant", "error"])`. Renders `<input type={local.type} class={mergeClasses("moon-input", size-mod, variant-mod, error-mod, local.class)} {...rest} />`.

**Textarea** — identical pattern with `JSX.TextareaHTMLAttributes<HTMLTextAreaElement>` (no Omit needed; no native `size` on textarea). Renders `<textarea class={mergeClasses("moon-textarea", ...)} {...rest} />`.

## Deviations from Plan

### Infrastructure additions (Rule 3 - Blocking)

**[Rule 3 - Blocking] Added vitest test infrastructure to worktree packages/**

- **Found during:** Task 1 setup
- **Issue:** Worktree's `packages/` had no `vitest.config.ts`, old `tsconfig.json` with `jsx: "react-jsx"`, and `setupTests.ts` importing jest variant. Tests could not run.
- **Fix:**
  - Created `packages/vitest.config.ts` (identical to main branch version from Phase 1/2)
  - Updated `tsconfig.json`: `jsx: "preserve"`, `jsxImportSource: "solid-js"`, `moduleResolution: "bundler"`
  - Updated `setupTests.ts`: `@testing-library/jest-dom/vitest`
  - Added `toolchain.test.tsx` (matches main branch, required by vitest include glob)
- **Files modified:** packages/vitest.config.ts (created), packages/tsconfig.json, packages/src/tests/setupTests.ts, packages/src/tests/toolchain.test.tsx (created)
- **Commit:** e0a90e0

## Known Stubs

None — all three components wire real Solid reactivity and forward props correctly.

## Threat Flags

None — pure UI components with no network/auth surface.

## Self-Check: PASSED

- packages/src/components/Checkbox.tsx: FOUND
- packages/src/components/Input.tsx: FOUND
- packages/src/components/Textarea.tsx: FOUND
- packages/src/tests/atoms/Checkbox.test.tsx: FOUND
- packages/src/tests/atoms/Input.test.tsx: FOUND
- packages/src/tests/atoms/Textarea.test.tsx: FOUND
- Commit e0a90e0: FOUND
- Commit 507f007: FOUND
