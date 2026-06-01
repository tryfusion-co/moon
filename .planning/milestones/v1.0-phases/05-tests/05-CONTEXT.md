# Phase 5: Tests - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning
**Mode:** Auto (--auto) — scope from direct test-dir inspection

<domain>
## Phase Boundary

Migrate the test suite to `@solidjs/testing-library` + Vitest with per-component parity to the original React suite, normalize filenames to PascalCase, and end with one authoritative Solid test per component, full suite green. Covers TEST-01, TEST-02. Removes the legacy-React test ignores from eslint + vitest configs.

</domain>

<decisions>
## Implementation Decisions

### Current test reality (from inspection)
- **19 legacy React test files** in `packages/src/tests/*.test.tsx` (Accordion[as accordion.test.tsx], Alert, Badge, BottomSheet, Breadcrumb, Button, CircularProgress, Dialog, Drawer, Dropdown, IconButton, List, Menu, Pagination, Snackbar, Table, TabList, Tag, Tooltip) — these use `@testing-library/react`, `render(<X/>)`, `jest.fn`, `screen`, `toBeInTheDocument`/`toHaveClass`. They are the ORIGINAL, richer tests, currently IGNORED by eslint + vitest (Phase 1 hardcoded include excluded them).
- **34 minimal Solid atom tests** in `packages/src/tests/atoms/*.test.tsx` (added per-component during Phases 2-4) — already `@solidjs/testing-library`, `render(() => <X/>)`, `vi.fn`. These are the lighter parity/smoke tests.
- **toolchain.test.tsx** — keep as-is (Solid, the Phase-1 gate test).
- **Overlap:** 19 components have BOTH a legacy React test AND an atom test. 15 components (Authenticator, Avatar, Carousel, Checkbox, Chip, FormGroup, Input, LinearProgress, Loader, Placeholder, Radio, SegmentedControl, Select, Switch, Textarea) have ONLY the atom test (no legacy).

### D-01 — Target: ONE authoritative Solid test per component
For each of the 19 components with both files: migrate the legacy React test to Solid and MERGE its richer assertions with the existing atom test into a SINGLE file — do not leave two test files for the same component. Keep the union of meaningful coverage (legacy tests often assert more: onClick handlers, multiple variant combos, edge cases). Drop redundant duplicate assertions.

