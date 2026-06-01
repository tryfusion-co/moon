# Phase 2: Stateless Atoms - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning
**Mode:** Auto (--auto) — pattern is uniform and mechanical; decisions locked from Phase 1 toolchain + research + direct source read

<domain>
## Phase Boundary

Port the 12 stateless atom components from React to SolidJS, establishing the canonical `mergeProps` + `splitProps` translation pattern that every later component phase replicates. Covers requirement ATOM-01. No state, no refs, no effects, no portals — pure render functions. Public API (names, props, exported types) and Tailwind class output must be identical to the React version.

### The 12 atoms
Button, IconButton, Badge, Tag, Chip, Avatar, Loader, CircularProgress, LinearProgress, Placeholder, Alert, Breadcrumb.

Note: Alert and Breadcrumb are **compound** (Alert.Close/Content/Action/Meta via `Object.assign`; Breadcrumb.Item) — but stateless, so they belong here. The `Object.assign(Root, {...})` compound pattern is plain JS and carries over unchanged.

</domain>

<decisions>
## Implementation Decisions

### Canonical translation pattern (D-01 — applies to every atom, established here, replicated in Phases 3-4)
The React form:
```tsx
import React from "react";
import mergeClasses from "../helpers/mergeClasses";
import type { Sizes, Variants, Contexts } from "../types";

type ButtonProps = React.ComponentProps<"button"> & { variant?: ...; size?: ...; isFullWidth?: boolean; className?: string };

const Button = ({ className, variant = "fill", size = "md", context = "brand", isFullWidth, ...props }: ButtonProps) => (
  <button className={mergeClasses("moon-button", variant !== "fill" && `moon-button-${variant}`, ..., className)} {...props} />
);
Button.displayName = "Button";
export default Button;
```
becomes the Solid form:
```tsx
import { mergeProps, splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Sizes, Variants, Contexts } from "../types";

export type ButtonSizes = Extract<Sizes, "xs" | "sm" | "md" | "lg" | "xl">;
export type ButtonVariants = Variants;

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariants;
  size?: ButtonSizes;
  context?: Contexts;
  class?: string;        // NOTE: class, not className
  isFullWidth?: boolean;
};

const Button: Component<ButtonProps> = (props) => {
  const merged = mergeProps({ variant: "fill", size: "md", context: "brand" }, props);
  const [local, rest] = splitProps(merged, ["class", "variant", "size", "context", "isFullWidth"]);
  return (
    <button
      class={mergeClasses(
        "moon-button",
        local.variant !== "fill" && `moon-button-${local.variant}`,
        local.size !== "md" && `moon-button-${local.size}`,
        local.context !== "brand" && `moon-button-${local.context}`,
        local.isFullWidth && "moon-button-full-width",
        local.class
      )}
      {...rest}
    />
  );
};

export default Button;
```

### Hard rules (D-02..D-09)
- **D-02:** NEVER destructure props at the parameter (kills Solid reactivity — `solid/no-destructure` from Phase 1 enforces this; eslint must stay green). Use `mergeProps` for defaults + `splitProps` to separate local keys from passthrough `rest`.
- **D-03:** `className` → `class` everywhere (prop name AND JSX attribute). The exported prop type changes `className?: string` → `class?: string`. (This is a deliberate, accepted public-API change — Solid uses `class`; documented in PROJECT.md.)
- **D-04:** `React.ComponentProps<"button">` → `JSX.ButtonHTMLAttributes<HTMLButtonElement>` (and `"div"` → `JSX.HTMLAttributes<HTMLDivElement>`, `"li"` → `JSX.LiHTMLAttributes<HTMLLIElement>`, `"span"` → `JSX.HTMLAttributes<HTMLSpanElement>`, etc.). `React.ReactNode` → `JSX.Element`. `React.MouseEventHandler<HTMLElement>` → `JSX.EventHandlerUnion<HTMLElement, MouseEvent>` (or simplest accurate Solid type).
- **D-05:** The `class={mergeClasses(...)}` expression stays INLINE in JSX (Solid tracks it reactively). Do NOT hoist it into a non-reactive const.
- **D-06:** `{...props}` spread → `{...rest}` (the second tuple element from `splitProps`). Spreading the post-split `rest` preserves reactivity; never spread the raw `props` after also reading individual keys from it.
- **D-07:** Compound atoms (Alert, Breadcrumb): keep `Object.assign(Root, { Sub1, Sub2 })`. Each sub-component follows the same no-destructure pattern. `props.children` accessed via `local.children` (split) or `props.children` directly — never destructured.
- **D-08:** Drop `.displayName` assignments (Solid has no function-component name registry that uses them). Harmless to keep, but remove for cleanliness — does not affect output. (Planner may keep if it reduces churn; not load-bearing.)
- **D-09:** Exported type names stay IDENTICAL (`ButtonSizes`, `ButtonVariants`, `BadgeVariants`, `ChipSizes`, etc.) so the barrel's `export type { ... }` lines are unchanged. The barrel is regenerated via `generate-barrel.cjs`.

