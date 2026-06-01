---
phase: 06-storybook
plan: 03
subsystem: docs
tags: [storybook, solidjs, story-port, createSignal, wave-2]
dependency_graph:
  requires: [06-01 (storybook-solidjs-vite framework config + Button spike)]
  provides: [Solid CSF stories for Chip, SegmentedControl, Snackbar, Carousel, Checkbox, Input, Textarea, Switch]
  affects:
    - docs/stories/components/Chip.stories.tsx
    - docs/stories/components/SegmentedControl.stories.tsx
    - docs/stories/components/Snackbar.stories.tsx
    - docs/stories/components/Carousel.stories.tsx
    - docs/stories/components/Checkbox.stories.tsx
    - docs/stories/components/Input.stories.tsx
    - docs/stories/components/Textarea.stories.tsx
    - docs/stories/components/Switch.stories.tsx
tech_stack:
  added: []
  patterns:
    - "createSignal (Solid) replaces useState (React) for local story state"
    - "<For each={signal()}> replaces .map() for reactive array iteration in JSX"
    - "Signal getter calls: v() not v when reading signal values"
    - "FormGroup.Label for= not htmlFor= (Solid/HTML attribute)"
key_files:
  created: []
  modified:
    - docs/stories/components/Chip.stories.tsx
    - docs/stories/components/SegmentedControl.stories.tsx
    - docs/stories/components/Snackbar.stories.tsx
    - docs/stories/components/Carousel.stories.tsx
    - docs/stories/components/Checkbox.stories.tsx
    - docs/stories/components/Input.stories.tsx
    - docs/stories/components/Textarea.stories.tsx
    - docs/stories/components/Switch.stories.tsx
decisions:
  - "Signal reads wrapped in derived functions where used as boolean (shouldShowSnackbar = () => isOpen || localIsOpen()) to maintain Solid reactivity tracking"
  - "SegmentedControl.Item index prop removed from <For> render — Solid For provides index() as second arg, not as key prop"
  - "FormGroup.Label htmlFor changed to for — Solid JSX passes HTML attributes directly, htmlFor is a React-specific camelCase alias"
metrics:
  duration: 8m
  completed_date: 2026-06-01
  tasks_completed: 2
  files_modified: 8
---

# Phase 06 Plan 03: Stateful & Simple Story Batch Port Summary

**One-liner:** Ported 8 React CSF stories to Solid CSF — stateful trio (Chip/SegmentedControl/Snackbar) converted useState to createSignal with getter calls; simpler 5 (Carousel/Checkbox/Input/Textarea/Switch) mechanically translated with className→class and .map()→For.

## What Was Built

All 8 stories in this wave-2 batch converted from React to Solid CSF. The key translation rules applied uniformly:

- `import type { Meta, StoryObj } from 'storybook-solidjs-vite'`
- `import { Component } from '@moondesignsystem/solid'`
- `import type { ComponentProps } from 'solid-js'`
- `type Type = ComponentProps<typeof Component>` (not `React.ComponentProps`)
- `render: (args) => <X/>` directly (no double-wrapper)
- `class` not `className`
- Single quotes throughout (matching Button canonical template)

### Stateful conversion (Chip, SegmentedControl, Snackbar)

Each `useState` call became `createSignal`:

```ts
// React
const [localActive, setLocalActive] = useState(false);
...localActive...setLocalActive(!localActive)

// Solid
const [localActive, setLocalActive] = createSignal(false);
...localActive()...setLocalActive(!localActive())
```

Snackbar's `MultipleSnackbars` story uses a signal-backed array rendered with `<For each={snackbars()}>` instead of `.map()`.

SegmentedControl's 3-item loop also changed to `<For each={items}>` with `index()` as a getter.

### Simple translations (Carousel, Checkbox, Input, Textarea, Switch)

Mechanical port only. The Carousel story's `<div className="...">` became `<div class="...">` and its `.map()` became `<For>`. FormGroup.Label changed `htmlFor=` to `for=`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Correctness] shouldShowSnackbar wrapped as derived function**
- **Found during:** Task 1 (Snackbar port)
- **Issue:** `const shouldShowSnackbar = isOpen || localIsOpen()` would capture `localIsOpen()` at render time and not re-evaluate reactively when the signal changes.
- **Fix:** Changed to `const shouldShowSnackbar = () => isOpen || localIsOpen()` so Solid tracks the dependency on `localIsOpen` correctly. The JSX reads `shouldShowSnackbar()`.
- **Files modified:** `docs/stories/components/Snackbar.stories.tsx`
- **Commit:** 7c0d576

**2. [Rule 2 - Correctness] FormGroup.Label htmlFor→for**
- **Found during:** Task 2 (Input, Textarea port)
- **Issue:** The React story uses `htmlFor` which is React's camelCase alias for the HTML `for` attribute. Solid JSX passes attributes directly to DOM, so `htmlFor` would emit `htmlfor=""` on the element, not `for=""`.
- **Fix:** Changed `htmlFor=` to `for=` in both Input and Textarea stories.
- **Files modified:** `docs/stories/components/Input.stories.tsx`, `docs/stories/components/Textarea.stories.tsx`
- **Commit:** ba7905e

## Known Stubs

None. All stories wire to actual @moondesignsystem/solid components.

## Threat Flags

None. Story files are documentation/dev tooling only — no new network endpoints or auth paths.

## Self-Check: PASSED

- All 8 story files exist on disk: FOUND
- Commit 7c0d576 (stateful batch): FOUND
- Commit ba7905e (simple batch): FOUND
