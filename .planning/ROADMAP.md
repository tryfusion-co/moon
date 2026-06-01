# Roadmap: Moon SolidJS Design System

## Overview

A bottom-up, in-place migration of the Moon design system from React 19 to SolidJS, republished as `@moondesignsystem/solid@3.0.0`. The port is purely mechanical — same 37 components, same public API, same Tailwind class output, same DOM. Work proceeds in strict dependency order: toolchain and foundation first, then stateless atoms, stateful atoms, compound/portal/composite, tests, Storybook (spike-gated), and finally CLI rename plus release publish.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Toolchain + Foundation** - Swap build/test/lint pipeline to SolidJS and port framework-pure helpers, types, and icon assets (completed 2026-06-01)
- [x] **Phase 2: Stateless Atoms** - Port all 12 stateless atom components using the canonical mergeProps+splitProps pattern (completed 2026-06-01)
- [ ] **Phase 3: Stateful Atoms + Carousel** - Port form atoms (createSignal) and the Carousel lifecycle-complexity outlier
- [x] **Phase 4: Compound, Portal + Composite** - Port all compound/portal components (createContext, signal-wrapped refs, Portal) and composite components; resolve Drawer.Trigger cloneElement design decision (completed 2026-06-01)
- [x] **Phase 5: Tests** - Rewrite all 18 test files for @solidjs/testing-library + Vitest; normalize filenames to PascalCase (completed 2026-06-01)
- [ ] **Phase 6: Storybook** - Spike-validate storybook-solidjs-vite against Storybook 10, then port all 37 stories
- [ ] **Phase 7: CLI + Release** - Rename CLI bin, update docs, dry-run publish, verify solid export condition in smoke consumer

## Phase Details

### Phase 1: Toolchain + Foundation
**Goal**: The Solid build/test/lint pipeline is fully operational and all shared library primitives (helpers, types, icons) are ported, so every subsequent phase can build, test, and lint without encountering React imports
**Depends on**: Nothing (first phase)
**Requirements**: TOOL-01, TOOL-02, TOOL-03, TOOL-04, TOOL-05, TOOL-06, TOOL-07, FND-01, FND-02, FND-03, FND-04
**Success Criteria** (what must be TRUE):
  1. `vite build --lib` completes with zero errors, emitting ESM + `.d.ts`; the `solid` export condition in package.json resolves to the preserved-JSX output
  2. `vitest run` executes on an empty/barrel entry with no "Client-only API called on server side" failure, confirming `resolve.conditions` fix is in place
  3. `eslint-plugin-solid/no-destructure` fires on a deliberate destructure test case, confirming the rule is active before any component is touched
  4. `packages/src/assets/icons/` renders identical SVG output as Solid `Component<JSX.SvgSVGAttributes<SVGSVGElement>>` — no React FC imports remain
  5. `packages/src/helpers/` and `packages/src/types/` compile with zero React imports; barrel generator produces a valid Solid barrel
**Plans**: 3 plans
- [x] 01-01-PLAN.md — Toolchain swap: deps, tsconfigs, vite/vitest/eslint configs, package rename + solid export condition, stub entry (TOOL-01..06)
- [x] 01-02-PLAN.md — Foundation: port 5 icons to Solid, verify helpers/types React-free, verify barrel generator (FND-01..04)
- [x] 01-03-PLAN.md — TOOL-07 validation gate: prove build+test+lint green on stub, confirm solid/no-destructure fires (TOOL-07)

### Phase 2: Stateless Atoms
**Goal**: All 12 stateless atom components are ported to SolidJS and passing tests, establishing the canonical mergeProps+splitProps pattern that every later phase will replicate mechanically
**Depends on**: Phase 1
**Requirements**: ATOM-01
**Success Criteria** (what must be TRUE):
  1. Button, IconButton, Badge, Tag, Chip, Avatar, Loader, CircularProgress, LinearProgress, Placeholder, Alert, and Breadcrumb each render in a Solid test asserting real DOM output and correct Tailwind class names
  2. Zero prop destructuring in any ported component — `eslint-plugin-solid/no-destructure` reports no violations across the atoms directory
  3. Public API (component name, prop names, exported types) is identical to the React version for all 12 atoms
