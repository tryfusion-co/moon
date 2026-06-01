# Project Research Summary

**Project:** Moon Design System -- React-to-SolidJS Port
**Domain:** SolidJS component library authoring and npm package publishing
**Researched:** 2026-05-31
**Confidence:** HIGH

## Executive Summary

Moon is a 37-component React design system being ported 1:1 to SolidJS and republished as `@moondesignsystem/solid@3.0.0`. The migration is a mechanical framework swap -- same public API, same Tailwind class output, same DOM -- not a redesign. The React surface actually used is deliberately narrow (no `useMemo`, no `forwardRef`, no headless libs, no Suspense), which makes the port tractable: every React pattern maps to a known SolidJS equivalent. The largest mechanical change is `mergeProps` + `splitProps` on all 37 components, which replaces React's argument-destructuring convention and is required for Solid's reactivity to function.

The recommended toolchain is: **`vite build --lib` + `vite-plugin-solid`** for the library build (see bundler decision below), **Vitest** replacing Jest, **`@solidjs/testing-library`** replacing `@testing-library/react`, **`eslint-plugin-solid`** replacing React ESLint plugins, and **`storybook-solidjs-vite`** (v10.1.1, solidjs-community/storybook) replacing `@storybook/react-vite`. The solid-js target version is **1.9.13** (PROJECT.md says 1.8 -- the research corrects this to the current stable). The migration build order is strictly bottom-up: helpers/types/icons, then stateless atoms, then stateful atoms, then compound/portal, then composite -- each layer depends only on layers below it.

The three highest risks are: (1) props destructuring silently breaking reactivity in all 37 components -- mitigated by enabling `eslint-plugin-solid/no-destructure` in Phase 1 before any component is touched; (2) `storybook-solidjs-vite` community-maintenance lag against Storybook 10 -- mitigated by a single-story spike before porting all 37 stories; (3) the `React.cloneElement` call in `Drawer.Trigger` -- the only non-mechanical translation in the library, requiring a deliberate design decision (wrapper span vs display:contents vs documented DOM change) rather than a straight substitution.

---

## Bundler Decision: vite-lib wins over tsup-preset-solid

STACK.md and ARCHITECTURE.md disagree on the library bundler. This is resolved here -- one choice only.

**Decision: `vite build --lib` + `vite-plugin-solid`.**

Rationale, in order of decision criteria:

1. **Maintenance status.** STACK.md documents that `tsup-preset-solid` last released December 2023 (v2.2.0). That is 2.5 years stale as of research date. `tsup` itself is no longer actively maintained. ARCHITECTURE.md's claim that it is "actively maintained (GitHub active as of 2025)" is contradicted by the release record -- GitHub activity (stars, forks, issues) is not the same as maintained releases. The STACK researcher explicitly verified this against the npm release history. Stale dependency, out.

2. **Already in repo.** The `docs/` workspace already runs Vite. Using `vite build --lib` adds zero new dependencies to the monorepo.

3. **Export condition coverage.** Vite lib mode with `vite-plugin-solid` reliably emits: the `solid` export condition (pointing to `.jsx` files with preserved JSX for SolidStart consumers), the `import` condition (pre-compiled ESM), and `.d.ts` via `declaration: true` in tsconfig. `preserveModules: true` produces one file per source file -- tree-shakeable equivalent to the old `tsc` output.

**How the `solid` export condition is produced with vite-lib:**

The `solid` condition is written manually in `package.json`. `tsup-preset-solid`'s main selling point was auto-generating this field -- with vite-lib, one writes it once and it does not change. This is a one-time cost, not an ongoing maintenance burden. `vite-plugin-solid` sets `entryFileNames: '[name].jsx'` and `preserveModules: true` in rollupOptions to emit JSX-preserved output for the `solid` condition, and pre-compiled `.js` for the `import` condition.

**Fallback note:** If a blocker emerges with vite-lib during Phase 1, `tsdown` + `unplugin-solid` (pre-1.0, Rolldown-powered) is the next option to evaluate -- not `tsup-preset-solid`.

---

## Key Findings

### Recommended Stack

