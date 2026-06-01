# Phase 3: Stateful Atoms + Carousel - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning
**Mode:** Auto (--auto) — decisions locked from Phase 1/2 pattern + research + direct source read

<domain>
## Phase Boundary

Port the form-atom components and Carousel from React to SolidJS. Covers FORM-01 (Checkbox, Radio, Switch, Input, Textarea, FormGroup, SegmentedControl) and FORM-02 (Carousel). Validates `createSignal`, `onMount`/`onCleanup`, local `let` ref, and `onInput` (not `onChange`) patterns before they appear in the more complex Phase-4 compound layer. Public API + class-output parity vs React originals is the contract.

</domain>

<decisions>
## Implementation Decisions

### Reality check from source read (important)
Most "form atoms" are actually **stateless pass-through wrappers** — they take native input props and forward them; no internal state. They follow the EXACT Phase-2 canonical pattern (mergeProps + splitProps + inline `class={mergeClasses(...)}` + `{...rest}`):
- **Checkbox** — `Omit<ComponentProps<"input">, "type">` + `label?`. Two return branches (with-label `<label><input/><span/></label>` vs bare input). Stateless.
- **Input** — `Omit<ComponentProps<"input">, "size">` + size/variant/error. Stateless.
- **Textarea, Radio, Switch, FormGroup, SegmentedControl** — read each; expected stateless pass-through (same pattern). SegmentedControl may have internal selection state — READ IT; if it uses useState, port via createSignal like Chip.

So FORM-01 is mostly more of the Phase-2 atom pattern. The genuinely new work is Carousel.

### D-01 — Canonical pattern (same as Phase 2, applies to all form atoms)
mergeProps (defaults: size="md", variant="fill", error=false, etc. — match React exactly) + splitProps (local styling/label keys vs `rest`). NO destructuring. `class` not `className` (prop + attr). `Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "size"|"type">` etc. replaces `Omit<React.ComponentProps<"input">, ...>`. `JSX.Element` for children. Inline reactive `class={mergeClasses(...)}`. `{...rest}` spread. Two-branch components (Checkbox with/without label) keep both branches; in Solid use a plain ternary or `<Show>` — ternary is lower-churn and fine for parity. Zero `from "react"`.

### D-02 — Controlled inputs: onInput not onChange (PITFALLS)
React's `onChange` on `<input>`/`<textarea>` fires on every keystroke; Solid's `onChange` fires only on blur. These components are PASS-THROUGH (they forward whatever handler the consumer passes via `{...rest}`), so they don't hardcode onChange — but: do NOT introduce any `onChange` binding for live value tracking; if any component reads/controls value internally, use `onInput`. Document the semantic difference for consumers (Solid `onChange`=blur) but no code change needed for pure pass-through. SegmentedControl, if stateful, must use `onInput`/`onClick` appropriately.

