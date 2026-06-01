---
phase: 04-compound-portal-composite
plan: "04"
subsystem: components
tags: [solidjs, port, table, list, authenticator, compound, stateful, index, createSignal]
dependency_graph:
  requires: []
  provides: [Table-solid, List-solid, Authenticator-solid]
  affects: [packages/src/components/index.ts]
tech_stack:
  added: []
  patterns: [mergeProps+splitProps, Object.assign-compound, let-ref-array, createSignal, Index]
key_files:
  created:
    - packages/src/tests/atoms/Table.test.tsx
    - packages/src/tests/atoms/List.test.tsx
    - packages/src/tests/atoms/Authenticator.test.tsx
  modified:
    - packages/src/components/Table.tsx
    - packages/src/components/List.tsx
    - packages/src/components/Authenticator.tsx
decisions:
  - "Table Root does not merge consumer class into the table element (parity with React source which destructured className but never applied it; class flows through rest only)"
  - "Authenticator uses Index (not For) over Array.from({length}) because slots are positionally-keyed by index and value re-derives from signal on each keystroke"
  - "let inputs: HTMLInputElement[] = [] local array ref (Carousel pattern) — not signal-wrapped since the ref is only accessed imperatively for focus()"
  - "onInput (not onChange) for per-keystroke updates per Solid/DOM convention"
  - "mergeClasses default import (not named) for consistency with Phase 1-3 ported components"
metrics:
  duration: "~12 minutes"
  completed: "2026-06-01"
  tasks_completed: 3
  files_changed: 6
---

# Phase 04 Plan 04: Table, List, Authenticator Solid Port Summary

Ported Table compound (7-part), List compound (3-part), and Authenticator (stateful OTP input) from React 19 to SolidJS using `mergeProps`+`splitProps`, `class` not `className`, `createSignal`+`let` ref array, and `<Index>` iteration. 3 minimal Solid tests written — 23 test cases, all green.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Port Table + List (stateless compounds) | 0cd7dfc | Table.tsx, List.tsx |
| 2 RED | Authenticator failing tests (RED gate) | e684c22 | Authenticator.test.tsx |
| 2 GREEN | Port Authenticator (createSignal + Index) | a4c87fe | Authenticator.tsx |
| 3 | Solid tests for Table + List | 588ffde | Table.test.tsx, List.test.tsx |

## What Was Built

### Table.tsx
- 7-part compound: Root/Head/Body/Foot/Row/HeadCell/Cell/Caption
- Each sub-component uses `splitProps(["class"])` and spreads `{...rest}` onto the native HTML element
- Root uses `mergeProps({ size: "md" })` + `splitProps(["class","size"])` — consumer `class` is NOT merged into the table element (React parity: React source destructured `className` but never used it in the class string)
- `class={mergeClasses("moon-table", size !== "md" && \`moon-table-${size}\`)}`
- `Object.assign(Root, { Head, Body, Foot, Row, HeadCell, Cell, Caption })`
- Zero `@tanstack`, zero `react`, zero `className`
- Preserved: `export type TableSizes = Extract<Sizes, "sm" | "md" | "lg" | "xl">`

### List.tsx
- 3-part compound: Root/Item/Meta
- Root merges consumer `class` into the `ul` element (React parity — React List DID apply className to ul)
- `class={mergeClasses("moon-list", size !== "md" && \`moon-list-${size}\`, local.class)}`
- Item: `<li class={mergeClasses("moon-list-item", local.class)} {...rest}>`
- Meta: `<div class={mergeClasses("moon-list-item-meta", local.class)} {...rest}>`
- Preserved: `export type ListSizes = Extract<Sizes, "sm" | "md" | "lg">`

### Authenticator.tsx
- Single stateful component (no compound)
- `createSignal(local.value)` for internal OTP value
- `let inputs: HTMLInputElement[] = []` — local let array (Carousel pattern), populated via `ref={(el) => (inputs[index] = el)}`
- `<Index each={Array.from({ length: local.length })}>` — positionally-keyed slot rendering
- `onInput` (not `onChange`) per Solid/DOM convention
- `handleChange`: updates signal + fires `onChange?.(next)` + advances focus
- `handleKeyDown`: Backspace on empty slot moves focus backward
- `handlePaste`: T-04-07 sanitization regex `replace(/[^0-9a-zA-Z]/g, "")` preserved
- Preserved: `export type AuthenticatorSizes`, `export type AuthenticatorVariants`
- `import mergeClasses from "../helpers/mergeClasses"` (default import)

## Test Results

```
Test Files  24 passed (24)   [full suite — no regressions]
     Tests  151 passed (151)
```

New tests: `Table.test.tsx` (7 cases), `List.test.tsx` (8 cases), `Authenticator.test.tsx` (8 cases)

## Deviations from Plan

None — plan executed exactly as written.

## TDD Gate Compliance

- RED gate commit: `e684c22` (test(04-04): add failing Authenticator tests — RED gate) — 8 tests failed as expected
- GREEN gate commit: `a4c87fe` (feat(04-04): port Authenticator to SolidJS...) — 8 tests passed

## Threat Surface Scan

T-04-07 mitigation preserved: `handlePaste` sanitizes clipboard input with `clean = pasted.replace(/[^0-9a-zA-Z]/g, "").slice(0, length)` before writing to state. No new threat surface introduced.

## Self-Check

### Files exist:
- `packages/src/components/Table.tsx` — FOUND
- `packages/src/components/List.tsx` — FOUND
- `packages/src/components/Authenticator.tsx` — FOUND
- `packages/src/tests/atoms/Table.test.tsx` — FOUND
- `packages/src/tests/atoms/List.test.tsx` — FOUND
- `packages/src/tests/atoms/Authenticator.test.tsx` — FOUND

### Commits exist:
- `0cd7dfc` feat(04-04): port Table + List — FOUND
- `e684c22` test(04-04): RED gate — FOUND
- `a4c87fe` feat(04-04): port Authenticator — FOUND
- `588ffde` feat(04-04): Table + List tests — FOUND

## Self-Check: PASSED