**Plans**: 5 plans
- [x] 02-01-PLAN.md — Port Button, IconButton, Tag (button/div spread atoms) + minimal Solid tests
- [x] 02-02-PLAN.md — Port Badge, Chip (createSignal), Avatar (User-icon fallback) + tests
- [x] 02-03-PLAN.md — Port Loader, CircularProgress, LinearProgress, Placeholder + tests
- [x] 02-04-PLAN.md — Port Alert, Breadcrumb (compound Object.assign atoms) + tests
- [x] 02-05-PLAN.md — Regen barrel, repoint src/index.ts, eslint un-ignore, vitest include, build(dual)+test+lint green gate

### Phase 3: Stateful Atoms + Carousel
**Goal**: All form atom components and Carousel are ported with local signals and correct Solid lifecycle, validating createSignal, onMount, onCleanup, and onInput patterns before they appear in the more complex compound layer
**Depends on**: Phase 2
**Requirements**: FORM-01, FORM-02
**Success Criteria** (what must be TRUE):
  1. Checkbox, Radio, Switch, Input, Textarea, FormGroup, and SegmentedControl each pass a Solid test asserting controlled and uncontrolled behavior, with `onInput` (not `onChange`) for text inputs
  2. Carousel passes a Solid test asserting scroll-position updates and event-listener cleanup; no `useEffect`, `useCallback`, or `useRef` imports remain in its source
  3. Zero prop destructuring across all ported form components and Carousel
**Plans**: 5 plans
- [x] 03-01-PLAN.md — Port Checkbox, Input, Textarea (trivial pass-through trio) + tests [Wave 1]
- [x] 03-02-PLAN.md — Port FormGroup (compound), Switch (onChange→onInput) + tests [Wave 1]
- [x] 03-03-PLAN.md — Port Radio (Group name-injection via context), SegmentedControl (context + createSignal selection) + tests [Wave 1]
- [x] 03-04-PLAN.md — Port Carousel (let reelRef, createSignal×2, onMount/onCleanup) + scroll-state/cleanup test [Wave 1]
- [x] 03-05-PLAN.md — Regen barrel, extend src/index.ts, eslint un-ignore, build(dual)+test+lint green gate (human-verify) [Wave 2]

### Phase 4: Compound, Portal + Composite
**Goal**: All compound/portal components (Dialog, Drawer, BottomSheet, Snackbar, Tooltip, Dropdown, Menu, Select) and composite components (Accordion, TabList, Table, List, Pagination, Authenticator) are ported with createContext, signal-wrapped refs, and `<Portal>`, completing the entire 37-component set; the Drawer.Trigger cloneElement replacement is decided and documented before implementation begins
**Depends on**: Phase 3
**Requirements**: CMPD-01, CMPD-02, COMP-01
**Success Criteria** (what must be TRUE):
  1. Dialog, Drawer, BottomSheet, Snackbar, Tooltip, Dropdown, Menu, and Select each pass a Solid test asserting open/close state, Portal mounting to document.body, and correct compound API (`Root.Trigger`, `Root.Content`)
  2. `Drawer.Trigger` renders without `React.cloneElement`; the chosen replacement (wrapper span / display:contents / documented DOM change) is recorded in PROJECT.md Key Decisions and produces a passing DOM-assertion test
  3. Accordion, TabList, Table, List, Pagination, and Authenticator each pass a Solid test using `<For>`/`<Show>` rendering; Table source has zero `@tanstack/react-table` imports
  4. All 37 component source files are free of React imports (`react`, `react-dom`, `@types/react`)
