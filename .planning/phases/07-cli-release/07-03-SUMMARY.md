---
phase: 07-cli-release
plan: "03"
subsystem: publish
tags: [npm-publish, dry-run, solid-export-condition, smoke-consumer, milestone-gate, solid-js]

dependency_graph:
  requires:
    - phase: 07-01
      provides: bin/moon-solid (renamed), MOON_SOLID_ARGS enum, package.json bin fix
    - phase: 07-02
      provides: Solid README + CHANGELOG + changeset prepared
  provides:
    - npm publish --dry-run green (exit 0)
    - solid export condition proven end-to-end via smoke consumer
    - whole-repo milestone gate green (build+test+lint+storybook+dry-run)
  affects: [release-readiness, milestone-complete]

tech-stack:
  added: []
  patterns:
    - "solid export condition resolution: --conditions=solid -> dist/index.jsx; default -> dist/index.js"
    - "npm pack + node --conditions=solid import.meta.resolve as smoke test for export condition"

key-files:
  created: []
  modified:
    - "packages/dist/index.jsx (rebuilt - raw JSX solid condition entry)"
    - "packages/dist/index.js (rebuilt - compiled ESM import condition entry)"
    - "packages/dist/index.d.ts (rebuilt - TypeScript types)"

key-decisions:
  - "Used node --conditions=solid import.meta.resolve as the smoke consumer - lightest method that genuinely proves the solid condition resolves to dist/index.jsx end-to-end"
  - "Smoke consumer: npm pack -> install tgz in temp dir -> ESM resolution check; no full Vite app needed"
  - "Task 1 and 3 are verification-only (no source changes); committed as empty/metadata commits documenting exit codes"

requirements-completed: [REL-02, CLI-01, REL-01]

duration: ~15min
completed: 2026-06-01
---

# Phase 07 Plan 03: Publish Dry-Run + Smoke Consumer + Milestone Gate Summary

**npm publish --dry-run exits 0 for @moondesignsystem/solid@3.0.0; solid export condition proven via node --conditions=solid to resolve dist/index.jsx (raw JSX); whole-repo milestone gate green: 278/278 tests, 0 lint errors, 37 Storybook stories, dry-run clean.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-06-01T16:10:39Z
- **Completed:** 2026-06-01T16:25:00Z
- **Tasks:** 3 (+ checkpoint T4)
- **Files modified:** 0 source files (all build/verification)

## Accomplishments

- Fresh `npm run build` produces dist/index.js + dist/index.jsx + dist/index.d.ts with correct dual entry
- `npm publish --dry-run` exits 0; 263-file tarball (71.8 kB) includes dist, cli, bin/moon-solid, src, README, LICENSE; excludes node_modules, tests, .planning; bin/moon-react absent
- Smoke consumer (node --conditions=solid) proves the `solid` export condition resolves to `dist/index.jsx` (raw JSX), not `dist/index.js`; default resolution goes to `dist/index.js` as expected
- dist/components/Button.jsx confirmed to contain raw `<button` JSX (not `createComponent` — babel-preserved for downstream Solid bundlers)
- Whole-repo D-07 milestone gate: packages build (exit 0), vitest 278/278 (35 files, 5.75s), ESLint 0 errors, docs build-storybook (exit 0, 267 modules, 37 stories), npm publish --dry-run (exit 0)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fresh build + npm publish --dry-run + tarball audit** - `8fc2245` (chore)
2. **Task 2: Smoke consumer resolves the solid export condition** - `4bba022` (chore)
3. **Task 3: Whole-repo final milestone validation gate** - `b002d0c` (chore)

**Plan metadata:** (docs commit — see state updates)

## Milestone Gate Evidence

### Step 1: packages npm run build
- Exit code: 0
- Vite built in 542ms; solid-condition script processed 44 source files
- dist/index.js + dist/index.jsx + dist/index.d.ts all produced

### Step 2: packages npx vitest run
- Exit code: 0
- Test Files: 35 passed (35)
- Tests: 278 passed (278)
- Duration: 5.75s

### Step 3: packages npx eslint .
- Exit code: 0
- Output: (none — zero errors, zero warnings)

### Step 4: docs npm run build-storybook
- Exit code: 0
- Storybook 10.4.1
- Vite: 267 modules transformed, built in 7.97s
- Output: storybook-static/

### Step 5: packages npm publish --dry-run
- Exit code: 0
- Package: @moondesignsystem/solid@3.0.0
- Total files: 263
- Package size: 71.8 kB (unpacked: 372.8 kB)
- Tag: latest, access: public (dry-run)
- Result: + @moondesignsystem/solid@3.0.0

## Tarball Audit Results

| Check | Result |
|-------|--------|
| dist/index.js present | PASS |
| dist/index.jsx present | PASS |
| dist/index.d.ts present | PASS |
| bin/moon-solid present | PASS |
| README.md present | PASS |
| LICENSE present | PASS |
| cli/ present | PASS |
| src/ present | PASS |
| node_modules absent | PASS |
| .planning absent | PASS |
| bin/moon-react absent | PASS |
| exports.solid -> dist/index.jsx | PASS |

## Smoke Consumer Results

**Method:** npm pack -> install .tgz in temp dir -> ESM import.meta.resolve with/without --conditions=solid

| Test | Result |
|------|--------|
| Without --conditions=solid (default) | Resolves to dist/index.js (import condition) |
| With --conditions=solid | Resolves to dist/index.jsx (solid condition) |
| dist/index.jsx ends with .jsx | true |
| solid target file exists in installed package | true |
| dist/components/Button.jsx contains raw `<button` JSX | true |
| Button.jsx has no `createComponent` (not pre-compiled) | true |
| SMOKE TEST RESULT | PASS |

Temp dir and .tgz cleaned up after verification — no smoke artifacts committed.

## Decisions Made

- Used `node --conditions=solid import.meta.resolve` as the smoke consumer rather than a full Vite+SolidJS app. This is the lightest method that genuinely proves the `solid` export condition resolves to the correct target. The plan (D-06 discretion) explicitly permits this approach.
- Committed Tasks 1-3 as chore commits despite no source file changes — the verification evidence is load-bearing for the milestone gate record.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. All 5 milestone gate steps passed on first attempt. The Storybook build emits docgen TypeScript warnings ("Skipping docgen... not included in active TypeScript project") for packages/ components — these are pre-existing, non-blocking warnings unrelated to this plan's changes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

This is the LAST plan of the LAST phase. The React->SolidJS migration milestone is complete pending human-verify checkpoint approval (Task 4).

**Post-milestone actions (out of scope, for human/CI):**
- Real `npm publish` (deferred — only dry-run in scope)
- Repo rename if desired (PROJECT.md: keep repo name, out of scope)
- Chromatic CI workflow updates (noted but not required for the dry-run gate)

---

## Self-Check

Checking SUMMARY claims before proceeding.

*Phase: 07-cli-release*
*Completed: 2026-06-01*
