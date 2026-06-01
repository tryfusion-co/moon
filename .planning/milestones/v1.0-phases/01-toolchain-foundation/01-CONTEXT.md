# Phase 1: Toolchain + Foundation - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning
**Mode:** Auto (--auto) — decisions picked from project research; recommended defaults locked

<domain>
## Phase Boundary

Make the SolidJS build/test/lint pipeline fully operational and port all shared library primitives (helpers, types, icons) so every subsequent phase can build, test, and lint with zero React imports. Covers requirements TOOL-01..07 and FND-01..04. No UI components are ported in this phase — it must ship a green empty/barrel build that proves the toolchain independently.

</domain>

<decisions>
## Implementation Decisions

### Bundler / build pipeline (TOOL-01, TOOL-02)
- **D-01:** Build with `vite build --lib` + `vite-plugin-solid`. NOT `tsup-preset-solid` (abandoned since Dec 2023). Rationale: Vite already present in `docs/`; vite-plugin-solid is actively maintained (v2.11.x); lowest new-dependency risk. (Resolved conflict between STACK.md and ARCHITECTURE.md research — see SUMMARY.md.)
- **D-02:** Lib build emits ESM (`dist/index.js`) + `.d.ts` types + a preserved-JSX entry for the `solid` export condition. Use `preserveModules`/per-component output so tree-shaking parity with the old barrel is kept.
- **D-03:** `package.json` `exports` MUST declare the `solid` condition pointing to preserved-JSX output, plus `import` (compiled ESM) and `types`. The `solid` condition is mandatory — without it SolidStart/Vite consumers fail to compile and may dual-load solid-js ("dispose is undefined").
- **D-04:** Replace the old `"build": "tsc --project tsconfig.build.json"` (type-only emit) with the Vite lib build. Keep `prebuild` barrel generation.

### Runtime + package identity (TOOL-03)
- **D-05:** Rename package `@moondesignsystem/react` → `@moondesignsystem/solid`, version `3.0.0`.
- **D-06:** Peer dependency `solid-js@^1.9.13` (current production; Solid 2.0 is experimental, not targeted). Remove `react` + `react-dom` peer deps and all `@types/react*` dev deps.

### tsconfig (TOOL-04)
- **D-07:** `"jsx": "preserve"` + `"jsxImportSource": "solid-js"` in both `tsconfig.json` and `tsconfig.build.json`. Remove `"jsx": "react-jsx"`. With `preserve`, TS leaves JSX for vite-plugin-solid/babel-preset-solid to compile.

### Test runner (TOOL-05)
- **D-08:** Replace Jest + ts-jest with **Vitest** + `vite-plugin-solid` + `@solidjs/testing-library` + `@testing-library/jest-dom` + jsdom. `@testing-library/user-event` stays (compatible).
- **D-09:** `vitest.config.ts` MUST include the browser-conditions fix: `resolve.conditions: ['browser']` (or `test.server.deps` / `ssr.resolve.conditions` per vite-plugin-solid guidance) so jsdom tests don't pick Solid's server build and fail with "Client-only API called on the server side". This is the non-obvious required config — land it now, before any component tests in Phase 2.
- **D-10:** Remove `jest.config.js`, `ts-jest`, `jest-environment-jsdom`, `@types/jest`, `@testing-library/react`, `@testing-library/jest-dom`(react-bound usage). Wire `setupTests` for Vitest.

### Lint (TOOL-06)
- **D-11:** ESLint flat config using `eslint-plugin-solid` (`~0.14.5`, tilde-pinned — pre-1.0). Enable `solid/no-destructure` (blocks the #1 reactivity trap by tooling) + `solid/reactivity`. Remove `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`.

### Toolchain validation gate (TOOL-07)
- **D-12:** Before any component is ported, the empty/stub barrel must `vite build --lib` green, `vitest run` green (no client-on-server error), and `eslint` green — proving the pipeline end-to-end. A deliberate destructure test-case should make `solid/no-destructure` fire, confirming the rule is active.

### Helpers + Types (FND-01, FND-02)
- **D-13:** `helpers/mergeClasses.ts` is framework-pure — ported unchanged, only verified it compiles + is consumed under Solid toolchain. `types/index.ts` (`Sizes`/`Contexts`/`Variants`/`Directions`/`Positions`) exported unchanged.

### Icons (FND-03)
- **D-14:** Port `assets/icons/*.tsx` from React FC to Solid `Component`. Props type becomes Solid `JSX.SvgSVGAttributes<SVGSVGElement>` (or `ComponentProps<'svg'>`); use `splitProps` not destructuring; `class` not `className`. SVG markup/attributes preserved so rendered output is byte-identical. Default export per icon kept.

### Barrel (FND-04)
- **D-15:** Keep `scripts/generate-barrel.js` (pure fs script, zero framework coupling — verified). Remove unused `barrelsby` dev dep. Barrel must produce a valid Solid barrel.

### Claude's Discretion
- Exact `vite.config.ts` lib options (entry, formats, externalization of solid-js) — planner/executor decides within D-01..D-04.
- Whether to use `vite-plugin-dts` vs `tsc --emitDeclarationOnly` for `.d.ts` generation.
- Precise ESLint flat-config file layout.

</decisions>

<specifics>
## Specific Ideas

- Public API parity is the contract: same exported names, prop names, types, and Tailwind class output as `@moondesignsystem/react@2.5.21`. The toolchain must not alter emitted class strings.
- Icon SVG output must be byte-identical to the React version (consumers may target it with CSS).

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Migration strategy + decisions
- `MIGRATION-CONTEXT.md` — prior-session React→Solid translation map, toolchain swap table, props-destructuring pitfall
- `.planning/PROJECT.md` — locked decisions (bundler, version, hard-cut), constraints
- `.planning/REQUIREMENTS.md` §Toolchain, §Foundation — TOOL-01..07, FND-01..04 acceptance

### Research (authoritative for this phase)
- `.planning/research/SUMMARY.md` — bundler decision (vite-lib), solid-js 1.9.13, storybook risk, build order
- `.planning/research/STACK.md` — exact versions, vitest `resolve.conditions` fix, tsconfig, package.json exports/conditions, what-not-to-use
- `.planning/research/ARCHITECTURE.md` — build pipeline change, barrel/CLI impact, migration build order
- `.planning/research/PITFALLS.md` — no-destructure enforcement, solid export condition, testing config traps

### Codebase
- `.planning/codebase/STACK.md`, `.planning/codebase/STRUCTURE.md`, `.planning/codebase/TESTING.md` — current React toolchain being replaced

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/scripts/generate-barrel.js` — keep as-is (framework-agnostic)
- `packages/src/helpers/mergeClasses.ts` — keep as-is (zero React)
- `packages/src/types/index.ts` — keep as-is (pure types)

### Established Patterns
- Auto-generated barrel `packages/src/components/index.ts` via `prebuild` hook — preserve mechanism
- Type-only `tsc` build (`tsconfig.build.json`) — being REPLACED by Vite lib build

### Integration Points
- `docs/` workspace consumes lib via `file:../packages` — must keep resolving after build change
- Root `package.json` scripts (`build`, `dev`, `version`, `release`) reference the lib build — update for Vite

</code_context>

<deferred>
## Deferred Ideas

- Component ports — Phases 2-4
- Test rewrites — Phase 5 (but Vitest config + setup land here)
- Storybook toolchain — Phase 6
- CLI bin rename — Phase 7
- SolidStart SSR verification — v2 (ENH-02)

</deferred>

---

*Phase: 01-toolchain-foundation*
*Context gathered: 2026-06-01*
