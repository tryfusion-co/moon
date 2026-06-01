---
phase: 03-stateful-atoms-carousel
plan: 05
subsystem: ui
tags: [solid-js, eslint, vite, vitest, barrel, tree-shaking, carousel, checkbox, input, textarea, switch, radio, segmented-control, form-group]

# Dependency graph
requires:
  - phase: 03-01
    provides: Checkbox, Input, Textarea ported to SolidJS with tests
  - phase: 03-02
    provides: FormGroup, Switch ported to SolidJS with tests
  - phase: 03-03
    provides: Radio, SegmentedControl ported to SolidJS with tests
  - phase: 03-04
    provides: Carousel ported to SolidJS with tests
provides:
  - Barrel (src/components/index.ts) regenerated including all 8 new components
  - src/index.ts explicit export list extended to 20 components (12 atoms + 8 new) with preserved type names
  - eslint.config.js un-ignores all 8 new component files; browser globals configured
  - Full build+test+lint gate confirmed green (dual .js+.jsx+.d.ts, 125 tests, 0 eslint errors)
  - FORM-01 (7 form atoms) and FORM-02 (Carousel) closed
affects: [phase-04, phase-05, storybook, any consumer of @moondesignsystem/solid]

# Tech tracking
tech-stack:
  added: [globals (browser env for eslint flat config)]
  patterns:
    - "Explicit export list in src/index.ts keeps unported Phase-4 components out of the build graph"
    - "Barrel (src/components/index.ts) auto-generated via npm run barrels — never hand-edited"
    - "eslint ignores block uses negated entries (!src/components/X.tsx) to un-ignore per-phase"
    - "Browser globals added via globals.browser in eslint languageOptions for DOM component files"
    - "_-prefixed function type parameter names bypass no-unused-vars for intentionally unused type params"

key-files:
  created: []
  modified:
    - packages/src/index.ts
    - packages/src/components/index.ts
    - packages/eslint.config.js
    - packages/src/components/Carousel.tsx
    - packages/src/components/SegmentedControl.tsx
    - packages/src/tests/atoms/Radio.test.tsx

key-decisions:
  - "Kept explicit export list in src/index.ts (not export * from './components') to prevent unported Phase-4 components from entering the build graph"
  - "Added globals.browser to eslint languageOptions to resolve window/getComputedStyle in DOM component files without disabling rules"
  - "Used _ prefix convention for unused function-type parameter names (no-unused-vars argsIgnorePattern/varsIgnorePattern ^_)"

patterns-established:
  - "Barrel script handles ComponentSizes/ComponentVariants patterns; manually-named types (ScrollDirections) must be added to src/index.ts explicitly"
  - "Phase gate: barrel regeneration via npm run barrels always precedes build (prebuild hook)"

requirements-completed: [FORM-01, FORM-02]

# Metrics
duration: 20min
completed: 2026-06-01
---

# Phase 3 Plan 05: Phase-3 Wiring & Gate Summary

**8 SolidJS-ported components (Checkbox, Input, Textarea, FormGroup, Switch, Radio, SegmentedControl, Carousel) wired into the published build graph via explicit src/index.ts exports, regenerated barrel, and un-ignored in eslint; dual build+test+lint gate green**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-06-01T09:05:00Z
- **Completed:** 2026-06-01T09:12:30Z
- **Tasks:** 2 automated (+ 1 checkpoint)
- **Files modified:** 6

## Accomplishments
- Regenerated `src/components/index.ts` barrel via `npm run barrels` (34 components, idempotent)
- Extended `src/index.ts` explicit export list from 12 to 20 components, adding all 8 new components with their preserved type names (ScrollDirections, InputSizes/InputVariants, TextareaSizes/TextareaVariants, SwitchSizes, SegmentedControlSizes)
- Added 8 negated un-ignore entries in eslint.config.js for new component files; added browser globals to eliminate no-undef errors for window/getComputedStyle
- Full gate: `npm run build` (dual .js+.jsx+.d.ts for all 8 new components), `vitest run` (125/125), `eslint .` (0 errors) all green

## Task Commits