### Class-output parity (the contract)
Every emitted `class` string must match the React version's `className` exactly: same `moon-*` base, same conditional modifier order, same `local.class` appended last. Tests assert this.

### Wiring back into the barrel
- After porting, run `npm run barrels` (generate-barrel.cjs) so `src/components/index.ts` re-exports the 12 atoms.
- Repoint `src/index.ts` from the Phase-1 stub back to `export * from "./components"` (or have the barrel cover it) so the build emits the real components. Confirm `npm run build` still emits `.js` + raw-JSX `.jsx` + `.d.ts` for each atom (Phase 1 two-pass pipeline).

### Claude's Discretion
- Exact Solid JSX attribute type per element (pick the most accurate `JSX.*HTMLAttributes`).
- Whether to keep or drop `displayName`.
- Per-atom `splitProps` key list (must cover every local/styling prop so only valid DOM attrs land in `rest`).

</decisions>

<specifics>
## Specific Ideas

- Pattern verified against real source: Button (props spread + size/variant/context/isFullWidth), Badge (children + variant/context, no spread), Alert (compound: Root + Close/Content/Action/Meta, uses CloseIcon default), Breadcrumb (compound: nav>ol Root + li Item with isActive + spread).
- Alert.Close renders `{children ? children : <CloseIcon />}` — CloseIcon is the already-ported Solid icon from Phase 1. Conditional can stay as ternary or become `<Show>`; ternary is fine and lower-churn for parity.
- IconButton/Chip/Tag/Avatar/Loader/CircularProgress/LinearProgress/Placeholder follow the identical pattern — planner/executor read each source file before porting; do not assume prop shapes, read them.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Translation pattern + decisions
- `.planning/phases/02-stateless-atoms/02-CONTEXT.md` — this file (canonical pattern D-01..D-09)
- `MIGRATION-CONTEXT.md` — original React→Solid translation map
- `.planning/research/FEATURES.md` — splitProps/mergeProps idioms, table-stakes mappings, anti-features (no destructuring)
- `.planning/research/PITFALLS.md` — props-destructure trap, signal-getter semantics, class vs className

### Established toolchain (Phase 1)
- `.planning/phases/01-toolchain-foundation/01-CONTEXT.md` — toolchain decisions (build two-pass, eslint no-destructure)
- `packages/vite.config.ts`, `packages/scripts/build-solid-condition.mjs` — dual build (.js compiled + .jsx raw); ported components must build through both
- `packages/eslint.config.js` — solid/no-destructure must stay green
- `packages/src/assets/icons/Close.tsx` (+ others) — reference for the already-ported Solid Component shape

### Source of truth (parity targets)
- `packages/src/components/*.tsx` — the 12 React atoms being ported (READ each before porting; class output is the parity contract)
- `packages/src/components/index.ts` — barrel with exact exported type names to preserve
- `packages/src/helpers/mergeClasses.ts`, `packages/src/types/index.ts`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `mergeClasses` helper — used identically; class expression stays inline for reactivity
- Ported Solid icons (`assets/icons/*`) — consumed by Alert (CloseIcon) and possibly IconButton/Chip
- Phase 1 dual-build pipeline — ported atoms flow through it unchanged

### Established Patterns
- Compound components via `Object.assign(Root, {...})` — Alert, Breadcrumb (this phase); same mechanism reused for Dialog/Menu/etc. in Phase 4
- Tailwind-class styling via `mergeClasses("moon-x", cond && "moon-x-mod", class)` — conditional modifier order is the parity contract

### Integration Points
- `generate-barrel.cjs` regenerates `components/index.ts` after atoms land
- `src/index.ts` repointed from Phase-1 stub to real components barrel

</code_context>

<deferred>
## Deferred Ideas

- Stateful form atoms + Carousel — Phase 3 (createSignal, onMount/onCleanup, onInput)
- Compound/portal components (Dialog, Drawer, etc.) — Phase 4
- Tests for these atoms — Phase 5 (a minimal render+class-assertion test may be added per-atom during this phase to satisfy ATOM-01's "passing tests" criterion; full suite rewrite is Phase 5)
- Storybook stories — Phase 6

Note: ROADMAP success criteria for Phase 2 say atoms are "ported AND passing tests". Planner should decide whether to author minimal per-atom Solid render/class-parity tests now (recommended, satisfies the criterion) or rely on the Phase 1 toolchain test + defer full coverage to Phase 5. Lean toward minimal tests now so the phase verifies green.

</deferred>

---

*Phase: 02-stateless-atoms*
*Context gathered: 2026-06-01*
