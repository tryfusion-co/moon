---
phase: 03-stateful-atoms-carousel
plan: 04
subsystem: ui
tags: [solid-js, carousel, createSignal, onMount, onCleanup, let-ref, compound-component]

requires:
  - phase: 01-toolchain-foundation
    provides: SolidJS toolchain, vitest, vite-plugin-solid, tsconfig with jsxImportSource
  - phase: 02-stateless-atoms
    provides: canonical atom pattern (splitProps, mergeClasses, class not className, Object.assign compound)

provides:
  - "Carousel.tsx ported to SolidJS with let reelRef, createSignal x2, onMount/onCleanup"
  - "Carousel.test.tsx asserting render structure, signal-driven disabled state, listener cleanup on unmount"
  - "Validation of D-03 pattern: plain let ref, createSignal getter-call, onMount{onCleanup()} effect pattern"

affects:
  - phase-03-05-wiring
  - phase-04-compound-layer

tech-stack:
  added: []
  patterns:
    - "let reelRef!: HTMLDivElement - plain let for single-component DOM ref (not signal-wrapped, not .current)"
    - "createSignal getter-call in JSX: disabled={!canScrollStart()} - parentheses required"
    - "onMount(() => { ...; onCleanup(() => { removeEventListener... }); }) - cleanup inside onMount"
    - "Plain functions replace useCallback - Solid does not recreate per render"

key-files:
  created:
    - "packages/src/tests/atoms/Carousel.test.tsx"
  modified:
    - "packages/src/components/Carousel.tsx"

key-decisions:
  - "D-03 validated: let reelRef!: HTMLDivElement (not useRef, no .current) for single-component DOM refs"
  - "createSignal getter must be called in JSX (canScrollStart() not canScrollStart)"
  - "onCleanup placed inside onMount callback - not at component level"
  - "jsdom updateScrollState sets canScrollEnd=false after mount (scrollWidth=clientWidth=0) - test reflects actual jsdom behavior"

patterns-established:
  - "onMount+onCleanup: effect+cleanup pair for addEventListener/removeEventListener lifecycle"
  - "Plain let ref: reelRef directly accessed (not .current) in Solid component scope"

requirements-completed: [FORM-02]

duration: 18min
completed: 2026-06-01
---

# Phase 03 Plan 04: Carousel SolidJS Port Summary

**Carousel ported to SolidJS with let reelRef, createSignal x2 (getter-called in JSX), plain functions replacing useCallback, and onMount{onCleanup()} replacing useEffect+cleanup; 8-test suite passes including listener-cleanup-on-unmount assertion**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-06-01T09:00:00Z
- **Completed:** 2026-06-01T09:03:25Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Carousel.tsx rewritten: zero React imports, let reelRef, createSignal x2, onMount/onCleanup, compound Root+Item preserved
- All DOM/RTL scroll logic (scrollLeft, getComputedStyle, scrollBy, maxScrollLeft, isRTL) preserved identically
- Carousel.test.tsx: 8 tests covering render structure, signal-driven disabled state, Item class parity, and removeEventListener on unmount
- Validated the D-03 pattern (plain let ref + createSignal getter-call + onMount{onCleanup()}) which recurs in Phase 4

## Task Commits

1. **Task 1: Port Carousel.tsx** - 34ea8ac (feat)
2. **Task 2: Carousel test** - 36cd6db (test)

## Files Created/Modified

- packages/src/components/Carousel.tsx - SolidJS port: let reelRef, createSignal x2, onMount/onCleanup, splitProps, class not className
- packages/src/tests/atoms/Carousel.test.tsx - 8 Solid tests: render, disabled signals, Item parity, listener cleanup

## Decisions Made

- let reelRef!: HTMLDivElement with definite assignment assertion - required for TypeScript strict mode
- canScrollStart() and canScrollEnd() called with parentheses in JSX - Solid signal getter semantics
- onCleanup placed inside onMount callback (not at component root level) per D-03 spec
- Test asserts both controls disabled in jsdom after mount (scrollWidth=clientWidth=0 - maxScrollLeft=0 - canScrollEnd becomes false after updateScrollState runs)
- Worktree was behind main by phase-01/02 commits; rebased onto main before execution (Rule 3: blocking issue auto-fixed)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree branch behind main - rebased before execution**
- **Found during:** Task 1 verification (tsc reported React type errors)
- **Issue:** Worktree branch created from old main (9181381) before phase-01/02 commits; no SolidJS toolchain, tsconfig still set to react-jsx
- **Fix:** git stash && git rebase main && git stash pop - brought worktree up to c37d507 with full SolidJS setup
- **Files modified:** package.json, tsconfig.json, and all phase-01/02 ported files (already committed on main)
- **Verification:** npx tsc --noEmit reports zero Carousel errors after rebase
- **Committed in:** rebase operation (no new commit; existing main commits pulled in)

**2. [Rule 1 - Bug] Test assertion for nextBtn.disabled corrected to match jsdom reality**
- **Found during:** Task 2 (first vitest run)
- **Issue:** Test expected nextBtn.disabled === false (initial signal value true), but onMount runs synchronously and updateScrollState with jsdom 0 dimensions sets canScrollEnd(false)
- **Fix:** Updated test assertion to expect(nextBtn.disabled).toBe(true) with explanatory comment
- **Files modified:** packages/src/tests/atoms/Carousel.test.tsx
- **Verification:** All 8 tests pass
- **Committed in:** 36cd6db (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both required for correct execution and test validity. No scope creep.

## Issues Encountered

- jsdom renders scrollWidth=clientWidth=0, so updateScrollState computes canScrollEnd(false) immediately after mount - test adapted to reflect actual signal behavior

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Carousel.tsx is React-free and SolidJS-correct; ready for wiring in 03-05 (eslint un-ignore, barrel, index.ts export)
- D-03 pattern validated: let ref + createSignal getter-call + onMount{onCleanup()} proven working before Phase-4 compound layer

---
*Phase: 03-stateful-atoms-carousel*
*Completed: 2026-06-01*