**Notes**: DESIGN DECISION RESOLVED — Drawer.Trigger + BottomSheet.Trigger `cloneElement` → `display:contents` span; recorded in PROJECT.md Key Decisions (Accepted). Dropdown.Trigger → display:contents span; TabList → createContext (SegmentedControl pattern). All 4 cloneElement sites removed.
**Plans**: 5 plans
- [x] 04-01-PLAN.md — Port Dialog, Drawer, BottomSheet (Portal + signal-ref context + display:contents Trigger) + tests [Wave 1]
- [x] 04-02-PLAN.md — Port Dropdown (display:contents Trigger), Menu, Select, Tooltip, Snackbar (Show) + tests [Wave 1]
- [x] 04-03-PLAN.md — Port Accordion, TabList (createContext, no clone), Pagination (createSignal + For) + tests [Wave 1]
- [x] 04-04-PLAN.md — Port Table (no tanstack), List, Authenticator (createSignal + Index + onInput) + tests [Wave 1]
- [x] 04-05-PLAN.md — Regen barrel, extend src/index.ts to all 37, eslint un-ignore-all, build(dual)+test+lint green gate (human-verify) [Wave 2]

### Phase 5: Tests
**Goal**: All 18 test files are rewritten for @solidjs/testing-library + Vitest with per-component parity to the React suite, filenames normalized to PascalCase, and the full suite passes green
**Depends on**: Phase 4
**Requirements**: TEST-01, TEST-02
**Success Criteria** (what must be TRUE):
  1. `vitest run` reports the full consolidated suite (34 single-source component tests + toolchain) passing with zero failures and zero skips
  2. Every test uses the `render(() => <Component />)` function-wrapper form required by @solidjs/testing-library; no `jest.*` references remain — all replaced by `vi.*`
  3. All test filenames are PascalCase (e.g., `Accordion.test.tsx`); no lowercase-initial test files exist; exactly ONE Solid test per component (no duplicate legacy+atom pairs)
**Consolidation**: ONE authoritative Solid test per component in `src/tests/atoms/` — 19 legacy React tests migrated+merged into their atom counterparts (parity >= legacy), 15 atom-only tests verified, flat legacy files deleted, accordion->Accordion normalized.
**Plans**: 5 plans
- [x] 05-01-PLAN.md — Merge Accordion/Alert/Badge/BottomSheet/Breadcrumb (legacy) + verify Authenticator/Avatar/Carousel/Checkbox [Wave 1]
- [x] 05-02-PLAN.md — Merge Button/CircularProgress/Dialog/Drawer/Dropdown (legacy, portals) + verify Chip/FormGroup/Input/LinearProgress [Wave 1]
- [x] 05-03-PLAN.md — Merge IconButton/List/Menu/Pagination/Snackbar (legacy) + verify Loader/Placeholder/Radio/SegmentedControl [Wave 1]
- [x] 05-04-PLAN.md — Merge Table/TabList/Tag/Tooltip (legacy) + verify Select(onChange parity)/Switch/Textarea [Wave 1]
- [x] 05-05-PLAN.md — Remove legacy ignores (vitest+eslint), full green gate (vitest+eslint+build), human-verify [Wave 2]

### Phase 6: Storybook
**Goal**: All 37 Storybook stories are ported to storybook-solidjs-vite with Storybook 10; a single Button story spike validates the renderer and addons before bulk porting, and `build-storybook` completes successfully
**Depends on**: Phase 5
**Requirements**: STORY-01, STORY-02
**Success Criteria** (what must be TRUE):
  1. A single Button story spike confirms `storybook-solidjs-vite@^10.1.1` renders controls, a11y, docs, and Chromatic addons correctly under the current Storybook 10 version; if blocked, the decision to pin Storybook 9 is made before proceeding
  2. All 37 stories use Solid CSF render format `render: (args) => <Component {...args} />` (NO double-wrapper — corrected by 06-RESEARCH.md for storybook-solidjs-vite v10); `@storybook/react-vite` is removed from the workspace
  3. `build-storybook` completes without errors; Table story imports `@tanstack/solid-table` (not `@tanstack/react-table`)
