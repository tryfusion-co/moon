# Moon SolidJS Design System

## What This Is

Moon is a component library / design system, currently `@moondesignsystem/react@2.5.21` — a monorepo with a React component package, a Storybook docs site, and a CLI scaffolder (`npx @moondesignsystem/ui --add-components`). This project ports the entire library from React 19 to SolidJS in-place on `main`, republishing as `@moondesignsystem/solid@3.0.0`. Consumers are app developers who install Moon components and style them with Tailwind.

## Core Value

Every existing Moon component renders and behaves identically under SolidJS — same public API surface, same Tailwind class output, same DOM — so consuming apps get a true framework swap, not a redesign.

## Requirements

### Validated

<!-- Existing capabilities inferred from the React codebase (brownfield). These already ship and are relied upon. -->

- ✓ 37 components published from `packages/src/components/` — existing
- ✓ Compound-component pattern (`Object.assign(Root, {Trigger, Content, ...})`) for Dialog, Drawer, Accordion, Dropdown, Menu, Select, etc. — existing
- ✓ Tailwind-class styling via `mergeClasses` helper (no CSS-in-JS); class names like `moon-button` — existing
- ✓ Shared type vocabulary (`Sizes`, `Contexts`, `Variants`, `Directions`, `Positions`) in `packages/src/types/` — existing
- ✓ Auto-generated tree-shakeable barrel (`packages/src/components/index.ts` via `scripts/generate-barrel.js`) — existing
- ✓ Test suite (18 test files, Jest + @testing-library/react + jsdom) — existing
- ✓ Storybook docs site (`docs/`, Storybook 10 + Vite) with one story per component — existing
- ✓ CLI scaffolder (`packages/cli/` + `bin/moon-react`) — interactive component-adder — existing
- ✓ Changesets-based release flow — existing

### Active

<!-- The Solid migration scope. Hypotheses until shipped. -->

- [ ] Toolchain swapped to Solid: `solid-js`, `vite-plugin-solid`, real bundled build (replaces type-only `tsc` emit), Vitest, `eslint-plugin-solid`, tsconfig `jsxImportSource: solid-js`
- [ ] Package renamed `@moondesignsystem/react` → `@moondesignsystem/solid`, version `3.0.0`
- [ ] Helpers + types + icon assets ported to Solid (`mergeClasses` is framework-pure; icons React FC → Solid `Component`)
- [ ] All 37 components ported to Solid idioms (`splitProps`/`mergeProps`, `createSignal`, `createEffect`, `<Portal>`, signal-wrapped refs) with identical class output and public API
- [ ] All 18 test files rewritten for `@solidjs/testing-library` + Vitest, normalized to PascalCase filenames, per-component parity
- [ ] All 37 Storybook stories rewritten for `storybook-solidjs`
- [ ] CLI scaffolder emits Solid templates; bin renamed `moon-solid`
- [ ] Release prep: README/CHANGELOG, major version bump, publish dry-run

### Out of Scope

- Parallel React maintenance — **hard cut**; `main` becomes Solid-only, React 2.5.21 abandoned
- Adding new components or redesigning existing ones — this is a 1:1 framework port, not a feature release
- Headless primitive libraries (Kobalte/Corvu) — repo has zero headless deps; port primitives 1:1
- Tailwind config changes — styling lives in consumer apps, unchanged by migration
- Repo rename — keep `tryfusion-co/moon`, only npm package renames

## Context

- **Monorepo**: npm workspaces — `packages/` (lib) + `docs/` (Storybook). Root scripts orchestrate build/dev/release.
- **React surface actually used** (from grep): `createContext`, `useContext`, `useRef`, `useState`, `useEffect` (rare), `useCallback` (rare), `ReactNode`, `createPortal`. No `useMemo`/`forwardRef`/`useImperativeHandle`/`useLayoutEffect`/`Suspense`/`lazy`. No third-party headless libs. Clean, small React footprint → mechanical port.
- **Critical Solid pitfall**: props must NOT be destructured (kills reactivity). Every component switches to `mergeProps` + `splitProps`. Non-negotiable, touches all 37 files.
- **Refs shared via context** (Dialog etc.) need signal-wrapped or callback refs — plain `let` is not reactive across context.
- **Build change**: React build is type-only `tsc` (consumer bundles). Solid JSX must be compiled by `babel-preset-solid`, so a real bundled build (tsup/vite-lib with `vite-plugin-solid`) is required — bigger toolchain change than the React side had.
- **Storybook risk**: `storybook-solidjs` is community-maintained and lags core Storybook; the docs site uses Storybook 10 — version compatibility is the main unknown.
- Full React→Solid translation map and prior-session analysis live in `MIGRATION-CONTEXT.md` at repo root.
- Codebase map: `.planning/codebase/` (7 docs).

## Constraints

- **Tech stack**: Target `solid-js@^1.8`. JSX via `vite-plugin-solid` / `babel-preset-solid`. No headless deps.
- **Compatibility**: Public API (component names, prop names, exported types, class names) must stay identical — consuming apps swap framework only.
- **Compatibility**: Tailwind class output per component must match the React version exactly (verified via tests/Storybook).
- **Process**: In-place rewrite on `main`. Full GSD workflow per phase.
- **Testing**: Every component ships with a Solid test asserting real DOM render + events (component-level E2E via `@solidjs/testing-library`). No mocking own code.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Port to SolidJS in-place on `main` | User-authorized full rewrite; no parallel React track | — Pending |
| Rename `@moondesignsystem/react` → `@moondesignsystem/solid`, bump to `3.0.0` | Breaking framework change warrants major + new package name | — Pending |
| Hard cut React package (no parallel maintenance) | Avoid dual-framework upkeep cost | — Pending |
| Port primitives 1:1, no Kobalte/Corvu | Repo has zero headless deps; keep blast radius minimal | — Pending |
| `storybook-solidjs` for docs, port all stories | Keep Storybook parity; community renderer is the only Solid option | — Pending (compat risk) |
| Normalize test filenames to PascalCase | Fix `accordion.test.tsx` outlier for consistency | — Pending |
| `splitProps`/`mergeProps` for every component | Solid reactivity requires no prop destructuring | — Pending |
| Real bundled build (tsup/vite-lib) replaces type-only `tsc` | Solid JSX needs babel-preset-solid compilation | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-01 after initialization*
