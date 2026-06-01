---
phase: 06-storybook
plan: 01
subsystem: docs
tags: [storybook, solidjs, spike, framework-swap]
dependency_graph:
  requires: [packages/dist (built @moondesignsystem/solid@3.0.0)]
  provides: [storybook-solidjs-vite framework config, Solid Button story, LinksBlock Solid port]
  affects: [docs/.storybook/main.ts, docs/.storybook/preview.ts, docs/package.json, docs/stories/shared/LinksBlock.tsx, docs/stories/components/Button.stories.tsx]
tech_stack:
  added: [storybook-solidjs-vite@10.1.1, vite-plugin-solid@2.11.12, solid-js@1.9.13, @tanstack/solid-table@8.21.3]
  patterns: [createJSXDecorator, import.meta.resolve getAbsolutePath, Solid CSF render (no double-wrapper)]
key_files:
  created: []
  modified:
    - docs/package.json
    - docs/.storybook/main.ts
    - docs/.storybook/preview.ts
    - docs/stories/shared/LinksBlock.tsx
    - docs/stories/components/Button.stories.tsx
decisions:
  - "Use template literal for import.meta.resolve instead of path.join() — path.join on Windows emits backslashes which are invalid ESM module specifiers"
  - "npm install succeeded without --legacy-peer-deps — @solidjs/web optional peer warning is suppressed by npm automatically (Solid 1.x, optional dep)"
  - "stories glob narrowed to Button.stories.@(ts|tsx) for spike build, then restored to full globs for Wave 2"
metrics:
  duration: 3m
  completed_date: 2026-06-01
  tasks_completed: 4
  files_modified: 5
---

# Phase 06 Plan 01: Storybook Framework Spike (STORY-01) Summary

**One-liner:** Swapped docs/ Storybook from @storybook/react-vite to storybook-solidjs-vite@10.1.1 with createJSXDecorator preview and a Solid Button CSF story; spike build-storybook exits 0.

## What Was Built

The docs/ workspace was fully migrated from its React Storybook toolchain to the SolidJS adapter (`storybook-solidjs-vite@10.1.1`). This is the blocking spike gate — no other stories can be ported until this build is verified green.

**Four tasks completed:**

1. **Toolchain swap (docs/package.json):** Removed `@moondesignsystem/react`, `react`, `@storybook/react-vite`, `@vitejs/plugin-react`, `@tanstack/react-table`. Added `@moondesignsystem/solid` (file:../packages), `solid-js@^1.9.13`, `storybook-solidjs-vite@^10.1.1`, `vite-plugin-solid@^2.11.12`, `@tanstack/solid-table@^8.21.3`. Package renamed `moon-react-docs` → `moon-solid-docs`. All 5 addons kept.

2. **main.ts rewrite:** `StorybookConfig` type from `storybook-solidjs-vite`, `framework.name = 'storybook-solidjs-vite'` with docgen options, `import.meta.resolve`-based `getAbsolutePath`, `addon-vitest` entry gets `options: { cli: false }`. Removed `createRequire`.

3. **preview.ts rewrite:** `Preview` type from `storybook-solidjs-vite`, added `createJSXDecorator` wrapping the DOM-manipulation decorator body, kept `withThemeByClassName`, `Story()` call form, all globalTypes/parameters/tags unchanged.

4. **LinksBlock + Button story ported:** LinksBlock converted to Solid component (props.x access, `class` not `className`, NPM href → `@moondesignsystem/solid`). Button story uses `Meta`/`StoryObj` from `storybook-solidjs-vite`, `Button` from `@moondesignsystem/solid`, `ComponentProps` from `solid-js`, render returns `<Button/>` directly (no double-wrapper).

## Spike Build Result

```
npm run build-storybook → EXIT 0

Storybook v10.4.1
228 modules transformed
Button.stories-C2vJPfP1.js built
"Storybook build completed successfully"
```

All 5 addons loaded without crash:
- @storybook/addon-docs: LOADED (autodocs, DocsRenderer built)
- @storybook/addon-a11y: LOADED (axe-myb2 chunk emitted)
- @storybook/addon-themes: LOADED (withThemeByClassName works with Story() call form)
- @storybook/addon-vitest: LOADED (panel registered, no Playwright crash)
- @chromatic-com/storybook: LOADED (framework-agnostic, no issue)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Windows backslash in import.meta.resolve module specifier**
- **Found during:** Task 4 (spike build)
- **Issue:** The research's Pattern 1 uses `path.join(packageName, 'package.json')` inside `import.meta.resolve()`. On Windows, `path.join` produces backslashes, yielding `@chromatic-com\storybook\package.json`, which is not a valid ESM module specifier (ERR_INVALID_MODULE_SPECIFIER).
- **Fix:** Changed to template literal `` `${packageName}/package.json` `` — always forward slashes, cross-platform.
- **Files modified:** `docs/.storybook/main.ts`
- **Commit:** 386bb9c
- **Impact on downstream plans:** All Wave 2/3 story plans on Windows environments must use this form. The RESEARCH.md Pattern 1 is correct on Linux/macOS; this is a Windows-specific deviation.

## Installation Notes

`npm install` completed without `--legacy-peer-deps`. The `@solidjs/web` optional peer dep (Solid 2 only) was silently ignored by npm — no hard error occurred. This matches Pitfall 6 expectation from RESEARCH.md.

## Known Stubs

None. LinksBlock.tsx renders real links (not placeholder data). Button.stories.tsx renders from `@moondesignsystem/solid` built dist.

## Threat Flags

None. This is a static docs build with no authentication, API endpoints, or user data.

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| docs/package.json | FOUND |
| docs/.storybook/main.ts | FOUND |
| docs/.storybook/preview.ts | FOUND |
| docs/stories/shared/LinksBlock.tsx | FOUND |
| docs/stories/components/Button.stories.tsx | FOUND |
| storybook-static/ (build output) | FOUND |
| b7b2add (toolchain swap) | FOUND |
| f7122e6 (storybook config) | FOUND |
| a95f113 (LinksBlock + Button story) | FOUND |
| 386bb9c (Windows fix + glob restore) | FOUND |
