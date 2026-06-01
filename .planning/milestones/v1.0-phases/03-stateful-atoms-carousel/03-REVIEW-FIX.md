---
phase: 03-stateful-atoms-carousel
fixed_at: 2026-06-01T09:24:00Z
review_path: .planning/phases/03-stateful-atoms-carousel/03-REVIEW.md
iteration: 1
findings_in_scope: 3
fixed: 3
skipped: 0
status: all_fixed
---

# Phase 3: Code Review Fix Report

**Fixed at:** 2026-06-01T09:24:00Z
**Source review:** .planning/phases/03-stateful-atoms-carousel/03-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 3 (CR-02, WR-01, WR-02) + WR-03 documented per deferred instructions
- Fixed: 3
- Skipped: 0

## Fixed Issues

### CR-02: Checkbox onChange not bridged to onInput

**Files modified:** `packages/src/components/Checkbox.tsx`, `packages/src/tests/atoms/Checkbox.test.tsx`
**Commit:** 8157f88
**Applied fix:** Added `"onChange"` to `splitProps` keys so it is removed from `rest`. Omitted `"onChange"` from the `CheckboxProps` base `JSX.InputHTMLAttributes` type. Added `handleInput: JSX.EventHandler<HTMLInputElement, InputEvent>` that invokes `local.onChange` with the event cast. Bound `onInput={handleInput}` on both the with-label and bare input branches (spread `{...rest}` still follows so other props are not lost). Extended Checkbox tests with three new cases: onChange fires via fireEvent.input on bare checkbox, onChange fires via fireEvent.input on label-branch checkbox, no throw when onChange is omitted.

### WR-01: Switch caller onInput in rest overrides internal bridge

**Files modified:** `packages/src/components/Switch.tsx`
**Commit:** 04db5fa
**Applied fix:** Added `"onInput"` to the `splitProps` key list (`["onChange", "onInput", "size", "label", "class"]`) so a caller-supplied `onInput` is removed from `rest` and cannot override the internal `onInput={handleInput}` binding.

### WR-02: Radio.Group context holds plain string, not accessor

**Files modified:** `packages/src/components/Radio.tsx`
**Commit:** ac13e79
**Applied fix:** Changed `RadioGroupCtx` type from `{ name: string }` to `{ name: () => string }`. Changed Provider value from `{{ name: local.name }}` to `{{ name: () => local.name }}`. Updated Root consumer from `group?.name` to `group?.name()`. Dynamic `name` prop changes on `Radio.Group` now propagate reactively to all child Radio inputs.

## Additional: WR-03 Static-children comment (documented per deferred instructions)

**Files modified:** `packages/src/components/SegmentedControl.tsx`
**Commit:** c45f675
**Applied fix:** Added a three-line comment above the `counter` declaration noting that `register()` assumes static children only (matches React original's `Children.map` approach) and directing callers to use explicit `index` props for dynamic lists. No logic change.

## Skipped Issues

None — all in-scope findings were fixed.

---

## Rejected / Deferred (not in fix scope)

- **CR-01** (rejected-parity): React original `Control` has identical `onClick` override order (`onClick={handler}` then `{...props}`). Solid port faithfully matches. No regression — pre-existing React behavior.
- **IN-01** (rejected-parity): React original also initialises `canScrollEnd` to `true`. Changing to `false` would diverge from React. Left as-is.
- **WR-04** (left): Dead `size` field in SegmentedControl context is harmless and mirrors the vestigial React behavior. No change to avoid churn/divergence.

---

## Verification Results

| Check | Result |
|-------|--------|
| `npx vitest run` (all 21 test files, 128 tests) | PASS |
| `npx eslint .` | 0 errors, 11 pre-existing warnings |
| `npm run build` (vite + solid-condition + tsc) | PASS |

---

_Fixed: 2026-06-01T09:24:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
