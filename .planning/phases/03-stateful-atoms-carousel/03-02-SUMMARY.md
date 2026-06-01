---
phase: 03-stateful-atoms-carousel
plan: "02"
subsystem: form-atoms
tags: [solid, form, compound, onInput, tdd]
dependency_graph:
  requires: [02-05]
  provides: [FormGroup-solid, Switch-solid]
  affects: [03-05]
tech_stack:
  added: []
  patterns:
    - "Object.assign compound (FormGroup Root+Label+Hint)"
    - "onInput internal binding with public onChange prop preserved (D-02)"
    - "mergeProps defaults + splitProps local/rest"
key_files:
  created:
    - packages/src/components/FormGroup.tsx
    - packages/src/components/Switch.tsx
    - packages/src/tests/atoms/FormGroup.test.tsx
    - packages/src/tests/atoms/Switch.test.tsx
  modified: []
decisions:
  - "Switch public API keeps onChange: () => void; internal DOM binding is onInput (D-02 / Pitfall 9)"
  - "Label subcomponent uses class verbatim with no base class, matching React original"
  - "mergeProps used for Switch size default only; FormGroup has no defaults requiring mergeProps"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-01"
  tasks_completed: 2
  tasks_total: 2
  files_created: 4
  files_modified: 2
---

# Phase 3 Plan 02: FormGroup + Switch Solid Port Summary

FormGroup compound (Root+Label+Hint) and Switch ported to SolidJS using mergeProps+splitProps; Switch wires onInput internally while keeping public onChange prop for API parity.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Port FormGroup.tsx (TDD) | 74fa1d8 | FormGroup.tsx, FormGroup.test.tsx |
| 2 | Port Switch.tsx with onInput wiring (TDD) | 8cc2ebd | Switch.tsx, Switch.test.tsx |

## What Was Built

### FormGroup.tsx (Solid compound component)

- `RootProps`: `JSX.HTMLAttributes<HTMLDivElement> & { error?: boolean; class?: string; children?: JSX.Element }`
- `LabelProps`: `JSX.LabelHTMLAttributes<HTMLLabelElement> & { class?: string; children?: JSX.Element }`
- `HintProps`: `JSX.HTMLAttributes<HTMLParagraphElement> & { class?: string; children?: JSX.Element }`
- Root: `splitProps(props, ["class", "error", "children"])` — `mergeClasses("moon-form-group", error && "moon-form-group-error", class)`
- Label: `splitProps(props, ["class", "children"])` — `class={local.class}` verbatim (no base class, React parity)
- Hint: `splitProps(props, ["class", "children"])` — `mergeClasses("moon-form-hint", local.class)`
- `const FormGroup = Object.assign(Root, { Label, Hint }); export default FormGroup;`

### Switch.tsx (Solid with onInput wiring)

- Exported type `SwitchSizes = Extract<Sizes, "2xs" | "xs" | "sm">` preserved unchanged
- `SwitchProps`: `Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "size"> & { onChange?: () => void; ... }`
- `mergeProps({ size: "sm" } as const, props)` for default
- `splitProps(merged, ["onChange", "size", "label", "class"])` — rest spread to input
- Internal `handleInput: JSX.EventHandler<HTMLInputElement, InputEvent>` calls `local.onChange()` if defined
- DOM input binds `onInput={handleInput}` — NOT `onChange` — per D-02 / Pitfall 9
- Code comment explains: React's `onChange` fires on toggle (native `input` event); Solid's `onChange` fires only on blur (native `change` event)

## Test Results

- `FormGroup.test.tsx`: 10 tests pass — Root class parity (base, error, caller class, rest prop), Label (class verbatim, no-class, rest prop), Hint (base class, caller class)
- `Switch.test.tsx`: 8 tests pass — default class, size="xs"/size="2xs" modifiers, caller class, label text, wrapping label element, `fireEvent.input` triggers onChange spy

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — both components are fully wired pass-through components with no data stubs.

## Threat Flags

None — no new network endpoints, auth paths, or trust-boundary changes introduced.

## Self-Check: PASSED

- [x] `packages/src/components/FormGroup.tsx` exists and is React-free
- [x] `packages/src/components/Switch.tsx` exists and is React-free
- [x] `packages/src/tests/atoms/FormGroup.test.tsx` exists, 10 tests pass
- [x] `packages/src/tests/atoms/Switch.test.tsx` exists, 8 tests pass
- [x] Commit 74fa1d8 exists (FormGroup + test)
- [x] Commit 8cc2ebd exists (Switch + test)
- [x] `grep -c 'from "react"' FormGroup.tsx` = 0
- [x] `grep -c 'className' FormGroup.tsx` = 0
- [x] `grep -c 'Object.assign' FormGroup.tsx` = 1
- [x] `grep -c 'from "react"' Switch.tsx` = 0
- [x] `grep -c 'className' Switch.tsx` = 0
- [x] `grep -v '^ *//' Switch.tsx | grep -c 'onInput'` = 1
- [x] `grep -v '^ *//' Switch.tsx | grep -c 'onChange={'` = 0
