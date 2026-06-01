---
phase: 02-stateless-atoms
plan: 04
subsystem: ui
tags: [solid-js, compound-components, alert, breadcrumb, splitProps, mergeProps, testing-library]

# Dependency graph
requires:
  - phase: 01-toolchain-foundation
    provides: Solid build + vitest + @solidjs/testing-library toolchain; ported icons (CloseIcon)
provides:
  - Alert.tsx ported to SolidJS compound atom (Root + Close/Content/Action/Meta via Object.assign)
  - Breadcrumb.tsx ported to SolidJS compound atom (Root + Item via Object.assign)
  - Minimal Solid tests for both compound atoms under src/tests/atoms/
affects: [02-05-barrel-regen, phase-04-compound-components, phase-05-tests]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Compound component via Object.assign(Root, {Sub1, Sub2}) — plain JS, framework-agnostic"
    - "splitProps for all local keys; mergeProps for defaults on Root; no destructuring at parameter level"
    - "CloseIcon fallback in Alert.Close: local.children ? local.children : <CloseIcon />"
    - "JSX.EventHandlerUnion<HTMLElement, MouseEvent> for onClick in compound sub-components"
    - "JSX.LiHTMLAttributes<HTMLLIElement> for li-based item types; {...rest} spread for passthrough"

key-files:
  created:
    - packages/src/tests/atoms/Alert.test.tsx
    - packages/src/tests/atoms/Breadcrumb.test.tsx
  modified:
    - packages/src/components/Alert.tsx
    - packages/src/components/Breadcrumb.tsx

key-decisions:
  - "Alert Root uses mergeProps for variant/context defaults then splitProps — no {...rest} spread matches React original"
  - "Alert.Close uses ternary (not <Show>) for CloseIcon fallback — lower churn, direct parity"
  - "Breadcrumb.Item keeps {...rest} spread — matches React original's ...props spread behavior"
  - "mergeProps omitted from Breadcrumb.Item — no prop defaults needed, splitProps used directly"
  - "displayName lines dropped per D-08 — harmless, not load-bearing"

patterns-established:
  - "Compound component pattern: Object.assign(Root, {Sub1, Sub2}) carries over from React unchanged"
  - "Sub-component splitProps always lists local keys explicitly; rest passed via {...rest} only when needed"

requirements-completed: [ATOM-01]

# Metrics
duration: 15min
completed: 2026-06-01
---

# Phase 02 Plan 04: Alert + Breadcrumb Compound Atoms Summary

**Alert and Breadcrumb ported as SolidJS compound atoms with Object.assign sub-component API, splitProps/mergeProps reactivity pattern, CloseIcon fallback, and 16 passing Solid tests**

## Performance

- **Duration:** 15 min
- **Started:** 2026-06-01T00:49:00Z
- **Completed:** 2026-06-01T00:51:30Z
- **Tasks:** 2 (each TDD: RED + GREEN)
- **Files modified:** 4

## Accomplishments
- Ported Alert.tsx: Root + Close/Content/Action/Meta sub-components via Object.assign; CloseIcon fallback in Close; AlertVariants type name preserved; zero React imports; zero className; zero destructuring
- Ported Breadcrumb.tsx: Root (nav>ol) + Item (li with isActive modifier + {...rest} spread) via Object.assign; zero React imports; zero className
- Created 10 Solid tests for Alert (Root class parity, all sub-components, CloseIcon fallback, onClick handlers) and 6 for Breadcrumb (nav>ol structure, Item active modifier, rest prop spread) — all passing

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Alert test** - `9dedb90` (test)
2. **Task 1 GREEN: Alert implementation** - `32b3aa8` (feat)
3. **Task 2 RED: Breadcrumb test** - `309d04d` (test)
4. **Task 2 GREEN: Breadcrumb implementation** - `17d51c3` (feat)

_TDD tasks have RED (test) + GREEN (feat) commits each_

## Files Created/Modified
- `packages/src/components/Alert.tsx` - Solid compound atom: Root+Close/Content/Action/Meta, mergeProps+splitProps, CloseIcon fallback, AlertVariants exported
- `packages/src/components/Breadcrumb.tsx` - Solid compound atom: Root(nav>ol)+Item(li+isActive+rest), splitProps, Object.assign
- `packages/src/tests/atoms/Alert.test.tsx` - 10 Solid tests: root class, variant/context modifiers, sub-components, CloseIcon fallback, onClick
- `packages/src/tests/atoms/Breadcrumb.test.tsx` - 6 Solid tests: nav>ol nesting, class append, Item active modifier, rest spread

## Decisions Made
- Alert Root: `mergeProps({ variant: "fill", context: "brand" }, props)` then `splitProps` — no `{...rest}` spread because React original didn't spread rest on Root
- Alert.Close: ternary `local.children ? local.children : <CloseIcon />` (not `<Show>`) for direct parity and lower churn
- Breadcrumb.Item: `splitProps(props, ["class", "isActive"])` with `{...rest}` spread preserves passthrough HTML attrs
- Breadcrumb Root: no `mergeProps` needed (no defaults); `splitProps` directly
- `JSX.EventHandlerUnion<HTMLElement, MouseEvent>` for onClick on Close and Action (D-04 mapping)
- `JSX.LiHTMLAttributes<HTMLLIElement>` for BreadcrumbItemProps base (D-04 mapping)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Worktree branch was at old main (pre-Phase 1). Resolved by merging `worktree-agent-aafb284b28f5831ad` (Phase 1 base) into the worktree branch via fast-forward merge before starting implementation. This is expected parallel-executor setup behavior.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Alert and Breadcrumb are fully ported Solid compound atoms, ready for barrel regeneration (plan 02-05)
- Object.assign compound pattern established and verified — reusable for Dialog/Menu/etc. in Phase 4
- All 16 tests green; vitest config already includes `src/tests/atoms/**/*.test.tsx`

---
*Phase: 02-stateless-atoms*
*Completed: 2026-06-01*
