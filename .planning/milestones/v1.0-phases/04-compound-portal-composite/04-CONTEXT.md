# Phase 4: Compound, Portal + Composite - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning
**Mode:** Auto (--auto) — patterns locked from research + Phase 1-3 precedent + direct source read; the one design decision (Drawer.Trigger) resolved by user

<domain>
## Phase Boundary

Port the remaining 18 components — completing the full 37-component set. Two groups:
- **Compound/Portal (8):** Dialog, Drawer, BottomSheet, Snackbar, Tooltip, Dropdown, Menu, Select — `createContext`/`useContext`, signal-wrapped shared refs, `<Portal>`.
- **Composite (6):** Accordion, TabList, Table, List, Pagination, Authenticator — `<For>`/`<Show>`/`<Index>` where map/conditionals, local state, some context.
Plus the remaining simple ones in the set as read. Covers CMPD-01, CMPD-02, COMP-01. Class-output parity + identical public API is the contract.

</domain>

<decisions>
## Implementation Decisions

### React-feature map (from source scan — guides per-component approach)
| Component | React features | Solid translation |
|-----------|---------------|-------------------|
| Dialog | createPortal, useRef, createContext | signal-ref + `<Portal>` + context (getter); Trigger wraps in `<p onClick>` (no clone) |
| Drawer | createPortal, useRef, createContext, **cloneElement** | signal-ref + `<Portal>` + context; **Trigger = display:contents span (DECIDED)** |
| BottomSheet | createPortal, useRef, createContext, **cloneElement** | same as Drawer; Trigger = display:contents span |
| Snackbar | (none flagged) | read source — likely stateless/CSS or simple state |
| Tooltip | (none flagged) | read — likely CSS-hover/stateless wrapper |
| Dropdown | **cloneElement** | Trigger clone → display:contents span OR context prop-injection (read source: if injecting props into known child use context like Phase-3 Radio; if attaching onClick to arbitrary child use display:contents span) |
| Menu | (none flagged) | read — likely compound stateless |
| Select | (none flagged) | read — likely compound; may have selection state → createSignal |
| Accordion | useState | createSignal (open/active item); `<For>` over items if mapping |
| TabList | **cloneElement**, Children., useState | createSignal (active tab) + context to inject active state into children (replace Children.map/cloneElement with context, like Phase-3 SegmentedControl register() pattern); `<For>` if mapping |
| Table | (none flagged) | read — likely renders rows via map → `<For>`; stateless |
| List | (none flagged) | read — likely map → `<For>`; stateless/compound |
| Pagination | useState | createSignal (current page); `<For>`/`<Index>` over page numbers |
| Authenticator | useRef, useState | createSignal + let-ref (local, like Carousel) |

### D-01 — Signal-wrapped shared refs (Dialog/Drawer/BottomSheet) — CMPD-01
React: `const dialogRef = useRef<HTMLDialogElement|null>(null)`; context `{ dialogRef }`; `dialogRef.current?.showModal()`.
Solid (plain `let` is NOT reactive across context):
```tsx
const [dialogRef, setDialogRef] = createSignal<HTMLDialogElement>();
// <dialog ref={setDialogRef}> ...
// context value: { dialogRef }  (share the GETTER)
// consumers: dialogRef()?.showModal() / dialogRef()?.close()
```
Context type becomes `{ dialogRef: Accessor<HTMLDialogElement | undefined> }`. Provider value `{ dialogRef }`. NEVER destructure context consumers' props.

### D-02 — Portal — CMPD-01
React `createPortal(node, document.body)` → Solid `<Portal mount={document.body}>{node}</Portal>` from `solid-js/web`. The portaled `<dialog>` keeps `ref={setDialogRef}` + same class output (moon-dialog/moon-drawer/etc.) + the `<form method="dialog" class="moon-backdrop">` close form unchanged.

### D-03 — Drawer.Trigger / BottomSheet.Trigger cloneElement → display:contents span (CMPD-02, DECIDED by user)
React `cloneElement(children, { onClick: handleClick })` →
```tsx
const Trigger = (props) => {
  const { drawerRef } = useDrawerContext();
  return (
    <span style={{ display: "contents" }} onClick={() => drawerRef()?.showModal()}>
      {props.children}
    </span>
  );
};
```
`display:contents` makes the span generate no layout box — the child lays out as if a direct child. Adds one DOM node (vs React's clone) — accepted, documented divergence (PROJECT.md Key Decisions). Apply the SAME pattern to BottomSheet.Trigger. Dialog.Trigger keeps its existing `<p onClick>` wrapper (React Dialog didn't clone). Do NOT introduce React.cloneElement anywhere (forbidden; eslint/grep gate = 0 cloneElement/Children).

### D-04 — Dropdown / TabList cloneElement
- **Dropdown**: read source. If Trigger attaches onClick to arbitrary child → display:contents span (D-03 pattern). If it injects props into known children → context.
- **TabList**: uses Children.map + cloneElement + useState to inject active-tab state into tab children → replace with `createSignal(activeTab)` + `createContext` (TabListContext) providing active index + setter; children read context (like Phase-3 SegmentedControl register() counter for tab indices). `<For>` if tabs are mapped from data.

### D-05 — Composite: lists & conditionals — COMP-01
- `array.map(...)` in JSX → `<For each={...}>{(item) => ...}</For>` (or `<Index>` when index-keyed). Table rows, List items, Pagination page numbers.
- Conditional `cond && <X/>` / ternaries → keep ternary OR `<Show when={...}>`; ternary is fine and lower-churn — but for falsy-leak safety (Solid renders `0`/`""`) prefer `<Show>` where the condition could be a falsy non-boolean.
- Local state (Accordion open item, Pagination current page, Authenticator) → createSignal, getter-CALLED in JSX.
- Authenticator useRef → local `let ref` (single component, like Carousel).