### D-02 — Test layout (consolidate to ONE location)
Consolidate ALL component tests into `packages/src/tests/` (flat, PascalCase) — the original location. Remove the `src/tests/atoms/` subdir after merging its content up, OR (planner's choice) keep everything in `src/tests/atoms/` and delete the legacy flat files. Pick ONE directory for all component tests. Whatever is chosen, update `vitest.config.ts` `include` glob to cover it, and ensure no stale/duplicate files remain. Recommendation: flat `src/tests/*.test.tsx` (PascalCase) is the original convention — migrate atoms/ tests up to it and remove atoms/ subdir. Keep toolchain.test.tsx in src/tests/.

### D-03 — React→Solid test translation (per file)
- `import { render, screen, fireEvent } from "@testing-library/react"` → `from "@solidjs/testing-library"`
- `render(<Comp .../>)` → `render(() => <Comp .../>)` (function-wrapper form — MANDATORY for Solid)
- `jest.fn()` → `vi.fn()`; `jest.spyOn` → `vi.spyOn`; import `{ vi }` from "vitest" (or rely on globals).
- `className=` in test JSX → `class=`
- Event firing: `fireEvent.change` on inputs → `fireEvent.input` where the component now binds onInput (Checkbox/Switch/Select/Authenticator); keep `fireEvent.click` etc.
- `@testing-library/jest-dom` matchers (toBeInTheDocument, toHaveClass) — already wired via setupTests (`@testing-library/jest-dom/vitest`); keep using them.
- Cleanup: `@solidjs/testing-library` auto-cleanup is on by default in vitest globals; do NOT manually cleanup unless needed. (Addresses the Phase-1 review note WR-05 about missing cleanup.)
- For compound components, render the full compound (e.g. `render(() => <Dialog><Dialog.Trigger/>...</Dialog>)`) and assert real DOM.
- Portal components (Dialog/Drawer/BottomSheet): content portals to document.body — query via `document.body`/`screen` not just the container.

### D-04 — Filename normalization (TEST-02)
`accordion.test.tsx` → `Accordion.test.tsx` (the lone lowercase outlier). All test files PascalCase matching their component. Use `git mv` to preserve history where moving/renaming.

### D-05 — Remove legacy test ignores
- `vitest.config.ts`: the `include` should cover the final single test location; remove any exclusion that was hiding legacy React tests.
- `eslint.config.js`: remove the ignore entry for `src/tests/*.test.tsx` legacy React files (added in earlier phases) so ALL test files are linted. They're Solid now.

### D-06 — Green gate
`cd packages && npx vitest run` — all component test files pass, zero `@testing-library/react` imports remain, zero `jest.` references, all `render(() => ...)` form. `npx eslint .` 0 errors. Build still green (tests don't affect build but run it once to confirm no breakage).

### D-07 — Parity richness
The migrated suite must be AT LEAST as comprehensive as the legacy React suite per component (don't lose coverage by only keeping the lighter atom test). Where the legacy test asserted handler invocation, variant matrices, or edge cases, preserve those (translated to Solid semantics — e.g. onInput for controlled inputs).

### Claude's Discretion
- Final single directory (flat src/tests/ vs src/tests/atoms/) — pick one, be consistent.
- Whether to git mv or rewrite-in-place per file.
- Test grouping/describe structure.

</decisions>

<specifics>
## Specific Ideas

- The legacy Button.test.tsx asserts: default render + role, variant/size/context class matrix, onClick handler (jest.fn) — richer than the minimal atom Button test. Merge preserves the onClick + matrix coverage.
- 15 components have only atom tests — those stay (already Solid), just relocate to the chosen single directory + ensure richness is adequate (they were minimal; optionally enrich, but not required beyond parity with what exists).
- Select test must now assert onInput fires onChange callback (CR-01 fix from Phase 4).
- This phase fixes the Phase-1 review note about `@solidjs/testing-library` cleanup (D-03 auto-cleanup).

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Pattern + decisions
- `.planning/phases/05-tests/05-CONTEXT.md` — this file (D-01..D-07)
- `.planning/research/PITFALLS.md` — testing pitfalls (#7 render(() => <X/>) form, #11 @solidjs/testing-library differences, onInput vs onChange in tests)
- `.planning/research/FEATURES.md` — @solidjs/testing-library API

### Reference Solid tests (already correct — the migration target style)
- `packages/src/tests/atoms/*.test.tsx` — the 34 existing Solid tests (correct render(() => <X/>) form, vi.fn) — these are the style to match + the coverage to merge with legacy
- `packages/src/tests/toolchain.test.tsx` — Solid test, keep
- `packages/src/tests/setupTests.ts` — jest-dom/vitest matchers wired

### Source of truth (the legacy React tests to migrate)
- `packages/src/tests/*.test.tsx` (the 19 React files: accordion.test.tsx + Alert/Badge/BottomSheet/Breadcrumb/Button/CircularProgress/Dialog/Drawer/Dropdown/IconButton/List/Menu/Pagination/Snackbar/Table/TabList/Tag/Tooltip) — migrate to Solid, merge coverage
- `packages/src/components/*.tsx` — the Solid components under test (parity targets)
- `packages/vitest.config.ts`, `packages/eslint.config.js` — remove legacy-test ignores

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- 34 atom tests = correct Solid test style + partial coverage to merge
- setupTests.ts jest-dom matchers already wired
- vitest.config resolve.conditions fix (Phase 1) makes Solid render work in jsdom

### Established Patterns
- render(() => <X/>) function-wrapper form; vi.fn; @solidjs/testing-library auto-cleanup
- onInput for controlled inputs (Checkbox/Switch/Select/Authenticator)
- Portal components query document.body

### Integration Points
- vitest.config.ts include glob + eslint.config.js ignores — both updated to the final single test location and to lint all tests

</code_context>

<deferred>
## Deferred Ideas

- Storybook stories + interaction tests — Phase 6
- CLI + Release — Phase 7
- Optional enrichment beyond parity (more edge-case tests) — could be a future polish, not required for TEST-01/02

</deferred>

---

*Phase: 05-tests*
*Context gathered: 2026-06-01*
