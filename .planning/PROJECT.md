# Moon SolidJS Design System

## What This Is

Moon is a component library / design system shipped as `@moondesignsystem/solid@3.0.0` — a monorepo with a SolidJS component package (`packages/`), a Storybook docs site (`docs/`), and a CLI scaffolder (`bin/moon-solid`). It was migrated in v1.0 from React 19 to SolidJS in-place on `main` (was `@moondesignsystem/react@2.5.21`; hard cut, React abandoned). Consumers are app developers who install Moon components and style them with Tailwind.

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

<!-- v1.0 migration shipped. Next milestone TBD. -->

(None active — run /gsd-new-milestone to start the next one.)

### Validated (v1.0 — shipped 2026-06-01)

- ✓ Toolchain swapped to Solid: `solid-js`, `vite-plugin-solid`, dual bundled build (compiled `.js` + raw-JSX `.jsx` + `.d.ts`), Vitest, `eslint-plugin-solid`, tsconfig `jsxImportSource: solid-js` — v1.0
- ✓ Package renamed `@moondesignsystem/react` → `@moondesignsystem/solid`, version `3.0.0`, `solid` export condition — v1.0
- ✓ Helpers + types + icon assets ported to Solid — v1.0
- ✓ All 37 components (34 source files) ported to Solid idioms with identical class output and public API; zero React imports — v1.0
- ✓ 34 test files rewritten for `@solidjs/testing-library` + Vitest, PascalCase, 278 tests green — v1.0
- ✓ All 34 Storybook stories rewritten for `storybook-solidjs-vite` (Storybook 10); build-storybook green — v1.0
- ✓ CLI scaffolder emits Solid templates; bin renamed `moon-solid` — v1.0
- ✓ Release prep: Solid README/CHANGELOG, major 3.0.0 changeset, `npm publish --dry-run` green with `solid` condition verified — v1.0

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

- **Tech stack**: Target `solid-js@^1.9.13` (current production; 2.0 is experimental). Build via `vite build --lib` + `vite-plugin-solid` (chosen over abandoned `tsup-preset-solid`). Mandatory `solid` export condition in package.json. No headless deps.
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
| Chip uncontrolled-toggle divergence from React is intentional | React's `isActive=false` default made the internal toggle dead code (clicking never activated the chip). Solid port omits that default so `local.isActive` is `undefined` when uncontrolled, allowing the signal to drive `moon-chip-active` on click. This is an accepted behavior improvement over the React original, not a parity bug. CR-01 rejected. | — Accepted |
| Real bundled build (tsup/vite-lib) replaces type-only `tsc` | Solid JSX needs babel-preset-solid compilation | — Pending |
| Drawer.Trigger `cloneElement` → `display:contents` wrapper span | Solid has no cloneElement. A `<span style="display:contents" onClick>` attaches the open-handler while staying layout-invisible (no box in the layout tree), the closest low-risk equivalent. Adds one DOM node vs React's clone — documented, accepted divergence. | — Accepted |
| Context-shared refs use signal/callback refs | Plain `let` ref is not reactive across Solid context. Dialog/Drawer/BottomSheet use `createSignal<HTMLDialogElement>()` + `ref={setRef}`, share the getter via context, call `ref()?.showModal()`. | — Accepted |

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

## Current State

**Shipped:** v1.0 — React → SolidJS migration (2026-06-01). `@moondesignsystem/solid@3.0.0` is a complete, publishable SolidJS port: 37 components, 278 Solid tests, 34 Storybook stories, Solid CLI scaffolder, publish dry-run green with the `solid` export condition verified. `main` is Solid-only (hard cut from React). Archive: `.planning/milestones/v1.0-ROADMAP.md`.

**Not yet done (post-milestone / v2):** real `npm publish` (only dry-run gated — a human/CI action), SolidStart SSR consumer verification (ENH-02), idiomatic Solid refinements like `children()` adoption (ENH-01).

## Next Milestone Goals

(TBD — run `/gsd-new-milestone` to define the next milestone.)

---
*Last updated: 2026-06-01 after v1.0 milestone completion*