The core runtime is `solid-js@^1.9.13` with JSX handled exclusively by `vite-plugin-solid@^2.11.12`. TypeScript must use `"jsx": "preserve"` + `"jsxImportSource": "solid-js"` -- using `"react-jsx"` lets TypeScript transform JSX before Solid's compiler sees it, destroying reactivity. Both `tsconfig.json` (editor) and any build-specific tsconfig must carry these settings.

Testing moves entirely to Vitest (`^4.1.7`) + `@solidjs/testing-library@^0.8.10`. The `resolve.conditions: ["development", "browser"]` + `ssr.resolve.conditions: ["browser"]` settings in `vitest.config.ts` are non-negotiable as of `vite-plugin-solid@2.11.9+` -- without them, Vitest's SSR pipeline resolves Solid's server builds in a jsdom environment, producing "Client-only API called on server side" failures. ESLint migrates to `eslint-plugin-solid@~0.14.5` (pin tilde, not caret -- pre-1.0, minor versions may break) with ESLint 9 flat config.

**Core technologies:**
- `solid-js@^1.9.13`: UI runtime + JSX types -- current stable, 2.0-experimental not production-ready
- `vite-plugin-solid@^2.11.12`: Only official Solid JSX transform for Vite; handles build, HMR, and Vitest transform
- `vite@^7.3.1` (lib mode): Library bundler -- already in repo, `preserveModules: true` for tree shaking
- `vitest@^4.1.7`: Test runner with native Vite integration, replaces Jest + ts-jest
- `@solidjs/testing-library@^0.8.10`: Official Solid port of Testing Library; `render()` takes `() => <Component />`
- `eslint-plugin-solid@~0.14.5`: Only Solid ESLint plugin; `no-destructure` rule blocks the #1 porting mistake
- `storybook-solidjs-vite@^10.1.1`: Community-maintained Storybook adapter (solidjs-community/storybook); v10 tracks Storybook 10
- `typescript@^5.9.3`: Keep existing version; no upgrade needed

