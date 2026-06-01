# Requirements: Moon SolidJS Design System

**Defined:** 2026-06-01
**Core Value:** Every existing Moon component renders and behaves identically under SolidJS — same public API, same Tailwind class output, same DOM — so consuming apps get a true framework swap, not a redesign.

## v1 Requirements

Requirements for the `@moondesignsystem/solid@3.0.0` release. Each maps to a roadmap phase.

### Toolchain

- [x] **TOOL-01**: Package builds with `vite build --lib` + `vite-plugin-solid`, emitting ESM + `.d.ts` (replaces type-only `tsc` emit)
- [x] **TOOL-02**: `package.json` declares the mandatory `solid` export condition pointing to preserved-JSX output, plus `import`/`types` conditions
- [x] **TOOL-03**: Package renamed `@moondesignsystem/react` → `@moondesignsystem/solid`, version `3.0.0`, peer dep `solid-js@^1.9.13` (React/react-dom peer deps removed)
- [x] **TOOL-04**: `tsconfig` uses `jsx: preserve` + `jsxImportSource: solid-js` (no more `react-jsx`)
- [x] **TOOL-05**: Test runner is Vitest + `vite-plugin-solid` + `@solidjs/testing-library` + jsdom, with the `resolve.conditions` browser fix that prevents "Client-only API called on server" failures
- [x] **TOOL-06**: ESLint uses `eslint-plugin-solid` flat config with `solid/no-destructure` enabled (blocks the #1 reactivity trap by tooling, not convention); React lint plugins removed
- [x] **TOOL-07**: Empty/barrel build succeeds end-to-end on the new toolchain before any component is ported (toolchain validated independently)

### Foundation

- [x] **FND-01**: `helpers/mergeClasses.ts` compiles and is consumed under the Solid toolchain unchanged (framework-pure)
- [x] **FND-02**: `types/index.ts` (`Sizes`/`Contexts`/`Variants`/`Directions`/`Positions`) exported unchanged
- [x] **FND-03**: Icon assets in `assets/icons/` ported from React FC to Solid `Component` with `JSX`/SVG attribute types, rendering identical SVG output
- [x] **FND-04**: Barrel generator (`scripts/generate-barrel.js`) produces a valid Solid barrel; unused `barrelsby` dep removed

### Components — Stateless Atoms

- [x] **ATOM-01**: All 12 stateless atoms (Button, IconButton, Badge, Tag, Chip, Avatar, Loader, CircularProgress, LinearProgress, Placeholder, Alert, Breadcrumb) ported using `mergeProps` + `splitProps` (no prop destructuring), emitting identical class output and public API/types

### Components — Stateful Form Atoms

- [x] **FORM-01**: Stateful form atoms (Checkbox, Radio, Switch, Input, Textarea, FormGroup, SegmentedControl) ported with `createSignal` local state and `onInput` (not `onChange`) bindings, preserving controlled/uncontrolled behavior and class output
- [x] **FORM-02**: Carousel (complexity outlier — `useEffect`+`useCallback`+`useRef`) ported using `onMount`/`onCleanup`/local `let` ref, validating the effect+cleanup pattern

### Components — Compound + Portal

- [x] **CMPD-01**: Compound/portal components (Dialog, Drawer, BottomSheet, Snackbar, Tooltip, Dropdown, Menu, Select) ported with `createContext`/`useContext`, signal-wrapped shared refs, and `<Portal mount>`, preserving the `Object.assign(Root, {...})` compound API
- [x] **CMPD-02**: `Drawer.Trigger` `React.cloneElement` replaced with a Solid-compatible approach (the one non-mechanical translation), with the rendered-DOM decision documented

### Components — Composite

- [x] **COMP-01**: Composite components (Accordion, TabList, Table, List, Pagination, Authenticator) ported using `<For>`/`<Show>`/`<Switch>` where `map()`/conditionals were used, preserving public API and class output (Table source needs no tanstack dep)

### Quality — Tests

- [x] **TEST-01**: All 18 test files rewritten for `@solidjs/testing-library` using the `render(() => <Comp/>)` function-wrapper form, asserting real DOM render + events, with per-component parity to the React suite
- [x] **TEST-02**: Test filenames normalized to PascalCase (`accordion.test.tsx` → `Accordion.test.tsx`); full Vitest suite passes green

### Docs — Storybook

- [x] **STORY-01**: `docs/` Storybook migrated to `storybook-solidjs-vite` (Storybook 10); a single Button story spike validates the renderer + addons (a11y/docs/themes/vitest/chromatic) before bulk porting
- [ ] **STORY-02**: All 37 stories rewritten to Solid CSF (`render: (args) => <Comp {...args} />` — single form, NO double-wrapper, per 06-RESEARCH.md storybook-solidjs-vite@10); Table story uses `@tanstack/solid-table`; `build-storybook` succeeds

### Tooling — CLI

- [ ] **CLI-01**: CLI scaffolder emits Solid component templates; `bin/moon-react` renamed `bin/moon-solid` and `package.json` `bin` field updated; scaffold-then-build of a generated component succeeds

### Release

- [ ] **REL-01**: README + CHANGELOG updated for Solid; major version `3.0.0` set via changeset
- [ ] **REL-02**: `npm publish --dry-run` passes and a smoke consumer (Solid + Vite app) resolves the package via the `solid` export condition and renders a component

## v2 Requirements

Deferred. Tracked, not in current roadmap.

### Enhancements

- **ENH-01**: Idiomatic Solid refinements that change zero public API/behavior (e.g. `children()` helper adoption where beneficial)
- **ENH-02**: SolidStart SSR consumer support / verification beyond the basic Vite smoke test

## Out of Scope

| Feature | Reason |
|---------|--------|
| Parallel React package maintenance | Hard cut — `main` becomes Solid-only |
| New components / redesigns | 1:1 framework port, not a feature release |
| Headless primitive libs (Kobalte/Corvu) | Repo has zero headless deps; port primitives 1:1 |
| Tailwind config changes | Styling lives in consumer apps, unchanged |
| Repo rename | Keep `tryfusion-co/moon`; only npm package renames |
| Props destructuring (anti-feature) | Kills Solid reactivity — forbidden, enforced by `solid/no-destructure` |
| `onChange` for text inputs (anti-feature) | Fires only on blur in Solid — use `onInput` |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TOOL-01 | Phase 1: Toolchain + Foundation | Complete |
| TOOL-02 | Phase 1: Toolchain + Foundation | Complete |
| TOOL-03 | Phase 1: Toolchain + Foundation | Complete |
| TOOL-04 | Phase 1: Toolchain + Foundation | Complete |
| TOOL-05 | Phase 1: Toolchain + Foundation | Complete |
| TOOL-06 | Phase 1: Toolchain + Foundation | Complete |
| TOOL-07 | Phase 1: Toolchain + Foundation | Complete |
| FND-01 | Phase 1: Toolchain + Foundation | Complete |
| FND-02 | Phase 1: Toolchain + Foundation | Complete |
| FND-03 | Phase 1: Toolchain + Foundation | Complete |
| FND-04 | Phase 1: Toolchain + Foundation | Complete |
| ATOM-01 | Phase 2: Stateless Atoms | Complete |
| FORM-01 | Phase 3: Stateful Atoms + Carousel | Complete |
| FORM-02 | Phase 3: Stateful Atoms + Carousel | Complete |
| CMPD-01 | Phase 4: Compound, Portal + Composite | Complete |
| CMPD-02 | Phase 4: Compound, Portal + Composite | Complete |
| COMP-01 | Phase 4: Compound, Portal + Composite | Complete |
| TEST-01 | Phase 5: Tests | Complete |
| TEST-02 | Phase 5: Tests | Complete |
| STORY-01 | Phase 6: Storybook | Complete |
| STORY-02 | Phase 6: Storybook | Pending |
| CLI-01 | Phase 7: CLI + Release | Pending |
| REL-01 | Phase 7: CLI + Release | Pending |
| REL-02 | Phase 7: CLI + Release | Pending |

**Coverage:**
- v1 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-01*
*Last updated: 2026-06-01 after roadmap creation*
