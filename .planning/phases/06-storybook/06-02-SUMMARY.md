---
phase: 06-storybook
plan: 02
subsystem: docs
tags: [storybook, solidjs, stories, csf, solid-js]

requires:
  - phase: 06-01
    provides: storybook-solidjs-vite framework config + LinksBlock Solid port + Button spike

provides:
  - Accordion, Alert, Avatar, Badge, Breadcrumb, IconButton, List, Menu stories ported to Solid CSF
  - StarIcon and UserIcon confirmed as Solid-pure (zero react import)

affects: [06-03, 06-04, 06-05, 06-06]

tech-stack:
  added: []
  patterns:
    - "Solid CSF render: (args) => <X {...args}/> (no double-wrapper)"
    - "For from solid-js replaces .map() in render JSX"
    - "ComponentProps<typeof X> from solid-js for story type"
    - "index() accessor function inside <For> children (not index directly)"

key-files:
  created: []
  modified:
    - docs/stories/shared/icons/StarIcon.tsx
    - docs/stories/shared/icons/UserIcon.tsx
    - docs/stories/components/Accordion.stories.tsx
    - docs/stories/components/Alert.stories.tsx
    - docs/stories/components/Avatar.stories.tsx
    - docs/stories/components/Badge.stories.tsx
    - docs/stories/components/Breadcrumb.stories.tsx
    - docs/stories/components/IconButton.stories.tsx
    - docs/stories/components/List.stories.tsx
    - docs/stories/components/Menu.stories.tsx

key-decisions:
  - "StarIcon/UserIcon were already Solid-pure (no React imports, SVG kebab attrs) — no changes needed, Task 1 was verify-only"
  - "Rebased onto worktree-agent-a30cdd59226da27a6 (06-01 branch) before porting — 06-01 not yet merged to main when worktree was created"
  - "For each={items}>{(_, index) => ...index()...} — index is an accessor fn in Solid For, must call index() not index"

patterns-established:
  - "Pattern: Solid For loop replaces React .map() — key prop removed, index() is a function call"
  - "Pattern: All story imports switch @moondesignsystem/react -> @moondesignsystem/solid and @storybook/react -> storybook-solidjs-vite"

requirements-completed: [STORY-02]

duration: 8min
completed: 2026-06-01
---

# Phase 06 Plan 02: Bulk Port Batch 1 — 8 Stateless Stories + 2 Icons Summary

**8 component stories (Accordion, Alert, Avatar, Badge, Breadcrumb, IconButton, List, Menu) and 2 shared icons converted to Solid CSF; all array renders use `<For>` from solid-js; zero react imports across all 10 owned files.**

## Performance

- **Duration:** ~8 min
- **Completed:** 2026-06-01
- **Tasks:** 3
- **Files modified:** 8 (icons were already clean; 8 story files rewritten)

## Accomplishments

- All 8 stories import `Meta`/`StoryObj` from `storybook-solidjs-vite` and components from `@moondesignsystem/solid`
- All `.map()` array iterations in render fns replaced with `<For each={...}>` from solid-js (Pitfall 5 avoided)
- StarIcon/UserIcon confirmed Solid-pure — no changes required
- IconButton, List, Menu retain `import StarIcon` pointing at the (already Solid) icon
- No className, no double-wrapper render, no React imports in any of the 10 files

## Task Commits

1. **Task 1: StarIcon + UserIcon icons verify** — no commit needed (already clean; verified by grep gate)
2. **Task 2: Accordion, Alert, Avatar, Badge, Breadcrumb** — `3a5d4d5` (feat)
3. **Task 3: IconButton, List, Menu** — `33d7190` (feat)

## Files Created/Modified

- `docs/stories/shared/icons/StarIcon.tsx` — already Solid-pure (no changes); verified zero react
- `docs/stories/shared/icons/UserIcon.tsx` — already Solid-pure (no changes); verified zero react
- `docs/stories/components/Accordion.stories.tsx` — Solid CSF; For loop for item list; two render variants
- `docs/stories/components/Alert.stories.tsx` — Solid CSF; three render variants (base, meta, content)
- `docs/stories/components/Avatar.stories.tsx` — Solid CSF; simple single render
- `docs/stories/components/Badge.stories.tsx` — Solid CSF; simple single render
- `docs/stories/components/Breadcrumb.stories.tsx` — Solid CSF; For loop for breadcrumb items; conditional rendering preserved
- `docs/stories/components/IconButton.stories.tsx` — Solid CSF; keeps `import StarIcon`
- `docs/stories/components/List.stories.tsx` — Solid CSF; For loops in both render variants; keeps `import StarIcon`
- `docs/stories/components/Menu.stories.tsx` — Solid CSF; For loops in both render variants; keeps `import StarIcon`

## Decisions Made

- **Rebase required:** This worktree was created from `main` before 06-01 was merged. Rebased onto `worktree-agent-a30cdd59226da27a6` (the 06-01 branch) to get the ported LinksBlock and Button story as the base before porting any stories.
- **Task 1 verify-only:** StarIcon and UserIcon were already framework-pure with no React imports and SVG kebab-form attributes. No file changes were necessary — verified via grep gate and proceeded directly to Task 2.
- **`index()` in For children:** Solid's `<For>` passes `index` as an accessor function (signal), not a plain number. Used `index()` in template expressions to correctly access the current index value.

## Deviations from Plan

None - plan executed exactly as written. The only notable observation is that Task 1 required no file changes (icons were already clean), but this matches the plan's intent — the task was to verify and confirm, not necessarily to modify.

## Issues Encountered

- Worktree was based on `main` (commit `9181381`) which predates 06-01 work. The parallel executor instructions specify rebasing before work if stories are still `@storybook/react`. Rebased onto the 06-01 worktree branch successfully before porting any files.

## Known Stubs

None. All 8 stories render real component imports from `@moondesignsystem/solid`.

## Threat Flags

None. Static docs build, no auth/API/user data.

## Next Phase Readiness

- Plans 06-03, 06-04, 06-05 can port their assigned story batches on the same 06-01 base
- Plan 06-06 (Wave 3 full build gate) requires all wave-2 plans to complete before running `build-storybook`

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| docs/stories/components/Accordion.stories.tsx | FOUND |
| docs/stories/components/Alert.stories.tsx | FOUND |
| docs/stories/components/Avatar.stories.tsx | FOUND |
| docs/stories/components/Badge.stories.tsx | FOUND |
| docs/stories/components/Breadcrumb.stories.tsx | FOUND |
| docs/stories/components/IconButton.stories.tsx | FOUND |
| docs/stories/components/List.stories.tsx | FOUND |
| docs/stories/components/Menu.stories.tsx | FOUND |
| docs/stories/shared/icons/StarIcon.tsx | FOUND |
| docs/stories/shared/icons/UserIcon.tsx | FOUND |
| 3a5d4d5 (Accordion/Alert/Avatar/Badge/Breadcrumb) | FOUND |
| 33d7190 (IconButton/List/Menu) | FOUND |

---
*Phase: 06-storybook*
*Completed: 2026-06-01*