**What to remove:** `react`, `react-dom`, `@types/react`, `@types/react-dom`, `@testing-library/react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `@storybook/react-vite`, `@vitejs/plugin-react` (in docs/), and `storybook-solidjs` (deprecated, archived July 2025 -- do NOT confuse with `storybook-solidjs-vite`).

### Expected Features -- React-to-Solid Pattern Map

This port has no net-new features. All 14 core React patterns used in the library have known SolidJS equivalents.

**Must-implement (blocks all 37 components):**
- `mergeProps` + `splitProps` on every component -- replaces argument destructuring; the #1 mechanical change; HIGH volume (all 37 files), enforced by `eslint-plugin-solid/no-destructure` from Phase 1
- `class` attribute everywhere -- replaces `className`; LOW cost per file but touches every file; find-replace + ESLint `no-react-specific-props`
- `ComponentProps<"button">` / `JSX.Element` / `ParentComponent` types -- replaces React types; LOW cost, pure TypeScript

**Must-implement (blocks state and compound components):**
- `createSignal` with getter-call semantics (`isOpen()` not `isOpen`) -- LOW cost, mechanical
- `createContext` + `useContext` -- API identical to React; LOW cost
- `<Portal mount={document.body}>` from `solid-js/web` -- replaces `createPortal`; LOW cost
- Signal-wrapped refs for context-shared DOM nodes (`createSignal<HTMLElement>()`) -- MEDIUM cost; required for Dialog, Drawer, BottomSheet

**Must-implement (Carousel-specific):**
- `onMount` + `onCleanup` -- replaces `useEffect`; Carousel is the ONLY component using `useEffect`+`useCallback`+`useRef` together; MEDIUM cost
- `useCallback` has no equivalent and is not needed in Solid -- components run once, functions in the body are stable

**Must-implement (conditional and list rendering):**
- `<Show>` -- replaces `&&` ternary for JSX conditionals; prevents "0" rendering to DOM; LOW cost
- `<For>` / `<Index>` -- replaces `.map()` in JSX; required for correct diffing; LOW-MEDIUM cost

**Design decision required (not mechanical):**
- `Drawer.Trigger`: React uses `React.cloneElement(children, { onClick })` -- the ONLY non-mechanical translation in the entire library. Must be decided explicitly in Phase 5: (a) wrapper `<span onClick={handleClick}>{props.children}</span>`, (b) `display:contents` span to avoid layout impact, or (c) documented DOM change. Do not defer.

**Zero change (framework-agnostic):**
- `Object.assign(Root, { Trigger, Content })` compound pattern -- pure JS, unchanged
- `mergeClasses` helper -- pure TypeScript, no framework dependency
- `types/index.ts`, `barrelsby`/`generate-barrel.js`, `@changesets/cli` -- all unchanged

**Confirmed non-issue:**
- `@tanstack/react-table` is used ONLY in the Storybook story for Table, NOT in the component source. `@tanstack/solid-table` is needed only in Phase 8 (Storybook rewrite), not Phase 6 (component port).

**Defer (v2+):**
- `createMemo` for derived values -- optional optimization, no current need
- `classList` attribute -- `mergeClasses` already handles conditional classes; mixing both adds complexity
- `children()` accessor for multi-access -- assess per component in Phases 5-6

### Architecture Approach

The monorepo structure is unchanged: `packages/` (the library) and `docs/` (Storybook). The `packages/src/` dependency graph has no circular imports and the migration preserves its direction: types/helpers/icons -> stateless atoms -> stateful atoms -> compound/portal -> composite. The CLI scaffolder copies raw source files verbatim -- after the port it automatically copies Solid source; only the bin name changes (`moon-react` -> `moon-solid`). The barrel generator (`generate-barrel.js`) is framework-agnostic and runs unchanged.

**Major components/layers:**
1. `packages/src/types/` + `packages/src/helpers/` -- zero framework coupling; port cost zero
2. `packages/src/assets/icons/` -- React SVGProps -> Solid JSX.SvgSVGAttributes; must port before any component
3. Stateless atoms (Button, Badge, Alert, etc.) -- establish `splitProps`/`mergeProps` pattern; no signals or context
4. Stateful form atoms (Checkbox, Input, Switch, etc.) + Carousel -- introduce `createSignal`; Carousel is the complexity outlier (only component using useEffect+useCallback+useRef together)
5. Compound + portal (Dialog, Drawer, BottomSheet, Dropdown, Menu, Select, Tooltip, Snackbar) -- `createContext`, signal-wrapped refs, `<Portal>`
6. Composite/layout (Accordion, TabList, Table, List, Pagination, Authenticator) -- compound context without portals; Authenticator is most complex composite

**Build pipeline (post-migration):**
- `packages/src/` -> vite build --lib (vite-plugin-solid) -> `packages/dist/`
- `solid` condition: `dist/index.jsx` (preserved JSX, for SolidStart consumers)
- `import` condition: `dist/index.js` (pre-compiled ESM, for standard bundlers)
- types: `dist/index.d.ts` (tsc --emitDeclarationOnly)
- `docs/` -> `storybook-solidjs-vite` -> resolves `@moondesignsystem/solid` via `file:../packages`

### Critical Pitfalls

1. **Props destructuring silently kills reactivity** -- CRITICAL, affects all 37 components. Component renders correctly on first mount but never updates on prop changes. No error, no warning. Prevention: `eslint-plugin-solid/no-destructure` enabled in Phase 1 before touching any component. Pattern: `mergeProps` + `splitProps` on every component without exception.

2. **Signal getters vs signal values in context** -- HIGH risk for Phase 5. Passing `isOpen()` (snapshot) instead of `isOpen` (getter) into context breaks downstream reactivity. Context value types must use `Accessor<boolean>` not `boolean`. Prevention: establish `Accessor<T>` typing convention in Phase 1.

3. **Refs shared via context need signal wrapping** -- HIGH risk for Dialog, Drawer, BottomSheet. A plain `let ref!: HTMLDialogElement` shared through context captures `undefined` at context-creation time. Signal-wrapped ref (`createSignal<HTMLDialogElement>()`) makes the element assignment reactive. Prevention: any ref crossing a component boundary via context must be signal-wrapped.

4. **Vitest resolve conditions are non-negotiable** -- Without `resolve.conditions: ["development", "browser"]` + `ssr.resolve.conditions: ["browser"]` in `vitest.config.ts` (required since `vite-plugin-solid@2.11.9+`), tests fail with "Client-only API called on server side". Must be correct in Phase 1 before any test runs.

5. **Storybook adapter compatibility** -- `storybook-solidjs` (old, archived July 2025) must not be used. `storybook-solidjs-vite` v10.1.1 targets Storybook 10 but must be verified with a single Button story spike before porting all 37. Story render format changes: `render: (args) => <Component {...args} />` -> `render: (args) => () => <Component {...args} />`.

6. **React.cloneElement in Drawer.Trigger** -- the only non-mechanical translation; has no Solid equivalent. Requires an explicit design decision in Phase 5. Do not leave as a TODO.

7. **onInput vs onChange for text inputs** -- `onChange` in Solid maps to native `change` event (fires on blur). Text inputs and textareas must use `onInput` for real-time updates. Affects Phase 4.

---

## Implications for Roadmap

### Phase 1: Toolchain Swap
**Rationale:** Build, test, and lint pipeline must be correct before any component is touched. Validates the full pipeline independently on an empty barrel. Getting `eslint-plugin-solid/no-destructure` right here prevents the hardest-to-diagnose failures from entering any component work.
**Delivers:** Working vite build --lib emitting `solid` + `import` + `.d.ts` conditions; passing Vitest with correct resolve.conditions; `eslint-plugin-solid/no-destructure` active; tsconfig with `jsx: preserve` + `jsxImportSource: solid-js`; React toolchain removed; package renamed `@moondesignsystem/solid@3.0.0`; `solid-js@^1.9.13` installed.
**Avoids:** Pitfalls 1 (destructuring -- ESLint blocks it), 4 (Vitest conditions), 10 (Vitest plugin missing), 11 (tsconfig mismatch), 12 (missing solid export condition).
**Research flag:** Standard patterns -- skip research-phase. Configuration is fully documented in STACK.md with exact file contents.

### Phase 2: Helpers, Types, Icons
**Rationale:** Every component imports from these layers. Porting them first eliminates transitive React imports that would cause type errors in every subsequent phase. `mergeClasses` and types are zero-change. Icon components are the only files outside `components/` using React types.
**Delivers:** All icon components as Solid `Component<JSX.SvgSVGAttributes<SVGSVGElement>>`; confirmed zero framework imports in helpers and types; barrel generator verified working.
**Avoids:** Cascading React import failures in Phases 3-6.
**Research flag:** Standard patterns -- skip research-phase.

### Phase 3: Stateless Atoms
**Rationale:** No signals, no context, no portals. This is where the canonical mergeProps+splitProps pattern is established and stabilized for mechanical replication. Getting Button right once makes the remaining components a follow-the-pattern exercise.
**Delivers:** Button, IconButton, Badge, Tag, Chip, Avatar, Loader, CircularProgress, LinearProgress, Placeholder, Alert (compound but stateless), Breadcrumb -- all ported and test-passing.
**Implements:** Pattern 1 (splitProps + mergeProps), Pattern 3 (Object.assign compound component).
**Avoids:** Pitfall 1 (destructuring -- ESLint enforced), Pitfall 6 (Show over &&), Pitfall 7 (class not className).
**Research flag:** Standard patterns -- skip research-phase.

### Phase 4: Stateful Form Atoms + Carousel
**Rationale:** Introduces `createSignal` in isolated scope with no cross-component context. Carousel is placed here (not Phase 6) because its dependencies (Button, chevron icons) are already resolved after Phase 3, and it is the most complex lifecycle component in the library. Addressing it in Phase 4 avoids it being a blocker in later composite phases.
**Delivers:** Checkbox, Radio, Switch, Input, Textarea, FormGroup, SegmentedControl, Carousel -- all ported. Carousel uses onMount+onCleanup replacing useEffect; useCallback eliminated (not needed in Solid); plain let ref for local scroll ref (not shared via context).
**Uses:** `createSignal`, `onMount`, `onCleanup`; `onInput` (not `onChange`) for text inputs.
**Avoids:** Pitfall 4 (missing onCleanup -- Carousel event listeners), Pitfall 9 (onInput vs onChange).
**Research flag:** Standard patterns -- skip research-phase. Carousel lifecycle translation is documented in FEATURES.md TS-2.

### Phase 5: Compound + Portal Components
**Rationale:** These components share state across sub-components via context and render outside the DOM tree via Portal. They depend on patterns from Phases 2-4 and introduce the two highest-risk patterns. The React.cloneElement issue in Drawer.Trigger must be resolved here with an explicit documented decision.
**Delivers:** Dialog, Drawer, BottomSheet, Snackbar, Tooltip, Dropdown, Menu, Select -- all ported with `createContext`, signal-wrapped refs, `<Portal>`.
**Implements:** Pattern 2 (signal-wrapped ref for context-shared DOM nodes), Pattern 4 (Portal for overlays).
**Critical decision:** Drawer.Trigger cloneElement replacement -- choose wrapper span vs display:contents vs documented DOM change. Record in PROJECT.md Key Decisions before Phase 5 implementation begins.
**Avoids:** Pitfall 2 (signal getter vs value in context), Pitfall 3 (plain let ref in context), Pitfall 5 (children() before Provider), Pitfall 8 (Portal context/event behavior).
**Research flag:** Brief spike recommended on display:contents browser compatibility for the Drawer.Trigger design decision before implementation.

### Phase 6: Composite and Layout Components
**Rationale:** Depends on atoms (Phases 3-4) and compound-pattern knowledge from Phase 5. Table component source does NOT use @tanstack/react-table -- only the story does. Authenticator is last, most complex composite.
**Delivers:** Accordion, TabList, Table, List, Pagination, Authenticator -- all ported.
**Uses:** `<Show>`, `<For>` / `<Index>` for conditional/list rendering; `children()` helper where sub-components inspect children.
**Avoids:** Pitfall 5 (children() multiple access in TabList/Accordion), Pitfall 6 (Show over &&).
**Research flag:** Standard patterns -- skip research-phase.

### Phase 7: Test Suite Rewrite
**Rationale:** All 37 components are ported. Rewrite all 18 test files against @solidjs/testing-library + Vitest as a dedicated phase to avoid mixing component porting with test API migration. API differences are fully documented.
**Delivers:** 18 test files passing under `vitest run`; zero `jest is not defined` errors; test filenames normalized to PascalCase; HTMLDialogElement.showModal mock preserved with vi.fn().
**Avoids:** Pitfall 14 (testing-library API differences -- render wraps in function, no rerender(), vi.* replaces jest.*).
**Research flag:** Standard patterns -- skip research-phase. PITFALLS.md documents every API difference with code examples.

### Phase 8: Storybook Stories Rewrite
**Rationale:** Separated from tests because it carries the highest external risk (community adapter compatibility with Storybook 10). Do the Button story first, verify controls work, then port remaining 36. @tanstack/solid-table needed here (not Phase 6) for the Table story only.
**Delivers:** All 37 stories ported to storybook-solidjs-vite; @storybook/react-vite removed; @tanstack/solid-table added for Table story only.
**Uses:** `storybook-solidjs-vite@^10.1.1`; story render format `render: (args) => () => <Component {...args} />`.
**Critical gate:** Single Button story spike before porting all 37. If storybook-solidjs-vite is incompatible with Storybook 10, pin Storybook to 9.x before continuing.
**Avoids:** Pitfall 13 (wrong Storybook adapter; version incompatibility).
**Research flag:** NEEDS research-phase spike -- verify `storybook-solidjs-vite@^10.1.1` compat with current Storybook 10, @addon-vitest, and Chromatic integration before committing to all 37 stories. HIGH priority flag.

### Phase 9: CLI Rename
**Rationale:** All source is now Solid. The CLI scaffolder automatically copies Solid source. Only the bin name changes.
**Delivers:** bin/moon-react -> bin/moon-solid; package.json bin field updated; `npx @moondesignsystem/solid --add button` invocation works.
**Research flag:** Standard patterns -- skip research-phase. Mechanical rename.

### Phase 10: Release Prep
**Rationale:** Final validation before publish. Publish dry-run must verify the `solid` export condition resolves correctly in a fresh SolidJS Vite consumer project.
**Delivers:** README updated; CHANGELOG entry for 3.0.0; `npm publish --dry-run` passes; `solid` export condition verified in consumer test project; Changesets release flow executed.
**Avoids:** Pitfall 12 (missing solid export condition discovered post-publish).
**Research flag:** Standard patterns -- skip research-phase.

### Phase Ordering Rationale

- **Bottom-up dependency order is mandatory.** Each layer imports from layers below it. Porting out-of-order causes transitive React import failures that are noisy and misleading.
- **Carousel belongs in Phase 4, not Phase 6.** It uses useEffect+useCallback+useRef -- the most complex lifecycle pattern -- but its only dependencies are Phase 2 (icons) and Phase 3 (Button). Delaying it creates an unnecessary blocker.
- **Table component source is clean.** @tanstack/react-table is story-only. Phase 6 ports the component with zero tanstack dependency.
- **Phase 8 (Storybook) is last before CLI/release** because it carries the highest external risk. Blocking Phase 9 and 10 on it is correct.
- **The Drawer.Trigger design decision must not be deferred past Phase 5.** It is the only non-mechanical translation. Leaving it as a TODO ships a silent wrong implementation.

### Research Flags

Needs research (spike) before execution:
- **Phase 8 (Storybook):** Verify storybook-solidjs-vite@^10.1.1 compatibility with current Storybook 10 version, @addon-vitest, and Chromatic integration. Run single Button story spike first. If blocked, decide whether to pin Storybook 9 or wait for community update.

Standard patterns (skip research-phase):
- **Phases 1-7, 9-10:** All patterns fully documented in STACK.md, FEATURES.md, and PITFALLS.md with working code examples. No unknown territory.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core stack verified against official repos and release histories. Vite-lib bundler choice backed by verified tsup-preset-solid staleness (last release Dec 2023). storybook-solidjs-vite v10 compat is MEDIUM -- version number alignment confirmed, runtime addon parity unverified. |
| Features | HIGH | All 14 React patterns mapped to SolidJS equivalents; verified against official SolidJS docs and maintainer GitHub discussions. Table/@tanstack non-dependency confirmed. Carousel as complexity outlier confirmed. |
| Architecture | HIGH | Build pipeline verified. Monorepo workspace boundaries confirmed. CLI mechanics confirmed framework-agnostic. One remaining design decision: Drawer.Trigger cloneElement replacement -- options are clear, choice is pending Phase 5. |
| Pitfalls | HIGH | All critical pitfalls verified against official SolidJS docs, vite-plugin-solid source, and @solidjs/testing-library README. Vitest resolve.conditions requirement verified against published blog post with repro steps. |

**Overall confidence:** HIGH

### Gaps to Address

- **Drawer.Trigger cloneElement replacement:** Options are clear (wrapper span / display:contents / documented DOM change). Research cannot make this product/API choice. Must be decided and recorded at the start of Phase 5 before implementation begins.
- **storybook-solidjs-vite Storybook 10 runtime compatibility:** Version number alignment is encouraging but not a guarantee of full addon parity (@addon-vitest, Chromatic). Validate with a spike at the start of Phase 8 before committing to all 37 stories.
- **solid-js version in PROJECT.md:** The `^1.8` semver range includes 1.9.13, so there is no conflict -- but PROJECT.md should be updated to `^1.9.13` for accuracy before Phase 1 begins.

---

## Sources

### Primary (HIGH confidence)
- `solidjs/vite-plugin-solid` GitHub -- v2.11.12, resolve.conditions requirement, tsconfig requirements
- `solidjs-community/storybook` GitHub -- storybook-solidjs-vite v10.1.1, Solid 1+2 support confirmed
- SolidJS official docs -- createSignal, createEffect, mergeProps, splitProps, Portal, onMount, onCleanup, createContext, children helper
- `eslint-plugin-solid` GitHub -- v0.14.5, ESLint 9 flat config, no-destructure rule
- `solidjs-community/tsup-preset-solid` npm -- last release Dec 2023 confirmed (staleness evidence for avoidance)
- `@solidjs/testing-library` README -- render() API, cleanup, reactivity in tests
- `solid-js` package.json -- reference for solid/import/browser export condition shape

### Secondary (MEDIUM confidence)
- `hy2k.dev` blog -- Vitest + vite-plugin-solid browser conditions fix (repro confirmed, published 2025-10-17)
- `solid-transition-group` vitest.config.ts -- community reference confirming resolve.conditions pattern
- `tsdown.dev` -- Solid recipe for fallback bundler option (pre-1.0 tool)
- LogRocket, marmelab.com -- React-to-Solid migration patterns (cross-referenced against official docs)
- WebSearch -- solid-js@1.9.13 as current stable (npm page)

### Tertiary (LOW confidence)
- tsdown + unplugin-solid -- documented as fallback option only; pre-1.0, no community track record for component libraries

---
*Research completed: 2026-05-31*
*Ready for roadmap: yes*
