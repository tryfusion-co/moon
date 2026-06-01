---
phase: 04-compound-portal-composite
plan: 02
subsystem: components
tags: [solid, compound, overlay, menu, port]
dependency_graph:
  requires: []
  provides: [Dropdown, Menu, Select, Tooltip, Snackbar]
  affects: [packages/src/components, packages/src/tests/atoms]
tech_stack:
  added: []
  patterns: [mergeProps+splitProps, display:contents Trigger, Show-gated conditional, Object.assign compound]
key_files:
  created:
    - packages/src/tests/atoms/Dropdown.test.tsx
    - packages/src/tests/atoms/Menu.test.tsx
    - packages/src/tests/atoms/Select.test.tsx
    - packages/src/tests/atoms/Tooltip.test.tsx
    - packages/src/tests/atoms/Snackbar.test.tsx
  modified:
    - packages/src/components/Dropdown.tsx
    - packages/src/components/Menu.tsx
    - packages/src/components/Select.tsx
    - packages/src/components/Tooltip.tsx
    - packages/src/components/Snackbar.tsx
decisions:
  - "Dropdown.Trigger uses display:contents span (tabIndex/role on wrapper, not child) replacing React.cloneElement — documented DOM divergence per D-04"
  - "Snackbar.Root uses <Show when={local.isOpen}> instead of isOpen && <div> to prevent falsy-leak in SolidJS"
  - "Select keeps native onChange (not onInput) — selects fire change on selection, correct per PITFALLS #9"
metrics:
  duration: ~10 minutes
  completed: 2026-06-01
  tasks_completed: 3
  files_created: 5
  files_modified: 5
---

# Phase 4 Plan 02: Overlay/Menu Family Port Summary

Port of Dropdown, Menu, Select, Tooltip, Snackbar from React to SolidJS with display:contents Trigger, Show-gated open, and exact class/type-name parity.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Port Dropdown (display:contents) + Menu | c15dbf2 | Dropdown.tsx, Menu.tsx |
| 2 | Port Select, Tooltip, Snackbar | ec1ce71 | Select.tsx, Tooltip.tsx, Snackbar.tsx |
| 3 | Minimal Solid tests (5 components) | 7615e2a | 5 test files in src/tests/atoms/ |

## What Was Built

Five overlay/menu components ported from React to SolidJS:

- **Dropdown**: `Root` (div.moon-dropdown) + `Trigger` (display:contents span, tabIndex/role) + `Content` (div.moon-dropdown-content). Zero cloneElement — the `display:contents` span wraps the arbitrary child providing tabIndex/role without generating a layout box.
- **Menu**: `Root` (ul.moon-menu + size modifier) + `Item` (li.moon-menu-item) + `Meta` (div.moon-menu-item-meta). `MenuSizes` type preserved.
- **Select**: `Root` (select.moon-select + size/variant/error modifiers, `{...rest}` spread) + `Option` (option) + `OptionGroup` (optgroup). `SelectSizes` and `SelectVariants` types preserved. Native `onChange` kept (not bridged to onInput).
- **Tooltip**: `Root` (div.moon-tooltip + position/hasPointer modifiers) + `Trigger` (p) + `Content` (div.moon-tooltip-content). `TooltipPositions` type preserved.
- **Snackbar**: `Root` wrapped in `<Show when={local.isOpen}>` (zero falsy leak) + `Action`/`Meta`/`Group` sub-components. `SnackbarVariants` type preserved.

All 5 components: `mergeProps` + `splitProps` (no destructure), `class` not `className`, `{...rest}` on native elements, `Object.assign` compound API, zero `from "react"` / `cloneElement` / `className`.

## Test Results

38 tests across 5 files — all pass.

- Dropdown: 7 tests (root class, Trigger display:contents/role/tabIndex, child render, Content class/tabIndex)
- Menu: 8 tests (ul class, size modifiers sm/md/lg, Item li class, Meta div class)
- Select: 10 tests (select class, size/variant/error modifiers, rest spread name attr, Option, OptionGroup)
- Tooltip: 8 tests (div class, position modifiers, hasPointer, Trigger p, Content div class)
- Snackbar: 8 tests (isOpen=true renders, isOpen=false=null Show gate, variant/context modifiers, Action/Meta/Group)

## Deviations from Plan

None — plan executed exactly as written.

The display:contents Trigger pattern, Show-gated Snackbar, and type exports all follow plan instructions precisely.

## Known Stubs

None.

## Threat Flags

None — both T-04-03 and T-04-04 have `accept` disposition per plan threat model. The `{...rest}` spread on Select is 1:1 with the React version's spread surface. The display:contents Trigger adds one DOM node (span) vs React's cloneElement approach — documented divergence, no security impact.

## Self-Check

- [x] packages/src/components/Dropdown.tsx — exists, contains display:contents, zero cloneElement/className
- [x] packages/src/components/Menu.tsx — exists, MenuSizes exported
- [x] packages/src/components/Select.tsx — exists, SelectSizes/SelectVariants exported
- [x] packages/src/components/Tooltip.tsx — exists, TooltipPositions exported
- [x] packages/src/components/Snackbar.tsx — exists, SnackbarVariants exported, Show present
- [x] Commits c15dbf2, ec1ce71, 7615e2a confirmed in git log
- [x] 38 vitest tests green

## Self-Check: PASSED