### D-03 — Carousel (FORM-02, the complexity outlier — only component using useEffect+useCallback+useRef together)
React → Solid translation, exact:
- `import React, { useRef, useState, useEffect, useCallback }` → `import { createSignal, onMount, onCleanup, type Component, type JSX } from "solid-js"` (+ icon imports unchanged, now Solid icons).
- `const reelRef = useRef<HTMLDivElement>(null)` → `let reelRef!: HTMLDivElement;` (LOCAL ref, single component — plain `let` is correct here; NOT signal-wrapped, because it is not shared via context). `ref={reelRef}` on the reel div. Access as `reelRef` directly (not `.current`).
- `const [canScrollStart, setCanScrollStart] = useState(false)` → `const [canScrollStart, setCanScrollStart] = createSignal(false)`; getter CALLED in JSX (`disabled={!canScrollStart()}`).
- `const [canScrollEnd, setCanScrollEnd] = useState(true)` → `createSignal(true)`.
- `updateScrollState`/`handleScroll` wrapped in `useCallback(..., [])` → plain functions (Solid doesn't recreate handlers per render; useCallback has no equivalent and is not needed). Keep their bodies identical (reel.scrollLeft, getComputedStyle, scrollBy, RTL logic — all DOM, unchanged). Replace `reelRef.current` with `reelRef`.
- `useEffect(() => { ...addEventListener...; return () => ...removeEventListener... }, [updateScrollState])` → `onMount(() => { ...; onCleanup(() => { ...removeEventListener... }); })`. The cleanup goes inside `onMount` via `onCleanup`. Initial `updateScrollState()` call stays.
- Sub-components `Item` and `Control`: same atom pattern (splitProps, class not className, `{...rest}`). `Control`'s conditional icon `direction === "next" ? <ChevronRight/> : <ChevronLeft/>` — keep ternary (icons are ported Solid components). `Control` keeps `onClick={() => onScrollDirection(local.direction)}` and `aria-label`.
- Compound API preserved: `Object.assign(Root, { Item })`. `ScrollDirections` type export unchanged.
- Drop `.displayName`.

### D-04 — Wiring (final task)
After porting: `npm run barrels`, add the new components to `src/index.ts` explicit export list (alongside the 12 atoms — keep the explicit-export approach so unported Phase-4 components stay out of the build graph), un-ignore the new components in `eslint.config.js`. Gate: `npm run build` (dual .js+.jsx+.d.ts) + `vitest run` + `eslint .` all green.

### D-05 — Tests
Minimal per-component Solid tests in `src/tests/atoms/` (or a `src/tests/forms/` subdir): render + class-parity assertions; Carousel test asserts scroll-state class/disabled behavior + that event listeners are cleaned up (onCleanup) — e.g. render then unmount, assert no error / listener removed. Satisfies FORM-01/02 "passing tests" criterion; full suite is Phase 5.

### Claude's Discretion
- Whether form-atom tests live in src/tests/atoms/ or a new src/tests/forms/ subdir (must be covered by vitest `include` glob — extend if new dir).
- Exact Solid JSX attribute types per element.
- Ternary vs `<Show>` for two-branch components (ternary preferred for parity/low-churn).

</decisions>

<specifics>
## Specific Ideas

- Verified source: Carousel (useRef+useState×2+useEffect+useCallback×2, compound Root+Item+Control, uses ChevronLeft/Right icons), Checkbox (label branch + bare branch, Omit type), Input (size/variant/error, Omit<...,"size">).
- READ each remaining form atom (Radio, Switch, Textarea, FormGroup, SegmentedControl) before porting — confirm stateless vs stateful. SegmentedControl is the one most likely to hold selection state; if so, port its useState → createSignal with getter-call semantics.
- Carousel's local `let reelRef` is the validation case for D-03's "plain let ref for single-component DOM refs" — distinct from Phase 4's signal-wrapped refs shared via context.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Pattern + decisions
- `.planning/phases/03-stateful-atoms-carousel/03-CONTEXT.md` — this file
- `.planning/phases/02-stateless-atoms/02-CONTEXT.md` — canonical atom pattern D-01..D-09 (form atoms reuse it)
- `MIGRATION-CONTEXT.md` — Carousel/refs/effects translation notes
- `.planning/research/FEATURES.md` — createSignal getter-call, onMount/onCleanup, controlled inputs, let-ref vs signal-ref
- `.planning/research/PITFALLS.md` — onInput not onChange (#4), onCleanup (#4), let-ref reactivity (#3), getter semantics (#2)

### Established toolchain (Phases 1-2)
- `packages/vite.config.ts`, `packages/scripts/build-solid-condition.mjs` — dual build
- `packages/eslint.config.js` — un-ignore pattern for newly ported components (negated entries); solid/no-destructure must stay green
- `packages/vitest.config.ts` — test include globs
- `packages/src/index.ts` — explicit export list to extend
- `packages/src/components/Chip.tsx` — reference for createSignal + getter-call (stateful atom precedent)
- `packages/src/components/Button.tsx`, `Alert.tsx` — reference for atom + compound pattern

### Source of truth (parity targets)
- `packages/src/components/Carousel.tsx`, Checkbox.tsx, Radio.tsx, Switch.tsx, Input.tsx, Textarea.tsx, FormGroup.tsx, SegmentedControl.tsx — READ each before porting

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Phase-2 canonical atom pattern — form atoms reuse verbatim
- Chip.tsx — createSignal + getter-call precedent for any stateful form atom
- Ported Solid icons (ChevronLeft/Right) — Carousel.Control uses them
- mergeClasses, dual-build pipeline, eslint un-ignore mechanism — all established

### Established Patterns
- Compound via Object.assign (Carousel: Root+Item+Control)
- Two-branch render (Checkbox with/without label) — ternary
- Explicit src/index.ts export list (keeps unported components out of build graph)

### Integration Points
- generate-barrel.cjs, src/index.ts, eslint.config.js, vitest.config.ts — same wiring as Phase 2

</code_context>

<deferred>
## Deferred Ideas

- Compound/portal components (Dialog, Drawer, BottomSheet, Snackbar, Tooltip, Dropdown, Menu, Select) — Phase 4
- Composite (Accordion, TabList, Table, List, Pagination, Authenticator) — Phase 4
- Full test-suite rewrite — Phase 5 (minimal per-component tests added here)
- Storybook — Phase 6

</deferred>

---

*Phase: 03-stateful-atoms-carousel*
*Context gathered: 2026-06-01*
