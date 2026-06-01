---
phase: 04-compound-portal-composite
fixed_at: 2026-06-01T10:17:00Z
review_path: .planning/phases/04-compound-portal-composite/04-REVIEW.md
iteration: 1
findings_in_scope: 8
fixed: 2
skipped: 0
rejected_parity: 6
status: all_fixed
---

# Phase 4: Code Review Fix Report

**Fixed at:** 2026-06-01
**Source review:** .planning/phases/04-compound-portal-composite/04-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: CR-01, CR-04 (CR-02, CR-03, WR-01..WR-04 rejected as parity; IN-01 acknowledged)
- Fixed: 2
- Rejected (parity): 6
- Acknowledged: 1
- Skipped: 0

## Fixed Issues

### CR-01: Select onChange not bridged to onInput

**Files modified:** `packages/src/components/Select.tsx`, `packages/src/tests/atoms/Select.test.tsx`
**Commit:** 06946d3
**Applied fix:**
- Changed `SelectProps` from extending `JSX.SelectHTMLAttributes<HTMLSelectElement>` directly to `Omit<..., "onChange">` with a re-declared `onChange?: JSX.EventHandler<HTMLSelectElement, Event>` prop — identical pattern to Checkbox.
- Added `"onChange"` to the `splitProps` destructure so it is not forwarded via `{...rest}`.
- Added `handleInput: JSX.EventHandler<HTMLSelectElement, InputEvent>` that calls `local.onChange(e as any)` when defined.
- Bound `onInput={handleInput}` on the native `<select>` element.
- Extended `Select.test.tsx`: updated import to include `fireEvent` and `vi`; added test "calls onChange callback when input event fires on the select (onInput bridge)" using `fireEvent.input`; added test "does not throw when onChange is not provided and input event fires".

### CR-04: Drawer.Close + BottomSheet.Close onClick type widened then cast, dropping the event

**Files modified:** `packages/src/components/Drawer.tsx`, `packages/src/components/BottomSheet.tsx`
**Commit:** 36d0ab8
**Applied fix:**
- `DrawerCloseProps.onClick` narrowed from `JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>` to `() => void` (matching React exactly).
- `CloseProps.onClick` in BottomSheet narrowed identically.
- Replaced `(local.onClick as (() => void) | undefined)?.()` with clean `local.onClick?.()` in both Close handler bodies (no cast).

## Rejected Findings (React-parity verified)

### CR-02: Pagination isRTL global querySelector

**Reason:** React original uses the identical `document.querySelector(".moon-pagination")` global query inside a `useMemo`. The multi-instance edge bug exists in React too. Faithful parity — not a Solid-specific regression.

### CR-03: Dialog.Trigger uses `<p>`

**Reason:** React Dialog.Trigger was `<p onClick>{children}</p>`. The CONTEXT decision explicitly keeps Dialog.Trigger as `<p>` (only Drawer/BottomSheet/Dropdown got `display:contents` wrappers because they used `cloneElement`). The block-child HTML quirk exists in React too.

### WR-01: Snackbar root no `{...rest}` spread

**Reason:** React SnackbarProps had no `ComponentProps` spread on root either. No regression introduced.

### WR-02: Pagination activePage not synced after mount

**Reason:** React used `useState(activePage)` with one-shot initialization and no `useEffect` sync — same non-reactive behavior. Not a Solid regression.

### WR-03: Tooltip.Trigger `<p>` wrapper

**Reason:** React Tooltip used `<p>` similarly. Faithful parity.

### WR-04: Authenticator value not synced after mount

**Reason:** React used `useState(value)` one-shot init, no sync. Not a Solid regression.

## Acknowledged Findings

### IN-01: TabList register() static-children caveat

**Reason:** Already documented in code comment. Matches React's `Children.map` static-children assumption. No code change warranted.

---

## Verification Results

- **vitest run:** 35 test files, 254 tests — all passed (exit 0)
- **eslint:** 0 errors, 21 warnings (all pre-existing, none in modified files) — exit 0
- **npm run build:** vite build + solid condition build + tsc declarations — all green (exit 0)

---

_Fixed: 2026-06-01_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
