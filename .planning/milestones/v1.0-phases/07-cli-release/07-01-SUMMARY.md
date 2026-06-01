---
phase: "07-cli-release"
plan: "07-01"
subsystem: "cli"
tags: ["cli", "rename", "solid-js", "bin"]
dependency_graph:
  requires: []
  provides: ["moon-solid bin", "MOON_SOLID_ARGS enum", "Solid Button component"]
  affects: ["packages/bin", "packages/package.json", "packages/cli/index.ts", "packages/src/components/Button.tsx"]
tech_stack:
  added: ["solid-js (component authoring)"]
  patterns: ["splitProps", "JSX.ButtonHTMLAttributes", "class= attribute"]
key_files:
  created: []
  modified:
    - "packages/bin/moon-solid (renamed from moon-react)"
    - "packages/package.json (bin key+value: moon-react→moon-solid)"
    - "packages/cli/index.ts (MOON_REACT_ARGS→MOON_SOLID_ARGS)"
    - "packages/src/components/Button.tsx (React→Solid rewrite)"
decisions:
  - "Rewrite Button.tsx using Solid splitProps pattern rather than React.ComponentProps; class= replaces className="
  - "MOON_SOLID_ARGS enum rename is internal-only; public CLI flags (--add-components, --add) are unchanged"
  - "CLI (cli/*.ts) verified framework-agnostic: no React imports, pure fs/execa/prompts logic"
metrics:
  duration: "~10 minutes"
  completed: "2026-06-01"
  tasks_completed: 4
  files_modified: 4
---

# Phase 07 Plan 01: CLI Rename moon-react→moon-solid Summary

Renamed the CLI bin from moon-react to moon-solid (bin file, package.json, internal enum), verified cli/*.ts is framework-agnostic, and rewrote Button.tsx as an idiomatic Solid.js component using splitProps and class= instead of className.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Rename bin/moon-react→bin/moon-solid; fix package.json bin | 2699473 | packages/bin/moon-solid, packages/package.json |
| 2 | Rename MOON_REACT_ARGS→MOON_SOLID_ARGS in cli/index.ts | da1343d | packages/cli/index.ts |
| 3 | Verify cli/*.ts framework-agnostic | (no changes needed) | packages/cli/*.ts verified |
| 4 | Rewrite Button.tsx as Solid.js component; scaffold-typecheck | 9daee29 | packages/src/components/Button.tsx |

## Verification Results

All success criteria passed:

- `packages/bin/moon-react` deleted; `packages/bin/moon-solid` created
- `packages/package.json` bin: `{ "moon-solid": "bin/moon-solid" }` confirmed
- `cli/index.ts`: 4 occurrences of `MOON_SOLID_ARGS`, 0 of `MOON_REACT_ARGS`
- `cli/helpers.ts`, `cli/commands/add.ts`, `cli/components-meta.ts`, `cli/directories-constants.ts`: no React imports or framework-specific logic
- Button.tsx scaffold check: `solid-js` import (2 hits), `splitProps` usage (2 hits), `class=` attribute, no `className`, no `import React`

## Deviations from Plan

### Auto-applied Changes

**1. [Rule 1 - Bug / Plan Requirement] Rewrote Button.tsx from React to Solid.js**
- **Found during:** Task 4 (scaffold-typecheck verification)
- **Issue:** Button.tsx imported from `react`, used `React.ComponentProps<"button">`, `className`, and spread props directly — invalid Solid.js patterns
- **Fix:** Replaced `import React from "react"` with `import { splitProps } from "solid-js"` and `import type { JSX } from "solid-js"`. Replaced `React.ComponentProps<"button">` with `JSX.ButtonHTMLAttributes<HTMLButtonElement>`. Replaced `className` with `class`. Used `splitProps` to separate local props from rest-spread.
- **Files modified:** `packages/src/components/Button.tsx`
- **Commit:** 9daee29

## Self-Check: PASSED

- `packages/bin/moon-solid` exists: PASS
- `packages/bin/moon-react` absent: PASS
- `packages/package.json` bin value `bin/moon-solid`: PASS
- `cli/index.ts` has `MOON_SOLID_ARGS`, no `MOON_REACT_ARGS`: PASS
- CLI files have no React imports: PASS
- `Button.tsx` has `solid-js` imports, `splitProps`, `class=`, no `className`: PASS
- Commits 2699473, da1343d, 9daee29 all exist in git log: PASS
