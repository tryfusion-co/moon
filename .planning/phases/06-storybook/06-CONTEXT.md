# Phase 6: Storybook - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning
**Mode:** Auto (--auto) — scope from direct docs/ inspection; this phase carries the HIGH-risk Storybook compat unknown → research + a Button-story SPIKE gate are mandatory

<domain>
## Phase Boundary

Migrate the `docs/` Storybook workspace from React to SolidJS: swap the framework to `storybook-solidjs-vite` (Storybook 10), port all 37 stories to Solid CSF, port the 4 shared docs React files, and make `build-storybook` succeed. Covers STORY-01 (framework swap + single-story spike validates renderer + addons) and STORY-02 (all 37 stories rewritten + Table story uses @tanstack/solid-table + build green).

**THIS IS THE HIGHEST-RISK PHASE.** `storybook-solidjs-vite` is community-maintained (solidjs-community org) and may lag/diverge from Storybook 10 core, especially the addons (@storybook/addon-vitest needs Playwright; @chromatic-com/storybook visual regression). A single Button-story SPIKE must validate the renderer + ALL addons BEFORE bulk-porting 37 stories. If the spike fails, decide a fallback (pin Storybook 9, or drop the incompatible addon) before proceeding.

</domain>

<decisions>
## Implementation Decisions

### D-00 — SPIKE FIRST (STORY-01, blocking gate)
Before porting any other story:
1. Swap `docs/package.json` deps + `.storybook/main.ts` framework + `.storybook/preview.ts` to `storybook-solidjs-vite`.
2. Port ONLY Button.stories.tsx + the shared files it needs (LinksBlock).
3. Run `npm run build-storybook` (and ideally `storybook dev` smoke) and verify: the Solid renderer works, autodocs renders, a11y addon loads, themes decorator works, AND the vitest + chromatic addons don't crash the build.
4. ONLY if the spike build is green → proceed to bulk-port the remaining 36 stories. If an addon is incompatible, STOP and surface a decision (pin SB9 / remove addon / replace) — do NOT bulk-port onto a broken base.
The research phase (gsd-phase-researcher) MUST establish the exact current storybook-solidjs-vite version, its Storybook-10 compatibility, the correct `framework` name, addon compatibility (especially addon-vitest + chromatic), and the Solid CSF `render` signature.