### D-06 — Canonical atom pattern still applies to every sub-component
All leaf/sub-components (Headers, Content, Close, Item, Title, etc.) use mergeProps+splitProps (no destructure), class not className, inline `class={mergeClasses(...)}`, `{...rest}`, JSX.* types, `JSX.Element` for children, zero `from "react"`/`react-dom`. Compound API via `Object.assign(Root, {...})` preserved for ALL compound components. Exported type names preserved (e.g. SelectSizes/SelectVariants, MenuSizes, TabListSizes, TableSizes, ListSizes, SnackbarVariants).

### D-07 — Wiring (final task)
After porting all 18: `npm run barrels`, extend src/index.ts to export ALL 37 components (drop the explicit-list restriction now that every component is ported — can switch to `export * from "./components"` SAFELY since nothing unported remains, OR keep explicit list of all 37), remove the eslint ignore for the now-fully-ported components directory (lint ALL components). Gate: `npm run build` (dual .js+.jsx+.d.ts for all 37) + `vitest run` + `eslint .` green.

### D-08 — Tests
Minimal per-component Solid tests: render + class parity; for portal components assert the portaled content mounts (Portal) and showModal/close wiring via the signal ref; for cloneElement-replaced triggers assert the open handler fires; for composites assert For-rendered items + state behavior. Full suite is Phase 5.

### Claude's Discretion
- Whether final src/index.ts uses `export * from "./components"` (now safe — all ported) or stays explicit.
- `<Show>` vs ternary per conditional (use `<Show>` for falsy-leak-prone conditions).
- Exact Solid event/JSX types.
- Whether to read remaining unflagged components (Snackbar/Tooltip/Menu/Select/Table/List) reveals state needing createSignal — READ each before porting.

</decisions>

<specifics>
## Specific Ideas

- Verified source: Dialog (portal+ref+context, `<p>` trigger, no clone), Drawer (portal+ref+context+cloneElement trigger + Header/Content/Close subs, CloseIcon), BottomSheet (same as Drawer family).
- The signal-ref pattern (D-01) is the Phase-4 analog of Phase-1's "refs shared via context need signal-wrapping" note.
- 4 cloneElement sites total: Drawer.Trigger + BottomSheet.Trigger (→ display:contents span), Dropdown + TabList (→ display:contents span OR context, per source). Phase 3 already proved context-based prop injection (Radio/SegmentedControl) — reuse for TabList.
- READ Snackbar, Tooltip, Menu, Select, Table, List source before porting — feature scan flagged no hooks but they may still have local logic.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Pattern + decisions
- `.planning/phases/04-compound-portal-composite/04-CONTEXT.md` — this file (D-01..D-08; Drawer.Trigger decided)
- `.planning/PROJECT.md` — Key Decisions: Drawer.Trigger display:contents span, signal-ref-via-context (both Accepted)
- `MIGRATION-CONTEXT.md` — refs/Portal/cloneElement translation notes (Dialog ref case worked example)
- `.planning/research/FEATURES.md` — Portal, createContext, signal-ref, cloneElement-replacement, For/Show, Object.assign compound
- `.planning/research/PITFALLS.md` — context ref reactivity (#3), Portal context propagation (#8), Show vs && falsy leak (#6), children() helper (#5)

### Phase 1-3 precedent (reuse)
- `packages/src/components/Radio.tsx`, `SegmentedControl.tsx` — context-based cloneElement replacement (prop injection) — reuse for TabList
- `packages/src/components/Carousel.tsx` — local `let` ref + createSignal + onMount/onCleanup (Authenticator analog)
- `packages/src/components/Alert.tsx`, `Breadcrumb.tsx` — compound Object.assign precedent
- `packages/src/components/Chip.tsx` — createSignal getter-call + controlled/uncontrolled
- `packages/vite.config.ts`, `build-solid-condition.mjs`, `eslint.config.js`, `vitest.config.ts`, `src/index.ts` — established toolchain + wiring

### Source of truth (parity targets — READ each before porting)
- `packages/src/components/Dialog.tsx`, Drawer.tsx, BottomSheet.tsx, Snackbar.tsx, Tooltip.tsx, Dropdown.tsx, Menu.tsx, Select.tsx, Accordion.tsx, TabList.tsx, Table.tsx, List.tsx, Pagination.tsx, Authenticator.tsx
- `packages/src/components/index.ts` — exported type names to preserve

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Context-based prop injection (Radio/SegmentedControl) — TabList reuses
- Local let-ref + createSignal + onMount (Carousel) — Authenticator reuses
- Compound Object.assign, atom pattern, dual build, eslint un-ignore, mergeClasses — all established
- Ported Close/Chevron icons — Drawer/Dialog/BottomSheet Close use CloseIcon

### Established Patterns
- Explicit src/index.ts export list (extend to all 37, or switch to `export *` now safe)
- Dual build pipeline handles JSX in portaled content + Portal import from solid-js/web

### Integration Points
- generate-barrel.cjs, src/index.ts, eslint.config.js, vitest.config.ts — same wiring; this is the LAST component phase so src/index.ts becomes complete (all 37)

</code_context>

<deferred>
## Deferred Ideas

- Full test-suite rewrite (18 React test files → Solid) — Phase 5 (minimal per-component tests added here)
- Storybook — Phase 6
- CLI + Release — Phase 7

</deferred>

---

*Phase: 04-compound-portal-composite*
*Context gathered: 2026-06-01*
