---
phase: 06-storybook
plan: 06
subsystem: ui
tags: [storybook, solidjs, tanstack-table, storybook-solidjs-vite, vite-plugin-solid, build-gate]

# Dependency graph
requires:
  - phase: 06-storybook-01
    provides: spike validated storybook-solidjs-vite setup, Button story pattern
  - phase: 06-storybook-02
    provides: first story batch ported (6 components)
  - phase: 06-storybook-03
    provides: second story batch ported (8 components)
  - phase: 06-storybook-04
    provides: third story batch ported (9 components)
  - phase: 06-storybook-05
    provides: fourth story batch ported (10 components)

provides:
  - Table.stories.tsx ported to @tanstack/solid-table (createSolidTable + <For> + createSignal)
  - Full build-storybook GREEN: all 33 component stories + gettingStarted.mdx built, 267 modules
  - Suite-wide zero React remnants: zero @storybook/react, zero @moondesignsystem/react imports, zero @tanstack/react-table, zero react imports, zero className, zero useState
  - storybook-static/ output produced (iframe.html, index.html, all chunked assets)
  - vite.config.ts corrected: @vitejs/plugin-react replaced with vite-plugin-solid
  - STORY-02 requirement fulfilled

affects: [phase 7, ci-workflow, chromatic-publishing]

# Tech tracking
tech-stack:
  added: ["@tanstack/solid-table v8.21.3 (createSolidTable, flexRender, getCoreRowModel, createColumnHelper)", "storybook (root devDep, provides CLI)", "tslib (root devDep, required by recast)"]
  patterns: ["createSolidTable with get data() getter for Solid reactivity", "<For each={...}> reactive loops replacing .map()", "createSignal instead of useState for table data signal", "vite-plugin-solid in vite.config.ts"]

key-files:
  created: []
  modified:
    - docs/stories/components/Table.stories.tsx
    - docs/vite.config.ts
    - package.json
    - package-lock.json

key-decisions:
  - "Used createSolidTable with get data() getter pattern (not useReactTable) for Solid reactivity on table data signal"
  - "Moved defaultData + columnHelper + columns outside TanstackTableExample component (static defs, no reactivity needed)"
  - "Preserved both story exports (Table + TableWithTanstackTable) and docs.source.code block updated to Solid API"
  - "storybook + tslib added to root devDependencies so storybook CLI is available in npm workspace"
  - "vite.config.ts alias updated from @moondesignsystem/react to @moondesignsystem/solid"

patterns-established:
  - "Pattern: @tanstack/solid-table in Solid story — createSolidTable + get data() + createSignal + <For> iteration"
  - "Pattern: Static table columns/data defined at module scope outside render function"

requirements-completed: [STORY-02]

# Metrics
duration: 25min
completed: 2026-06-01
---

# Phase 06 Plan 06: Table Story Port + Build Gate Summary

**Table.stories.tsx ported to @tanstack/solid-table with createSolidTable/createSignal/<For>; full build-storybook exits 0 with 267 modules across all 33 component stories + gettingStarted.mdx; zero React remnants suite-wide.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-06-01T00:00:00Z
- **Completed:** 2026-06-01T00:25:00Z
- **Tasks:** 2 automated + 1 checkpoint
- **Files modified:** 4

## Accomplishments

- Ported Table.stories.tsx: `useReactTable` → `createSolidTable`, `useState` → `createSignal`, all `.map()` loops → `<For each={...}>`, all imports from `@tanstack/solid-table`, both story exports preserved with docs descriptions
- Full build-storybook gate: EXIT 0, 267 modules, 50+ chunks (all 33 component stories + gettingStarted.mdx)
- Suite-wide sweep confirmed zero React remnants across docs/stories and docs/.storybook

## Task Commits

1. **Task 1: Port Table.stories.tsx** - `5b202b8` (feat)
2. **Task 2: Suite-wide sweep + build gate fix** - `1f29014` (fix)

