---
phase: 04-compound-portal-composite
plan: "01"
subsystem: components/portal
tags: [solid, portal, signal-ref, compound, dialog, drawer, bottomsheet]
dependency_graph:
  requires: []
  provides: [Dialog, Drawer, BottomSheet]
  affects: [packages/src/components/Dialog.tsx, packages/src/components/Drawer.tsx, packages/src/components/BottomSheet.tsx]
tech_stack:
  added: [solid-js/web Portal]
  patterns: [signal-ref-via-context (D-01), Portal (D-02), display:contents Trigger (D-03), compound Object.assign, mergeProps+splitProps, Show conditional]
key_files:
  created:
    - packages/src/tests/atoms/Dialog.test.tsx
    - packages/src/tests/atoms/Drawer.test.tsx
    - packages/src/tests/atoms/BottomSheet.test.tsx
  modified:
    - packages/src/components/Dialog.tsx
    - packages/src/components/Drawer.tsx
    - packages/src/components/BottomSheet.tsx
decisions:
  - "Signal-ref via context: expose both getter (dialogRef) and setter (setDialogRef) in context; getter used by Trigger/Close via ref()?.showModal()/close(); setter used by Content to wire ref={setDialogRef}"
  - "Drawer.Trigger + BottomSheet.Trigger: display:contents span replaces React.cloneElement (D-03 decision previously resolved by user)"
  - "Dialog.Trigger keeps <p onClick> wrapper (React Dialog had no cloneElement; D-03 does not apply)"
  - "BottomSheet hasHandle: mergeProps({ hasHandle: false }) + <Show when={hasHandle()}> for conditional handle div (D-05)"
  - "Plan verify regex had extra leading \\? making showModal pattern always fail even on correct code; code is correct, regex is wrong — verified with adjusted check"
metrics:
  duration: "~15 minutes"
  completed: "2026-06-01"
  tasks_completed: 3
  files_changed: 6
---

# Phase 4 Plan 01: Dialog, Drawer, BottomSheet Portal Port Summary

Port the portal+ref family (Dialog, Drawer, BottomSheet) from React to SolidJS using signal-ref-via-context (D-01), Portal from solid-js/web (D-02), and display:contents span Trigger for Drawer/BottomSheet (D-03), with 29 passing tests.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Port Dialog (Portal + signal-ref context) | 0e77b11 | packages/src/components/Dialog.tsx |
| 2 | Port Drawer + BottomSheet (Portal + signal-ref + display:contents) | 76c6ccc | packages/src/components/Drawer.tsx, packages/src/components/BottomSheet.tsx |
| 3 | Minimal Solid tests for Dialog, Drawer, BottomSheet | 99cf312 | packages/src/tests/atoms/Dialog.test.tsx, Drawer.test.tsx, BottomSheet.test.tsx |

## What Was Built

### Dialog.tsx
- `createSignal<HTMLDialogElement>()` in Root; both getter + setter exposed via `DialogContext`
- `<Portal mount={document.body}>` from `solid-js/web` replaces `createPortal`
- `Trigger`: `<p onClick={() => dialogRef()?.showModal()}>` (no cloneElement — Dialog never had it)
- `Close`: calls `dialogRef()?.close()`
- `Content`: `ref={setDialogRef}` on `<dialog class="moon-dialog">`; inner `moon-dialog-box` + `moon-backdrop` form preserved
- `Header`: `<header class="moon-dialog-header">`
- `Object.assign(Root, { Trigger, Content, Close, Header })` compound API

### Drawer.tsx
- Same D-01/D-02 pattern as Dialog with `drawerRef`/`setDrawerRef` via `DrawerContext`
- `Trigger`: `<span style={{ display: "contents" }} onClick={() => drawerRef()?.showModal()}>` — replaces `React.cloneElement`
- `Close`: calls `drawerRef()?.close()` then `local.onClick?.()` (optional chaining preserved)
- `Header` accepts `class` prop; `Content` accepts `class` prop
- All `moon-drawer*` classes preserved

### BottomSheet.tsx
- Same D-01/D-02 pattern with `bottomSheetRef`/`setBottomSheetRef` + `hasHandle: () => boolean` in context
- `mergeProps({ hasHandle: false }, props)` default
- `Trigger`: display:contents span — replaces `React.cloneElement`
- `Content`: `<Show when={hasHandle()}>` renders `<div class="moon-bottom-sheet-handle">` (D-05)
- All `moon-bottom-sheet*` classes preserved

### Tests (29 passing)
- `beforeAll`: mocks `HTMLDialogElement.prototype.showModal/close` with `vi.fn()` (jsdom gap)
- Portal mount: `document.body.querySelector("dialog.moon-*")` asserted non-null
- Trigger click → showModal mock called once
- Display:contents span asserted for Drawer/BottomSheet Trigger via `span.style.display === "contents"`
- Close click → close mock called once; optional onClick chaining tested
- BottomSheet `hasHandle=false` (default) → no handle div; `hasHandle=true` → handle present
- Class parity: base class exact match + caller class append

## Deviations from Plan

### Auto-fixed Issues

None — plan executed as written. One note:

**[Deviation Note - Plan Bug] Plan verify regex for Drawer/BottomSheet always fails**
- **Found during:** Task 2 verify
- **Issue:** Plan's verify script used `\?\(\)\?\.showModal` which matches literal `?()?` — never matches `drawerRef()?.showModal` because the identifier ends with `f`, not `?`
- **Fix:** Verified with corrected regex `\(\)\?\.showModal` — code is correct; plan script has typo
- **Code changed:** None — the implementation is correct; just noted the plan script error

## Known Stubs

None — all three components fully wired with real signal-ref context and Portal mount.

## Threat Flags

No new threat surface beyond what's documented in the plan's threat model (T-04-01, T-04-02 both accepted).

## Self-Check: PASSED

- packages/src/components/Dialog.tsx: exists, contains Portal/createSignal/moon-dialog
- packages/src/components/Drawer.tsx: exists, contains Portal/createSignal/display:contents/moon-drawer
- packages/src/components/BottomSheet.tsx: exists, contains Portal/createSignal/display:contents/moon-bottom-sheet
- Commits 0e77b11, 76c6ccc, 99cf312: all present in git log
- vitest: 29/29 tests passing