### D-01 — Toolchain/deps swap (docs/package.json)
- `@moondesignsystem/react` (file:../packages) → `@moondesignsystem/solid` (file:../packages) — the local lib is now named solid; update the dependency name + all story imports.
- `react` → `solid-js`.
- `@storybook/react-vite` → `storybook-solidjs-vite` (version per research, ~10.x).
- `@vitejs/plugin-react` → `vite-plugin-solid` (Storybook's vite builder uses it).
- `@tanstack/react-table` → `@tanstack/solid-table` (only the Table story uses it).
- Keep: @tailwindcss/vite, tailwindcss, chromatic, typescript, vite. Keep the storybook addons (a11y/docs/themes/vitest/chromatic) at SB10 versions UNLESS research/spike shows an incompatibility requiring a change.
- Rename docs package `moon-react-docs` → `moon-solid-docs` (cosmetic).

### D-02 — .storybook/main.ts
- `framework: { name: "@storybook/react-vite" }` → `framework: { name: "storybook-solidjs-vite", options: {} }`.
- `import type { StorybookConfig } from "@storybook/react-vite"` → from `storybook-solidjs-vite`.
- Keep stories globs, staticDirs, addons list (pending spike), managerHead (gtag/icon/style) unchanged.

### D-03 — .storybook/preview.ts
- `import type { Preview } from "@storybook/react-vite"` → from `storybook-solidjs-vite`.
- `withThemeByClassName` from `@storybook/addon-themes` — keep (framework-agnostic decorator) unless spike shows it needs the Solid variant.
- The custom decorator `(Story, context) => { ...; return Story(); }` — in Solid CSF the decorator/story-return shape may differ (Story() call). Research the Solid CSF decorator signature; adjust so the dir/theme DOM manipulation + Story render still works.
- Keep globalTypes (direction LTR/RTL), parameters (storySort, controls matchers, a11y test:"todo"), tags:["autodocs"].

### D-04 — Story files (37 *.stories.tsx) — STORY-02
Per story, the Solid CSF translation:
- `import type { Meta, StoryObj } from "@storybook/react"` → from `storybook-solidjs-vite`.
- `import { X } from "@moondesignsystem/react"` → `from "@moondesignsystem/solid"`.
- `type Type = React.ComponentProps<typeof X>` → `ComponentProps<typeof X>` from `solid-js` (or the story's prop type).
- `render: (args) => <X {...args}/>` — **CORRECTED by research (06-RESEARCH.md)**: storybook-solidjs-vite@10 uses the SAME signature as React CSF — `render: (args) => <X {...args}/>`. NO double-wrapper `() => () =>`. The double-wrapper was a pre-v9 pattern and renders a function object to the DOM in v10. Story render fns that destructure args + build conditional props (like Button's `render: ({variant,size,...}) => ...`) keep the logic and return `<X .../>` directly.
- JSX in render fns: `className`→`class` if any; React event types → Solid.
- `StoryObj`/`Meta` generics + `args` stay structurally the same.
- mdx (gettingStarted.mdx) — verify it still renders under Solid autodocs; adjust imports if it pulls React components.

### D-05 — Shared docs files (4 React FCs → Solid)
- `stories/shared/LinksBlock.tsx`, `Version.tsx`, `icons/StarIcon.tsx`, `icons/UserIcon.tsx` — port React FC → Solid Component (splitProps, class not className, JSX.Element children, zero react import). Same atom pattern as packages icons. LinksBlock is used in many stories' docs container.
- `stories/utils/component-links.ts` / `.json` — likely framework-agnostic data; verify.

### D-06 — Table story tanstack
`Table.stories.tsx` imports `@tanstack/react-table` (useReactTable, flexRender, getCoreRowModel, etc.) → `@tanstack/solid-table` (createSolidTable, flexRender, getCoreRowModel). The Solid tanstack API differs (createSolidTable + accessor-based columns + Solid reactivity). Research the @tanstack/solid-table API for the equivalent of the story's TanstackTableExample. This is the most complex single story.

### D-07 — Build gate (STORY-02)
`cd docs && npm install && npm run build-storybook` exits 0 with all 37 stories built. Optionally `storybook dev` smoke. The docs `file:../packages` link must resolve the renamed `@moondesignsystem/solid` package (built dist). Ensure `npm run build` in packages/ ran first so docs consumes built output.

### Open questions for research (gsd-phase-researcher MUST answer)
1. Exact `storybook-solidjs-vite` version compatible with Storybook 10.3.x; the correct `framework` package name + StorybookConfig/Preview type imports.
2. Does `@storybook/addon-vitest@10.3.3` work with `storybook-solidjs-vite`? (officially React/Vue-focused — may need removal or a workaround). Does `@chromatic-com/storybook@5.1.1` work with the Solid adapter?
3. The exact Solid CSF `render` signature (`(args) => () => <X/>` vs `(args) => <X/>`) and decorator signature for SB10 + storybook-solidjs-vite.
4. Does the `withThemeByClassName` addon-themes decorator work unchanged with the Solid renderer?
5. @tanstack/solid-table createSolidTable API mapping for the Table story.
6. CSF3 + autodocs + mdx compatibility with the Solid adapter.

### Claude's Discretion
- If an addon is incompatible: prefer removing/replacing the single addon over pinning all of Storybook to 9 — but surface the choice if it materially reduces docs functionality.
- Story-by-story render-fn structure as long as output + controls match.

</decisions>

<specifics>
## Specific Ideas

- Verified docs/ state: Storybook 10.3.3, framework @storybook/react-vite, 5 addons (chromatic 5.1.1, addon-docs, addon-a11y, addon-vitest, addon-themes), @vitejs/plugin-react, @tanstack/react-table 8.21.3. 37 component stories + gettingStarted.mdx. Shared: LinksBlock, Version, StarIcon, UserIcon. Custom preview decorator does dir + theme DOM class swapping.
- Button.stories: Meta/StoryObj from @storybook/react, render destructures variant/size/context and conditionally spreads, returns <Button>Button</Button>. Solid form returns `() => <Button.../>`.
- Stories import the LIB by package name (@moondesignsystem/react → /solid), not relative — so the rename + a built dist is required.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Pattern + decisions
- `.planning/phases/06-storybook/06-CONTEXT.md` — this file (D-00 spike gate is BLOCKING)
- `.planning/research/STACK.md` — flagged storybook-solidjs-vite as the Solid adapter + Storybook-10 compat as the primary MEDIUM-confidence risk; addon-vitest + chromatic unverified
- `.planning/research/SUMMARY.md` — Phase 6 spike-first recommendation
- `.planning/research/PITFALLS.md` — storybook-solidjs (old, deprecated) vs storybook-solidjs-vite (correct); Solid CSF render wrapper

### Source of truth
- `docs/package.json`, `docs/.storybook/main.ts`, `docs/.storybook/preview.ts`, `docs/vite.config.ts`, `docs/tsconfig.json`
- `docs/stories/components/*.stories.tsx` (37 stories — Button.stories.tsx is the spike target; Table.stories.tsx is the tanstack-complex one)
- `docs/stories/shared/LinksBlock.tsx`, `Version.tsx`, `icons/StarIcon.tsx`, `icons/UserIcon.tsx`
- `docs/stories/gettingStarted.mdx`
- `packages/src/index.ts` — the @moondesignsystem/solid public API the stories consume (built dist)
- `packages/src/components/*.tsx` — Solid component props the stories type against

### Phase 1-5 precedent
- `packages/src/assets/icons/*.tsx` — Solid icon pattern for porting the docs shared icons
- The renamed `@moondesignsystem/solid` package (packages/package.json) — docs depends on it

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Solid icon pattern (packages icons) — docs StarIcon/UserIcon reuse it
- The built @moondesignsystem/solid dist — docs consumes via file:../packages

### Established Patterns
- All 37 components are Solid + exported from src/index.ts (Phase 4) — stories import them by name
- Solid CSF render wrapper (() => <X/>) — the testing-lib render(() =>) precedent from Phase 5 is analogous

### Integration Points
- docs/ is a separate npm workspace; `file:../packages` link; needs packages built first
- chromatic.config.json, .github/workflows/chromatic.yml — CI references @storybook/react-vite build; may need update (note but CI is out of strict scope unless build-storybook needs it)

</code_context>

<deferred>
## Deferred Ideas

- CLI scaffolder + bin rename — Phase 7
- README/CHANGELOG/version bump/publish — Phase 7
- chromatic CI workflow tuning beyond making build-storybook green — Phase 7 or post-milestone (note if encountered)

</deferred>

---

*Phase: 06-storybook*
*Context gathered: 2026-06-01*
