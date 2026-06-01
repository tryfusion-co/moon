---
phase: 01-toolchain-foundation
plan: 01
subsystem: toolchain
tags: [solid-js, vite, vitest, eslint, tsconfig, package-identity]
dependency_graph:
  requires: []
  provides:
    - "@moondesignsystem/solid@3.0.0 package identity and exports map"
    - "vite lib build config with vite-plugin-solid and solid export condition"
    - "vitest config with mandatory browser-conditions fix"
    - "ESLint flat config with solid/no-destructure enforced"
    - "tsconfig jsx:preserve + jsxImportSource:solid-js in both tsconfigs"
    - "stub entry point deferring components barrel to Phase 2"
  affects:
    - "packages/package.json (renamed, re-versioned, new deps)"
    - "packages/tsconfig.json + tsconfig.build.json (jsx changed)"
    - "packages/src/index.ts (now points to stub)"
tech_stack:
  added:
    - "solid-js@^1.9.13 (peer + dev)"
    - "vite@^7.3.1"
    - "vite-plugin-solid@^2.11.12"
    - "vitest@^4.1.7"
    - "jsdom@^26.0.0"
    - "@solidjs/testing-library@^0.8.10"
    - "@testing-library/jest-dom@^6.9.1"
    - "eslint-plugin-solid@~0.14.5"
    - "@typescript-eslint/parser@^8.0.0"
    - "typescript-eslint@^8.0.0"
    - "@eslint/js@^9.39.4"
  removed:
    - "react + react-dom peer deps"
    - "@types/react + @types/react-dom"
    - "jest + ts-jest + jest-environment-jsdom"
    - "@testing-library/react"
    - "eslint-plugin-react-hooks + eslint-plugin-react-refresh"
    - "barrelsby"
  patterns:
    - "vite lib mode with preserveModules for tree-shaking"
    - "solid export condition in exports map"
    - "resolve.conditions:browser + ssr.resolve.conditions:browser in vitest"
    - "ESLint 9 flat config with eslint-plugin-solid typescript preset"
key_files:
  created:
    - packages/vite.config.ts
    - packages/vitest.config.ts
    - packages/eslint.config.js
    - packages/src/_stub.ts
  modified:
    - packages/package.json
    - packages/tsconfig.json
    - packages/tsconfig.build.json
    - packages/src/index.ts
    - packages/src/tests/setupTests.ts
    - .gitignore
  deleted:
    - packages/jest.config.js
decisions:
  - "D-01: Build with vite build --lib + vite-plugin-solid (not tsup)"
  - "D-02: preserveModules output with .jsx entryFileNames for solid condition"
  - "D-03: solid export condition mandatory in exports map"
  - "D-05: Renamed to @moondesignsystem/solid@3.0.0"
  - "D-06: solid-js@^1.9.13 peer dep, react/react-dom removed"
  - "D-07: jsx:preserve + jsxImportSource:solid-js in both tsconfigs"
  - "D-08: vitest replaces jest; @solidjs/testing-library replaces @testing-library/react"
  - "D-09: resolve.conditions browser fix in vitest.config.ts (non-negotiable)"
  - "D-10: jest.config.js deleted; setupTests migrated to jest-dom/vitest"
  - "D-11: eslint-plugin-solid flat config with solid/no-destructure:error"
metrics:
  duration: "~3 minutes"
  completed_date: "2026-05-31"
  tasks_completed: 3
  tasks_total: 3
  files_created: 4
  files_modified: 6
  files_deleted: 1
---

# Phase 01 Plan 01: Toolchain Swap to SolidJS Summary

**One-liner:** Swapped the entire library toolchain from React to SolidJS: renamed package to @moondesignsystem/solid@3.0.0, installed vite+vitest+eslint-plugin-solid, rewrote both tsconfigs to jsx:preserve+jsxImportSource:solid-js, created vite lib build with solid export condition, added mandatory resolve.conditions browser fix in vitest, enabled solid/no-destructure in ESLint flat config, and wired stub entry to defer components barrel to Phase 2.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Swap deps + package identity in packages/package.json | 653004f |
| 2 | Rewrite tsconfigs for Solid JSX + stub entry + delete jest.config.js | f014dd7 |
| 3 | Add vite.config.ts, vitest.config.ts, eslint.config.js, update setupTests | d29e6f8 |

## Decisions Made

- **D-01/D-02/D-03**: Vite lib build with `vite-plugin-solid`, `preserveModules: true`, `.jsx` entryFileNames, and mandatory `solid` export condition in `exports.".".solid` pointing to `./dist/index.jsx`
- **D-05**: Package renamed `@moondesignsystem/react` → `@moondesignsystem/solid`, version `3.0.0`
- **D-06**: `solid-js@^1.9.13` peer dep; react/react-dom/all-react-types removed from all dep categories
- **D-07**: Both tsconfigs updated to `jsx: preserve` + `jsxImportSource: solid-js`; `moduleResolution: bundler`; `composite: true` removed from tsconfig.json; `emitDeclarationOnly: true` added to tsconfig.build.json
- **D-09**: vitest.config.ts includes the non-negotiable `resolve.conditions: ["development", "browser"]` + `ssr.resolve.conditions: ["browser"]` fix from PITFALLS.md Pitfall 10
- **D-10/D-11**: Jest config deleted; eslint-plugin-solid flat config with `solid/no-destructure: "error"` created

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed `eslint.config.js` from root .gitignore**
- **Found during:** Task 3 commit
- **Issue:** Root `.gitignore` had `eslint.config.js` as an ignored pattern (last line), preventing `packages/eslint.config.js` from being staged.
- **Fix:** Removed the `eslint.config.js` line from root `.gitignore`. The file was likely added to gitignore during an earlier iteration and was no longer intentional.
- **Files modified:** `.gitignore`
- **Commit:** d29e6f8 (included in Task 3 commit)

## Known Stubs

- `packages/src/_stub.ts` — exports `MOON_SOLID_TOOLCHAIN_READY = true`. This is an intentional stub per the plan; Phase 2 will replace `src/index.ts` to re-export the real components barrel.
- `packages/src/index.ts` — points to stub only (`export * from "./_stub"`). The `src/components/` barrel is deferred to Phase 2 to allow toolchain validation (plan 01-03) to run independently.

## Threat Surface Review

No new network endpoints, auth paths, or file access patterns were introduced. The exports map change (adding `solid` condition) is documented in T-01-01 in the plan's threat register — disposition: mitigate, and the mitigation is in place (`files` array restricts to `dist`, no wildcard exports).

## Self-Check

### Files Created

| Check | Result |
|-------|--------|
| packages/vite.config.ts | FOUND |
| packages/vitest.config.ts | FOUND |
| packages/eslint.config.js | FOUND |
| packages/src/_stub.ts | FOUND |
| .planning/phases/01-toolchain-foundation/01-01-SUMMARY.md | FOUND |
| Commit 653004f (task 1) | FOUND |
| Commit f014dd7 (task 2) | FOUND |
| Commit d29e6f8 (task 3) | FOUND |

## Self-Check: PASSED