**Notes**: SPIKE RISK — storybook-solidjs-vite is community-maintained and lags core Storybook. Research de-risked the adapter (v10.1.1 SB10-compatible, all 5 addons compatible, render signature corrected to NO double-wrapper) but the Button spike still BLOCKING-gates before bulk porting. If the spike build fails, pin Storybook 9.x or drop the offending addon before porting the remaining 32 stories.
**UI hint**: yes
**Plans**: 6 plans
- [x] 06-01-PLAN.md — SPIKE (Wave 1, BLOCKING): deps/main.ts/preview.ts swap + LinksBlock + Button story + build-storybook green (human-verify) [STORY-01]
- [x] 06-02-PLAN.md — Wave 2: 8 stories (Accordion/Alert/Avatar/Badge/Breadcrumb/IconButton/List/Menu) + StarIcon/UserIcon [STORY-02]
- [x] 06-03-PLAN.md — Wave 2: 8 stories incl stateful useState→createSignal (Chip/SegmentedControl/Snackbar) + Carousel/Checkbox/Input/Textarea/Switch [STORY-02]
- [x] 06-04-PLAN.md — Wave 2: 8 portal/className stories (Dialog/Drawer/BottomSheet/Dropdown/Tooltip/Placeholder/Radio/Loader) [STORY-02]
- [x] 06-05-PLAN.md — Wave 2: 6 stories (CircularProgress/LinearProgress/Tag/Pagination/TabList/Select) + Version + gettingStarted.mdx [STORY-02]
- [x] 06-06-PLAN.md — Wave 3 final gate: Table→@tanstack/solid-table + full build-storybook green (all 37) + React-remnant sweep (human-verify) [STORY-02]

### Phase 7: CLI + Release
**Goal**: The CLI scaffolder emits Solid templates under the renamed bin, README and CHANGELOG are updated for the 3.0.0 major release, and `npm publish --dry-run` passes with the `solid` export condition verified in a smoke consumer
**Depends on**: Phase 6
**Requirements**: CLI-01, REL-01, REL-02
**Success Criteria** (what must be TRUE):
  1. `npx @moondesignsystem/solid --add button` (via `bin/moon-solid`) scaffolds a valid Solid component template; `bin/moon-react` no longer exists and the `package.json` `bin` field is updated
  2. `npm publish --dry-run` exits zero with no missing-file or missing-export-condition errors
  3. A fresh SolidJS + Vite consumer project installs the package via `file:../packages` and renders a component, resolving through the `solid` export condition (not the `import` condition)
**Plans**: 3 plans
- [ ] 07-01-PLAN.md — CLI bin rename moon-react→moon-solid (file + package.json value) + MOON_SOLID_ARGS rename + scaffold-then-typecheck Solid (CLI-01) [Wave 1]
- [ ] 07-02-PLAN.md — README (root + packages) Solid rewrite + CHANGELOG 3.0.0 React→Solid entry + prepared major changeset (REL-01) [Wave 1]
- [ ] 07-03-PLAN.md — npm publish --dry-run + tarball audit + smoke-consumer solid-condition + whole-repo milestone gate (human-verify) (REL-02 + D-07) [Wave 2]

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Toolchain + Foundation | 3/3 | Complete   | 2026-06-01 |
| 2. Stateless Atoms | 5/5 | Complete   | 2026-06-01 |
| 3. Stateful Atoms + Carousel | 5/5 | Complete   | 2026-06-01 |
| 4. Compound, Portal + Composite | 5/5 | Complete   | 2026-06-01 |
| 5. Tests | 5/5 | Complete   | 2026-06-01 |
| 6. Storybook | 6/6 | Complete   | 2026-06-01 |
| 7. CLI + Release | 0/3 | Not started | - |