**Plan metadata:** (this SUMMARY + state updates)

## Files Created/Modified

- `docs/stories/components/Table.stories.tsx` — Ported from @tanstack/react-table to @tanstack/solid-table; createSolidTable + get data() getter + createSignal + For loops
- `docs/vite.config.ts` — Replaced @vitejs/plugin-react with vite-plugin-solid; updated alias to @moondesignsystem/solid
- `package.json` (root) — Added storybook + tslib to devDependencies (workspace CLI availability)
- `package-lock.json` (root) — Updated lockfile

## Decisions Made

- Table columns defined at module scope (static data, no reactivity needed — matches RESEARCH pattern)
- Both `Table` and `TableWithTanstackTable` story exports preserved; docs.description.story text carried over from original
- The `@moondesignsystem/react` references in gettingStarted.mdx are inside ````typescript` code fences (documentation prose for React users) — not real imports; build confirmed safe

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] vite.config.ts still imported @vitejs/plugin-react**
- **Found during:** Task 2 (build-storybook gate)
- **Issue:** `docs/vite.config.ts` imported `@vitejs/plugin-react` and used `react()` plugin; also had alias `@moondesignsystem/react`. This caused `ERR_MODULE_NOT_FOUND: Cannot find package '@vitejs/plugin-react'` aborting the build.
- **Fix:** Replaced `@vitejs/plugin-react` import with `vite-plugin-solid`, updated `react()` → `solid()`, updated alias to `@moondesignsystem/solid`
- **Files modified:** docs/vite.config.ts
- **Verification:** build-storybook exits 0 after fix
- **Committed in:** 1f29014

**2. [Rule 3 - Blocking] Missing `tslib` dependency caused Cannot find module error**
- **Found during:** Task 2 (first build-storybook attempt)
- **Issue:** `node_modules/recast/main.js` tried to `require('tslib')` but tslib was not installed
- **Fix:** Added `tslib` to root package.json devDependencies; resolved with npm install
- **Files modified:** package.json, package-lock.json
- **Verification:** Error no longer appears
- **Committed in:** 1f29014

**3. [Rule 3 - Blocking] `storybook` CLI not on PATH**
- **Found during:** Task 2 (second build-storybook attempt)
- **Issue:** `storybook build` command not found — `storybook` binary was not in root node_modules/.bin because it is a transitive dep of `storybook-solidjs-vite` but not listed in any workspace's package.json
- **Fix:** Added `storybook` to root devDependencies so the CLI binary is available in the workspace
- **Files modified:** package.json, package-lock.json
- **Committed in:** 1f29014

---

**Total deviations:** 3 auto-fixed (all Rule 3 - blocking)
**Impact on plan:** All three fixes were necessary for the build gate to execute. The vite.config.ts fix was the most significant — it had been left with the React plugin from before the migration.

## Issues Encountered

- The npm workspace had a state issue: `npm install tslib` outside the workspace inadvertently removed 63 packages (storybook core among them). Resolved by installing `storybook` explicitly to root devDependencies, which restored the CLI binary to node_modules/.bin.
- `vite-plugin-solid` was already installed in root node_modules (peer dep of storybook-solidjs-vite), so vite.config.ts fix required no additional npm install.

## Known Stubs

None. Both Table stories render real data: the simple story renders static array rows/cols; the TanStack story renders real `defaultData` through `createSolidTable` with proper column definitions.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 6 is COMPLETE: all 33 component stories ported to Solid CSF, Table on @tanstack/solid-table, build-storybook green
- Phase 7 scope: CLI scaffolder + bin rename, README/CHANGELOG/version bump, Chromatic CI workflow, addon-vitest Playwright setup
- `storybook-static/` is ready for Chromatic upload or GitHub Pages deployment
- Human verify step pending: run `cd docs && npm run dev`, open http://localhost:6006, spot-check Table + other stories

---
*Phase: 06-storybook*
*Completed: 2026-06-01*