Each task was committed atomically:

1. **Task 1: Regenerate barrel, extend src/index.ts, un-ignore in eslint** - `87b69f8` (feat)
2. **Task 2: Build + test + lint gate** - `1a2c096` (fix — auto-fixed lint errors discovered during gate run)

**Plan metadata:** _(to be committed with SUMMARY.md)_

## Files Created/Modified
- `packages/src/index.ts` - Extended explicit export list from 12 to 20 ported components + their type names
- `packages/src/components/index.ts` - Regenerated barrel (all 34 components; no hand edits)
- `packages/eslint.config.js` - Added 8 un-ignore entries; added globals.browser; added no-unused-vars pattern config
- `packages/src/components/Carousel.tsx` - Renamed onScrollDirection callback type param to _direction
- `packages/src/components/SegmentedControl.tsx` - Renamed setActiveIndex type params to _idx in both type defs
- `packages/src/tests/atoms/Radio.test.tsx` - Removed unused fireEvent import

## Decisions Made
- Kept explicit export list approach in src/index.ts (not `export * from "./components"`) to prevent the ~14 unported Phase-4 components (Dialog, Drawer, Menu, Accordion, Table, etc.) from entering the build graph
- Added `globals.browser` to eslint's `languageOptions` rather than adding `/* global window */` inline comments — cleaner, applies to all component/test files
- Used `_` prefix convention with `argsIgnorePattern`/`varsIgnorePattern: "^_"` for function type parameter names in TS type definitions — standard convention, preserves documentation value

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed eslint no-undef errors for browser globals (window, getComputedStyle)**
- **Found during:** Task 2 (gate run)
- **Issue:** Carousel.tsx uses `window.addEventListener` and `getComputedStyle()` — both browser globals not recognized because no globals config was set
- **Fix:** Added `globals: { ...globals.browser }` to eslint config `languageOptions` and imported `globals` package
- **Files modified:** packages/eslint.config.js
- **Verification:** `npm run lint` exits 0
- **Committed in:** 1a2c096

**2. [Rule 1 - Bug] Fixed eslint no-unused-vars for type-level parameter names**
- **Found during:** Task 2 (gate run)
- **Issue:** `direction` in `onScrollDirection: (direction: ScrollDirections) => void` and `idx` in `setActiveIndex: (idx: number) => void` type definitions flagged as unused by `no-unused-vars`
- **Fix:** Renamed to `_direction`/`_idx` per underscore convention; added `argsIgnorePattern`/`varsIgnorePattern: "^_"` to eslint no-unused-vars rule config
- **Files modified:** packages/eslint.config.js, packages/src/components/Carousel.tsx, packages/src/components/SegmentedControl.tsx
- **Verification:** `npm run lint` exits 0
- **Committed in:** 1a2c096

**3. [Rule 1 - Bug] Removed unused fireEvent import from Radio.test.tsx**
- **Found during:** Task 2 (gate run)
- **Issue:** `fireEvent` imported from `@solidjs/testing-library` but never used in the test file
- **Fix:** Removed unused import
- **Files modified:** packages/src/tests/atoms/Radio.test.tsx
- **Verification:** `npm run lint` exits 0, `npm run test` still 125/125
- **Committed in:** 1a2c096

---

**Total deviations:** 3 auto-fixed (all Rule 1 - bug/correctness)
**Impact on plan:** All auto-fixes required for the lint gate to pass. No scope creep — component behavior unchanged.

## Issues Encountered
- Carousel.test.tsx line 104 used `vi.spyOn(window, ...)` — also required browser globals fix to pass lint (resolved by the same globals config addition)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 3 fully complete: 20 components in build graph, dual artifacts emitted, tests green, lint clean
- FORM-01 (7 form atoms) and FORM-02 (Carousel) closed
- Phase 4 can proceed with next set of components (unported React components remain ignored in eslint)
- No blockers

## Known Stubs
None — all exports wired to real SolidJS implementations ported in Wave 1 (plans 03-01 through 03-04).

---
*Phase: 03-stateful-atoms-carousel*
*Completed: 2026-06-01*
