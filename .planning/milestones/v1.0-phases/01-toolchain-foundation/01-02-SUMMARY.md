---
phase: 01-toolchain-foundation
plan: 02
subsystem: foundation
tags: [solid-js, icons, splitProps, mergeClasses, types, barrel]
dependency_graph:
  requires:
    - "01-01: Solid toolchain (vite/vitest/eslint configs, jsxImportSource:solid-js)"
  provides:
    - "5 Solid icon components (ChevronDown, ChevronLeft, ChevronRight, Close, User) with prop forwarding"
    - "Verified framework-pure mergeClasses.ts and types/index.ts"
    - "Working barrel generator (generate-barrel.cjs) producing valid components/index.ts"
  affects:
    - "packages/src/assets/icons/*.tsx (all 5 files rewritten)"
    - "packages/scripts/generate-barrel.cjs (renamed from .js)"
    - "packages/package.json (barrels script updated to .cjs)"
tech_stack:
  added: []
  removed: []
  patterns:
    - "splitProps(props, [\"class\"]) for Solid prop forwarding on SVG components"
    - "Component<JSX.SvgSVGAttributes<SVGSVGElement>> as SVG icon type"
    - "fill-rule/clip-rule kebab-case in Solid JSX (not fillRule/clipRule)"
key_files:
  created:
    - packages/scripts/generate-barrel.cjs
  modified:
    - packages/src/assets/icons/ChevronDown.tsx
    - packages/src/assets/icons/ChevronLeft.tsx
    - packages/src/assets/icons/ChevronRight.tsx
    - packages/src/assets/icons/Close.tsx
    - packages/src/assets/icons/User.tsx
    - packages/package.json
  deleted:
    - packages/scripts/generate-barrel.js
decisions:
  - "D-14: All 5 icons ported to Component<JSX.SvgSVGAttributes<SVGSVGElement>> with splitProps(props, [class]); class not className; fill-rule/clip-rule kebab-case in Close and User"
  - "D-13: mergeClasses.ts and types/index.ts confirmed framework-pure; zero changes needed"
  - "D-15: Barrel generator confirmed working; renamed to .cjs to fix ESM/CJS conflict"
metrics:
  duration: "~5 minutes"
  completed_date: "2026-05-31"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 6
  files_deleted: 1
---

# Phase 01 Plan 02: Foundation — Port Icons, Verify Helpers/Types/Barrel Summary

**One-liner:** Ported all 5 SVG icon assets from React FC to Solid `Component<JSX.SvgSVGAttributes<SVGSVGElement>>` with `splitProps` prop forwarding, kebab-case SVG rule attributes, and zero React imports; confirmed mergeClasses and types are framework-pure; fixed and verified the barrel generator by renaming to `.cjs` to resolve ESM/CJS conflict from plan 01's `"type":"module"` addition.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Port 5 icon assets from React FC to Solid Components with prop forwarding | 3d93416 |
| 2 | Verify framework-pure foundation and barrel generator | 5399da9 |

## Decisions Made

- **D-14**: All icons use `splitProps(props, ["class"])` — single `props` arg, no destructuring (solid/no-destructure compliance). `class` attribute (not `className`). Fill-rule and clip-rule in Close.tsx and User.tsx written as kebab-case in JSX source, matching the DOM attributes React would emit. ChevronDown/Left/Right have no rule attributes — only prop forwarding added.
- **D-13**: `mergeClasses.ts` and `types/index.ts` confirmed React-free with zero modifications. Both are framework-pure TypeScript.
- **D-15**: `generate-barrel.js` renamed to `generate-barrel.cjs` (Rule 3 auto-fix) so Node.js treats it as CommonJS despite the package-level `"type":"module"`. Script runs cleanly, indexing 34 components and emitting `export * from "../types"` in the barrel.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Renamed generate-barrel.js to generate-barrel.cjs**
- **Found during:** Task 2
- **Issue:** `packages/package.json` has `"type": "module"` (set in plan 01), which causes Node.js to treat all `.js` files as ES modules. `generate-barrel.js` uses CommonJS `require()`, causing `ReferenceError: require is not defined in ES module scope` at runtime.
- **Fix:** Renamed `scripts/generate-barrel.js` to `scripts/generate-barrel.cjs`. Updated the `barrels` npm script in `package.json` from `node scripts/generate-barrel.js` to `node scripts/generate-barrel.cjs`. The `.cjs` extension forces Node.js to use CommonJS mode regardless of package type. Script content is unchanged — it is framework-agnostic as specified in D-15.
- **Files modified:** `packages/scripts/generate-barrel.cjs` (renamed), `packages/package.json`
- **Commit:** 5399da9

## Known Stubs

None — all 5 icons are fully wired Solid components. The barrel (`components/index.ts`) references React components in Phases 2-4 (not yet ported), but the generator itself is verified working and the barrel content is expected to be updated as components are ported.

## Threat Surface Review

No new network endpoints, auth paths, or file access patterns introduced. The `{...rest}` spread on icon `<svg>` elements is typed `JSX.SvgSVGAttributes<SVGSVGElement>` (T-01-04 — accepted per threat register). SVG path markup is static literal (T-01-05 — accepted).

## Self-Check

| Check | Result |
|-------|--------|
| packages/src/assets/icons/ChevronDown.tsx | FOUND |
| packages/src/assets/icons/ChevronLeft.tsx | FOUND |
| packages/src/assets/icons/ChevronRight.tsx | FOUND |
| packages/src/assets/icons/Close.tsx | FOUND |
| packages/src/assets/icons/User.tsx | FOUND |
| packages/scripts/generate-barrel.cjs | FOUND |
| Commit 3d93416 (Task 1) | FOUND |
| Commit 5399da9 (Task 2) | FOUND |

## Self-Check: PASSED
