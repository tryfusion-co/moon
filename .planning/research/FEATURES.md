# Feature Research

**Domain:** React→SolidJS 1:1 component library port (Moon Design System)
**Researched:** 2026-05-31
**Confidence:** HIGH (verified against official SolidJS docs, GitHub maintainer discussions, and real component source)

---

## Feature Landscape

This document maps every React pattern used in the Moon library to its SolidJS equivalent.
Categories are strict: **Table Stakes** must be reproduced exactly for API parity.
**Idiomatic Improvements** are safe only if they produce zero API/behavior change.
**Anti-Features** are patterns that look correct but break silently and must never appear.

---

### Table Stakes — Must Reproduce Exactly

These mappings are non-negotiable. Missing or wrong implementation breaks components.

---

#### TS-1: `useState` → `createSignal` (getter-call semantics)

**React pattern (Button, Accordion, Carousel):**
```tsx
const [isOpen, setIsOpen] = useState(false);
// read: isOpen (plain value)
// write: setIsOpen(true) or setIsOpen(prev => !prev)
```

**Solid equivalent:**
```tsx
import { createSignal } from "solid-js";

const [isOpen, setIsOpen] = createSignal(false);
// read: isOpen()   ← getter call is MANDATORY — omitting () gives you the function, not the value
// write: setIsOpen(true) or setIsOpen(prev => !prev)
```

**Gotchas:**
- `isOpen` is a function (getter). Writing `isOpen` in JSX without `()` passes the function reference — no error, wrong value, reactivity breaks silently.
- Inside JSX expressions `{isOpen()}` auto-tracks. Outside a reactive scope (plain JS variable), calling `isOpen()` is a one-time read with no tracking.
- The updater form `setIsOpen(prev => !prev)` works identically to React.
- `batch()` is available to coalesce multiple setter calls into one update cycle (equivalent to React 18 automatic batching, but explicit in Solid).

**Complexity:** LOW (mechanical substitution + `()` discipline)

---

#### TS-2: `useEffect` → `createEffect` + `onMount` + `onCleanup`

**React pattern (Carousel — the only `useEffect` user):**
```tsx
useEffect(() => {
  const reel = reelRef.current;
  if (!reel) return;
  updateScrollState();
  const handleScrollEvent = () => updateScrollState();
  const handleResize = () => updateScrollState();
  reel.addEventListener("scroll", handleScrollEvent);
  window.addEventListener("resize", handleResize);
  return () => {
    reel.removeEventListener("scroll", handleScrollEvent);
    window.removeEventListener("resize", handleResize);
  };
}, [updateScrollState]);
```

**Solid equivalents:**

Use `onMount` when the effect must run once after mount (no reactive dependencies):
```tsx
import { onMount, onCleanup } from "solid-js";

onMount(() => {
  const reel = reelRef; // plain let ref — already assigned at mount
  updateScrollState();

  const handleScroll = () => updateScrollState();
  const handleResize = () => updateScrollState();

  reel.addEventListener("scroll", handleScroll);
  window.addEventListener("resize", handleResize);

  onCleanup(() => {
    reel.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleResize);
  });
});
```

Use `createEffect` when the effect must re-run when a reactive value changes:
```tsx
import { createEffect, onCleanup } from "solid-js";

createEffect(() => {
  const value = someSignal(); // auto-tracked — effect re-runs when this changes
  doSomethingWith(value);
  onCleanup(() => cleanup());
});
```

**Gotchas:**
- `createEffect` has **no deps array**. Any signal read inside the function body auto-subscribes. Stop reading a signal → subscription drops automatically.
- `onMount` is `createEffect(() => untrack(fn))` internally — it runs exactly once, never re-runs.
- `onCleanup` placed **inside** `createEffect` runs on every re-execution (before the next run) — equivalent to React's cleanup return. Placed inside `onMount`, it runs on unmount only.
- **No async code in `createEffect`**. An `await` inside the effect body breaks tracking — dependencies accessed after the first `await` are not subscribed. For async effects, use `createResource` or split into nested effects.
- `useCallback` in React (Carousel uses it) is **not needed in Solid** — components execute once, so functions defined at component body level are stable by definition. Replace `useCallback(() => fn, [deps])` with a plain function or arrow function.

**Complexity:** MEDIUM (Carousel needs careful translation of the `useEffect`/cleanup pair)

---

#### TS-3: `useRef` — two forms, chosen by context

**React pattern:**
```tsx
const dialogRef = useRef<HTMLDialogElement | null>(null);
<dialog ref={dialogRef} />
dialogRef.current?.showModal();
```

**Solid form 1 — plain `let` ref (local use only):**
```tsx
let dialogRef!: HTMLDialogElement;
<dialog ref={dialogRef} />
// After mount:
dialogRef.showModal(); // no .current — Solid assigns the element directly
```
Use this when the ref is consumed only inside the same component that declares it (Carousel's `reelRef`).

**Solid form 2 — signal-wrapped ref (context-shared refs):**
```tsx
import { createSignal } from "solid-js";

const [dialogRef, setDialogRef] = createSignal<HTMLDialogElement | undefined>();
<dialog ref={setDialogRef} />
// Consumer via context:
dialogRef()?.showModal();
```
Use this when the ref must be passed through context to child components (Dialog, Drawer, BottomSheet). A plain `let` ref is not reactive — context consumers that read it cannot react to its assignment. Signal-wrapped refs make the assignment itself a reactive event.

**Gotchas:**
- `let ref!: T` — the `!` is a TypeScript non-null assertion. Solid assigns the element before any reactive scope runs, so the ref is populated before `onMount` fires.
- Do **not** write `ref.current` — Solid refs are direct element references, not objects with `.current`.
- `React.cloneElement(children, { onClick })` in Drawer.Trigger has no Solid equivalent. Replace with a wrapper element or use the `children` accessor helper to manipulate child props safely.

**Complexity:** LOW for local refs; MEDIUM for context-shared refs

---

#### TS-4: `createContext` + `useContext`

**React pattern (Dialog, Drawer):**
```tsx
const DialogContext = createContext<DialogContextType>(DEFAULT_DIALOG_CONTEXT);
const { dialogRef } = useContext(DialogContext);
```

**Solid equivalent:**
```tsx
import { createContext, useContext } from "solid-js";

const DialogContext = createContext<DialogContextType>(DEFAULT_DIALOG_CONTEXT);
// usage is identical:
const ctx = useContext(DialogContext);
ctx.dialogRef()?.showModal();
```

**Gotchas:**
- API surface is identical (`createContext`, `useContext`, `<Ctx.Provider value={...}>`). This is one of the closest 1:1 mappings.
- TypeScript: if no default value is passed to `createContext`, the return type includes `| undefined`, forcing null-checks everywhere. Always provide a typed default (current React code already does this via `DEFAULT_DIALOG_CONTEXT`) or use a narrowing wrapper:
  ```tsx
  function useDialogContext() {
    const ctx = useContext(DialogContext);
    if (!ctx) throw new Error("Must be used within <Dialog>");
    return ctx;
  }
  ```
  The current `useDrawerContext` in React already uses this pattern — preserve it in Solid.
- Context values containing signals must store the signal getter (the function), not the current signal value. Consumers call `ctx.dialogRef()` not `ctx.dialogRef`.
- `<Context.Provider value={...}>` syntax is identical. No change needed.

**Complexity:** LOW

---

#### TS-5: `createPortal` → `<Portal>`

**React pattern (Dialog, Drawer):**
```tsx
import { createPortal } from "react-dom";
return createPortal(<dialog ...>{children}</dialog>, document.body);
```

**Solid equivalent:**
```tsx
import { Portal } from "solid-js/web";

return (
  <Portal mount={document.body}>
    <dialog ...>{children}</dialog>
  </Portal>
);
```

**Gotchas:**
- Import is from `solid-js/web`, not `solid-js`. Easy to get wrong.
- `mount` prop accepts a DOM node (not an ID string). `document.body` works as-is.
- `<Portal>` wraps the content in a `<div>` inserted at the mount point by default. If the `<dialog>` must be a direct child of `document.body` (for `showModal()` stacking context), add `useShadow={false}` — but the default behavior is fine for `<dialog>` elements since `showModal()` uses the top-layer regardless of DOM nesting.
- `isSVG` prop exists for SVG portals — not needed here.
- Solid 1.4+ had a breaking change to Portal: it no longer wraps in a `<div>` inside Shadow DOM. Ensure `solid-js@^1.8` behavior is confirmed (the `mount` prop without Shadow DOM inserts directly).

**Complexity:** LOW

---

#### TS-6: `ReactNode` → `JSX.Element` and component type signatures

**React pattern:**
```tsx
type DialogProps = { children: React.ReactNode };
const Root = ({ children }: DialogProps) => ...;
```

**Solid equivalent:**
```tsx
import type { JSX, ParentComponent, Component, VoidComponent } from "solid-js";

// For components that accept children:
type DialogProps = { children: JSX.Element };
const Root: ParentComponent<Omit<DialogProps, "children">> = (props) => ...;

// Or inline:
const Root = (props: { children: JSX.Element }) => ...;

// For components with no children:
const CloseIcon: VoidComponent<{ class?: string }> = (props) => ...;

// For components with optional children:
const Component: ParentComponent<Props> = (props) => ...;
// ParentComponent<T> = Component<T & { children?: JSX.Element }>
```

**Gotchas:**
- `JSX.Element` in Solid covers: `HTMLElement | string | number | boolean | null | undefined | Function | JSX.Element[]`. It is broader than React's `ReactNode` but behaves equivalently in practice.
- `ParentComponent<P>` automatically adds `children?: JSX.Element` to props — use it for components that render `props.children`.
- `VoidComponent<P>` explicitly has no children prop — use for leaf components.
- `Component<P>` is the base: `(props: P) => JSX.Element`. Use when children typing needs to be explicit in the props interface.
- Children in Solid are reactive. Accessing `props.children` multiple times can cause re-creation. Use the `children()` accessor helper when you need to inspect or manipulate children:
  ```tsx
  import { children } from "solid-js";
  const resolved = children(() => props.children);
  // resolved() returns the evaluated children
  ```
  For simple passthrough (`{props.children}`), the helper is not needed.

**Complexity:** LOW (mostly type changes)

---

#### TS-7: `React.ComponentProps<"button">` → `ComponentProps` / `JSX` attributes

**React pattern:**
```tsx
type ButtonProps = React.ComponentProps<"button"> & { variant?: ButtonVariants };
type HeaderProps = React.ComponentProps<"summary">;
```

**Solid equivalent:**
```tsx
import type { ComponentProps, JSX } from "solid-js";

// Option A — ComponentProps utility (mirrors React.ComponentProps):
type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariants };

// Option B — JSX attribute interfaces (more explicit):
type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariants };
```

**Gotchas:**
- `ComponentProps<"button">` is available from `solid-js` and resolves to `JSX.ButtonHTMLAttributes<HTMLButtonElement>`. Either form works; `ComponentProps` is the shorter path.
- `className` does not exist in Solid's JSX types — it is `class`. The props interface must use `class?: string` not `className?: string`. The current React code uses `className?: string` in prop types and JSX — every occurrence must change.
- `Omit<React.ComponentProps<"input">, "size">` pattern (Input.tsx) becomes `Omit<ComponentProps<"input">, "size">`. Identical structure, different import.
- Event types: `React.MouseEvent<HTMLButtonElement>` → `MouseEvent & { currentTarget: HTMLButtonElement; target: Element }`. Solid dispatches native DOM events, not synthetic events.

**Complexity:** LOW (import swap + `className` → `class` throughout)

---

#### TS-8: `className` → `class`

**React pattern (everywhere):**
```tsx
<button className={mergeClasses("moon-button", ...)} />
```

**Solid equivalent:**
```tsx
<button class={mergeClasses("moon-button", ...)} />
```

**Gotchas:**
- `className` was deprecated in SolidJS 1.4 and removed in later versions. Using it causes a runtime warning or no-op in current `solid-js@^1.8`.
- `mergeClasses` helper is pure TypeScript with no React imports — it continues to work unchanged. Only the JSX attribute name changes.
- The `classList` JSX attribute is an alternative for object-based conditional classes: `classList={{ "moon-button-lg": size === "lg" }}`. It is an idiomatic Solid addition but not required — `mergeClasses` already handles conditional classes and produces identical output.
- Affects every component file and every test file — this is the single highest-frequency change in the entire port.

**Complexity:** LOW (mechanical find-replace, but touches every file)

---

#### TS-9: Props handling — `mergeProps` + `splitProps` (no destructuring)

**React pattern (Button — representative of all 37 components):**
```tsx
const Button = ({
  className,
  variant = "fill",
  size = "md",
  context = "brand",
  isFullWidth,
  ...props
}: ButtonProps) => (
  <button className={mergeClasses(...)} {...props} />
);
```

**Solid equivalent:**
```tsx
import { mergeProps, splitProps } from "solid-js";
import type { Component, ComponentProps } from "solid-js";

const Button: Component<ButtonProps> = (props) => {
  // Step 1: merge defaults (replaces default parameter values)
  const merged = mergeProps(
    { variant: "fill" as ButtonVariants, size: "md" as ButtonSizes, context: "brand" as Contexts },
    props
  );
  // Step 2: split known props from the rest that pass through to the DOM
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
```

**Gotchas:**
- Destructuring props at the function parameter level (`({ variant = "fill", ...props })`) breaks Solid's reactivity. The getter for each prop is evaluated once at destructure time. If the parent re-passes a new value, the component never sees it. This is the single most critical rule of the port.
- `mergeProps` merges left-to-right: the rightmost source wins for each key. Pass user `props` last so they override defaults.
- `splitProps` returns an array of reactive proxy objects. The first element contains the listed keys; the last element contains all remaining keys. Both retain full reactivity.
- `mergeProps(defaults, props)` is the idiomatic default-props replacement. Do not use `Object.assign` for this purpose — it breaks reactivity of the merged object.
- Components that only forward props with no own props (simple wrappers) still need `splitProps` to extract `class` before spreading:
  ```tsx
  const Header = (props: ComponentProps<"summary">) => {
    const [local, rest] = splitProps(props, ["class"]);
    return <summary class={mergeClasses("moon-accordion-item-header", local.class)} {...rest} />;
  };
  ```
- `eslint-plugin-solid` rules `solid/no-destructure` and `solid/reactivity` will catch violations. Add this plugin to the ESLint config in Phase 1.

**Complexity:** HIGH (applies to all 37 components; largest mechanical change in the port)

---

#### TS-10: Conditional rendering — `&&` / ternary → `<Show>`

**React pattern:**
```tsx
{hasControls && <Control direction="previous" ... />}
{variant !== "fill" && `moon-button-${variant}`}  // string, not JSX — keep as-is
```

**Solid equivalent:**
```tsx
import { Show } from "solid-js";

<Show when={hasControls()}>
  <Control direction="previous" ... />
</Show>

// For ternary with else:
<Show when={isOpen()} fallback={<ClosedState />}>
  <OpenState />
</Show>
```

**Gotchas:**
- `&&` short-circuits in JSX **still work in Solid** and Solid's compiler optimizes them. However, `<Show>` is preferred for component-level conditionals because it makes keying semantics explicit and prevents accidental rendering of `0` or `false` as text (same gotcha as React).
- `&&` in class string expressions (`variant !== "fill" && \`moon-button-${variant}\``) is pure JavaScript inside `mergeClasses()` — no change needed, this is not reactive JSX.
- `<Show when={...}>` accepts any truthy value (not just boolean). For non-boolean props, no cast needed.
- The `fallback` prop replaces the ternary else branch. If there is no else, omit `fallback`.
- `<Switch>/<Match>` is available for multi-branch conditionals (replaces if/else chains in JSX). Not currently needed by this library's components.

**Complexity:** LOW (optional but recommended for JSX conditionals)

---

#### TS-11: List rendering — `.map()` → `<For>` / `<Index>`

**React pattern (Pagination, Breadcrumb, TabList, Table, etc.):**
```tsx
{items.map((item, i) => <Item key={i} {...item} />)}
```

**Solid equivalent:**
```tsx
import { For, Index } from "solid-js";

// For object arrays where identity matters (items move around):
<For each={items()}>
  {(item, index) => <Item {...item} />}
</For>

// For primitive arrays (strings, numbers) where position matters:
<Index each={primitives()}>
  {(item, index) => <span>{item()}</span>}
</Index>
```

**Gotchas:**
- `<For>` uses referential equality — it tracks each item by object identity. Items that move in the array get their DOM node moved, not recreated. Use for arrays of objects.
- `<Index>` uses positional equality — it tracks by index. Item content at each position is a signal (`item()` inside the callback). Use for arrays of primitives (strings, numbers) or input fields where position is stable but value changes.
- `key` prop from React is not used. Solid's `<For>` handles keying internally via object reference.
- `.map()` in JSX still works in Solid but loses all diffing optimizations — every array change causes full DOM recreation. For a component library, always use `<For>`.
- The render callback in `<For>` receives `(item, indexAccessor)` where `indexAccessor` is a signal: `index()` — same getter semantics as `createSignal`.

**Complexity:** LOW-MEDIUM (requires identifying all `.map()` in JSX and choosing `<For>` vs `<Index>`)

---

#### TS-12: Event handling differences

**React pattern:**
```tsx
<details onToggle={(e) => setIsOpen(e.currentTarget.open)} />
<button onClick={() => dialogRef?.current?.showModal()} />
```

**Solid equivalent:**
```tsx
<details onToggle={(e) => setIsOpen(e.currentTarget.open)} />
<button onClick={() => dialogRef()?.showModal()} />
```

**Gotchas:**
- Common event names (`onClick`, `onChange`, `onInput`, `onToggle`) work identically in Solid. No changes needed for these.
- Solid uses **native DOM events**, not React's synthetic event system. The event object is the real browser `Event`, not a React wrapper. In practice this means nothing changes for the patterns this library uses.
- Delegated events (`onClick`, `onInput`, etc.) are attached at the document root and bubble up — this is Solid's default. For events that do not bubble or for custom events, use `on:eventname` (lowercase, direct attachment):
  ```tsx
  <div on:myCustomEvent={(e) => handle(e)} />
  ```
- `onChange` on `<input>` fires on blur in native DOM (like React pre-v17 synthetic behavior). In Solid, `onChange` maps to the native `change` event (fires on blur). Use `onInput` for real-time updates — this is the idiomatic Solid pattern for controlled inputs.
- Event handlers in Solid are **not reactive** — if you pass a handler as a signal value (`onClick={handlerSignal()}`), it does not update when the signal changes. Pass handlers as plain functions or inline arrows.
- `React.cloneElement(children, { onClick })` used in Drawer.Trigger has no Solid equivalent. Replace with a wrapper `<span>` or `<div>` that receives `onClick` directly:
  ```tsx
  // Before (React Drawer.Trigger):
  return React.cloneElement(children, { onClick: handleClick });
  
  // After (Solid):
  return <span onClick={handleClick}>{props.children}</span>;
  // Or use children() accessor to inspect and wrap child elements
  ```

**Complexity:** LOW for standard events; MEDIUM for `cloneElement` replacement in Drawer.Trigger

---

#### TS-13: Controlled/uncontrolled form inputs

**React pattern (Input, Textarea, Checkbox, Radio, Switch):**
```tsx
// All pass through native input props — no internal controlled state
<input type={type} className={...} {...props} />
// Consumer can pass value+onChange (controlled) or defaultValue (uncontrolled)
```

**Solid equivalent:**
```tsx
// Same pass-through pattern — works identically
<input type={props.type} class={...} {...rest} />
```

**Gotchas:**
- Solid does **not** implement React-style controlled inputs. In React, passing `value` without an `onChange` handler locks the input (enforced by React's vdom reconciler). In Solid, passing `value` sets the initial DOM value but the browser retains control afterward — the input is effectively uncontrolled from Solid's perspective even with `value` set.
- For the Moon library this is largely irrelevant since Input/Textarea/Checkbox are thin wrappers that forward all props. The behavior change affects consumers who rely on React's strict controlled-input locking — document this as a semantic difference in the migration guide.
- `onChange` (native `change` event, fires on blur) vs `onInput` (fires on keystroke): Moon inputs use neither internally — they are forwarded to the consumer. No change needed in the component implementation.
- `defaultValue` / `defaultChecked` work identically in Solid (uncontrolled initial value).
- For `<Checkbox>` which conditionally wraps in `<label>`, the same `splitProps` pattern applies for the label branch.

**Complexity:** LOW (pass-through pattern is unchanged; semantic difference documented)

---

#### TS-14: `Object.assign` compound-component pattern

**React pattern (Dialog, Drawer, Accordion, Alert, Carousel, List, Menu, Select, Tooltip, etc.):**
```tsx
Root.displayName = "Dialog";
Trigger.displayName = "Dialog.Trigger";
const Dialog = Object.assign(Root, { Trigger, Content, Close, Header });
export default Dialog;
```

**Solid equivalent:**
```tsx
// Identical — Object.assign is pure JavaScript, framework-agnostic
Root.displayName = "Dialog";
Trigger.displayName = "Dialog.Trigger";
const Dialog = Object.assign(Root, { Trigger, Content, Close, Header });
export default Dialog;
```

**Gotchas:**
- `Object.assign` on the compound component object (the export) is fine. `Object.assign` is only dangerous when used on **props objects** inside components (merging props reactively) — use `mergeProps` there instead.
- `displayName` works in Solid DevTools for inspecting component trees. Keep all `displayName` assignments — they are debugging aids, not framework APIs.
- HMR (Hot Module Replacement) with Vite may have edge cases with compound components imported across files. This was a known issue in early Solid+Vite integration; confirmed fixed in `vite-plugin-solid` v2+. If encountered, `hot: false` in `vite-plugin-solid` config resolves it.
- TypeScript: `Object.assign(Root, { Trigger, Content })` produces a type that is `typeof Root & { Trigger: ...; Content: ... }`. This is identical behavior to React — no type changes needed.

**Complexity:** LOW (zero code change; pattern is JS-level, not framework-level)

---

### Idiomatic Improvements — Optional, Zero API/Behavior Change

These patterns are not required for the port to work but improve alignment with Solid idioms. Apply only if they produce no observable difference to consumers.

---

#### II-1: `<Show>` instead of `&&` for JSX conditionals

Already covered in TS-10. Using `<Show>` is idiomatic; `&&` works but is suboptimal.

```tsx
// Acceptable (works):
{props.hasControls && <Control direction="previous" ... />}

// Idiomatic (preferred):
<Show when={props.hasControls}>
  <Control direction="previous" ... />
</Show>
```

**When to apply:** Large JSX blocks with conditional elements. For single-line `&&` conditionals in class strings, leave as-is.

---

#### II-2: `classList` for conditional class objects

Instead of building strings in `mergeClasses`:
```tsx
// Current approach (works, keep it):
class={mergeClasses("moon-button", size !== "md" && `moon-button-${size}`)}

// Solid-idiomatic alternative (optional):
class="moon-button"
classList={{ [`moon-button-${size}`]: size !== "md" }}
```

**Do not apply** — `mergeClasses` already handles this cleanly, and mixing `class` with `classList` on the same element is valid but adds cognitive overhead. Keep `mergeClasses` as the single styling mechanism.

---

#### II-3: `createMemo` for derived values accessed repeatedly

Where a computed value (e.g., a class string) is accessed more than once in a template:
```tsx
// Instead of computing inline twice:
const cls = createMemo(() =>
  mergeClasses("moon-accordion", local.size !== "md" && `moon-accordion-${local.size}`)
);
return <div class={cls()}>{props.children}</div>;
```

**When to apply:** Only if the computation is expensive or the value is used in more than two places. For simple `mergeClasses` calls, inline is clearer.

---

#### II-4: `children()` accessor for child manipulation

When a component inspects or transforms `props.children` more than once, wrap with `children()`:
```tsx
import { children } from "solid-js";
const resolved = children(() => props.children);
return <div>{resolved()}</div>;
```

**When to apply:** Components that need to iterate over, count, or manipulate child elements (e.g., a TabList that needs to find active tabs). For simple passthrough, `{props.children}` is sufficient.

---

### Anti-Features — Explicitly Forbidden Patterns

These are Solid patterns that look correct, may even work on first render, and break silently when props update.

---

#### AF-1: Destructuring props at function parameters

```tsx
// FORBIDDEN — kills reactivity for all destructured props
const Button = ({ class: cls, variant = "fill", ...rest }: ButtonProps) => ...;

// Also forbidden — same effect, just delayed
const Button = (props: ButtonProps) => {
  const { class: cls, variant } = props; // still breaks reactivity
  ...
};
```

**Why it breaks:** Solid converts props to a reactive proxy with getters. Destructuring immediately invokes each getter, converting the reactive getter into a captured plain value. Subsequent parent updates do not reach the component.

**The only exception:** Destructuring inside a reactive scope (`createEffect`, `createMemo`) where the getter is re-invoked on each run. Not applicable to this library.

---

#### AF-2: `Object.assign` to merge props objects

```tsx
// FORBIDDEN — creates a new plain object, breaks reactivity
const merged = Object.assign({ variant: "fill" }, props);

// CORRECT:
const merged = mergeProps({ variant: "fill" }, props);
```

---

#### AF-3: Reading a signal value outside a reactive scope and caching it

```tsx
// FORBIDDEN — captures the value once at component initialization
const Button = (props) => {
  const variantValue = props.variant; // read outside reactive scope — no re-tracking
  return <button class={`moon-button-${variantValue}`} />;
};

// CORRECT:
const Button = (props) => {
  const [local] = splitProps(props, ["variant"]);
  return <button class={`moon-button-${local.variant}`} />;
};
```

---

#### AF-4: `React.cloneElement` for prop injection

```tsx
// FORBIDDEN — no Solid equivalent
return React.cloneElement(children, { onClick: handleClick });
```

**Replacement:** Wrap in a container element, or use the `children()` accessor with `on:click` on the wrapper:
```tsx
// Simple wrapper (loses native element semantics):
return <span onClick={handleClick}>{props.children}</span>;
```

---

#### AF-5: Async code directly in `createEffect`

```tsx
// FORBIDDEN — breaks dependency tracking after first await
createEffect(async () => {
  const token = await fetchToken(userId()); // userId tracked
  const data = await fetchData(dataId());   // dataId NOT tracked (already past first await)
});
```

**Replacement:** Use `createResource` or split into nested synchronous effects that call async helpers.

---

#### AF-6: `.map()` for JSX list rendering

```tsx
// WORKS but anti-pattern — recreates all DOM nodes on any array change
{items.map(item => <Row key={item.id} {...item} />)}

// CORRECT:
<For each={items()}>{item => <Row {...item} />}</For>
```

---

## Feature Dependencies

```
TS-9 (splitProps/mergeProps)
    └──required by──> ALL 37 components
    └──required by──> TS-7 (ComponentProps typing with class)
    └──required by──> TS-8 (className→class rename)

TS-3 (signal-wrapped ref)
    └──required by──> TS-4 (context sharing refs)
    └──required by──> TS-5 (Portal — ref assigned inside portal to context consumer outside)

TS-4 (createContext)
    └──required by──> TS-14 (compound components — Root provides context, children consume it)

TS-2 (createEffect/onMount/onCleanup)
    └──required by──> Carousel (only component using useEffect)

TS-5 (Portal)
    └──required by──> Dialog, Drawer, BottomSheet, Snackbar

TS-1 (createSignal)
    └──required by──> Accordion.Item (isOpen state)
    └──required by──> Carousel (canScrollStart, canScrollEnd state)
    └──required by──> all future stateful form atoms (Checkbox controlled, etc.)
```

### Dependency Notes

- **TS-9 (no destructuring) blocks everything:** This rule must be established and enforced in Phase 1 (toolchain, via `eslint-plugin-solid`) before any component work starts.
- **TS-3 (signal ref) blocks context-sharing components:** Dialog, Drawer, BottomSheet cannot share refs via context until signal-wrapped ref pattern is established.
- **TS-8 (class rename) conflicts with TypeScript:** `ComponentProps<"button">` in Solid already uses `class`, not `className`. If prop interfaces mix `class` and `className`, TypeScript errors surface immediately — use as a linting signal.

---

## MVP Definition

This is a port, not a product. "MVP" means the minimum Solid API surface needed to unblock Phase 3 (stateless atoms) through Phase 6 (composite components).

### Phase 3 Unblock (stateless atoms — Button, Badge, Alert, etc.)

- [x] TS-9: `mergeProps` + `splitProps` for every component — no destructuring
- [x] TS-7: `ComponentProps<"button">` / `JSX` attribute types
- [x] TS-8: `class` attribute (not `className`)
- [x] TS-6: `JSX.Element`, `ParentComponent`, `Component` types
- [x] TS-14: `Object.assign` compound pattern (zero change)

### Phase 4 Unblock (stateful form atoms — Checkbox, Input, Switch)

- [x] TS-1: `createSignal` with getter semantics
- [x] TS-12: Event handling (`onInput` for text inputs, `onChange` for checkboxes)
- [x] TS-13: Controlled/uncontrolled passthrough behavior

### Phase 5 Unblock (compound/portal — Dialog, Drawer, Tooltip, Dropdown)

- [x] TS-3: Signal-wrapped ref for context-shared DOM refs
- [x] TS-4: `createContext` + `useContext` + guard hook pattern
- [x] TS-5: `<Portal mount={document.body}>` from `solid-js/web`
- [x] TS-12: `cloneElement` replacement for Drawer.Trigger

### Phase 6 Unblock (composite — Carousel, Accordion, TabList)

- [x] TS-2: `onMount` + `onCleanup` for Carousel event listeners
- [x] TS-10: `<Show>` for conditional rendering
- [x] TS-11: `<For>` for list rendering

---

## Feature Prioritization Matrix

| Pattern | Port Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| TS-9: splitProps/mergeProps (no destructure) | HIGH — blocks all 37 components | MEDIUM — mechanical but high-volume | P1 |
| TS-8: className→class | HIGH — JSX won't compile without it | LOW — find-replace | P1 |
| TS-1: createSignal getter semantics | HIGH — Accordion, Carousel break without it | LOW — add `()` | P1 |
| TS-14: Object.assign compound pattern | HIGH — 12+ compound components | LOW — zero change | P1 |
| TS-4: createContext/useContext | HIGH — Dialog, Drawer, all compound state | LOW — API identical | P1 |
| TS-5: Portal | HIGH — Dialog, Drawer, BottomSheet, Snackbar | LOW — import swap | P1 |
| TS-3: signal-wrapped ref | HIGH — context-shared refs (Dialog, Drawer) | MEDIUM — new pattern | P1 |
| TS-6: JSX.Element/ParentComponent types | MEDIUM — TypeScript only, no runtime | LOW — type import swap | P1 |
| TS-7: ComponentProps types | MEDIUM — TypeScript only, no runtime | LOW — import swap | P1 |
| TS-2: createEffect/onMount/onCleanup | MEDIUM — Carousel only | MEDIUM — cleanup pattern | P2 |
| TS-12: event handling | MEDIUM — cloneElement in Drawer.Trigger | LOW–MEDIUM | P2 |
| TS-13: controlled inputs | LOW — passthrough components, no internal state | LOW | P2 |
| TS-10: Show for conditionals | LOW — && works too | LOW | P2 |
| TS-11: For/Index for lists | MEDIUM — correctness/perf | LOW | P2 |
| II-1: Show over && | LOW — idiomatic only | LOW | P3 |
| II-3: createMemo for derived values | LOW — no current need | LOW | P3 |
| II-4: children() accessor | LOW — no current multi-access pattern | LOW | P3 |

---

## Sources

- [SolidJS — Official docs (createSignal)](https://docs.solidjs.com/reference/basic-reactivity/create-signal) — HIGH confidence
- [SolidJS — Official docs (createEffect)](https://docs.solidjs.com/reference/basic-reactivity/create-effect) — HIGH confidence
- [SolidJS — Official docs (mergeProps)](https://docs.solidjs.com/reference/reactive-utilities/merge-props) — HIGH confidence
- [SolidJS — Official docs (Portal)](https://docs.solidjs.com/reference/components/portal) — HIGH confidence
- [SolidJS — Official docs (onMount)](https://docs.solidjs.com/reference/lifecycle/on-mount) — HIGH confidence
- [SolidJS — Official docs (onCleanup)](https://docs.solidjs.com/reference/lifecycle/on-cleanup) — HIGH confidence
- [SolidJS — Official docs (createContext/useContext)](https://docs.solidjs.com/reference/component-apis/create-context) — HIGH confidence
- [SolidJS GitHub — Props destructuring safety discussion #408](https://github.com/solidjs/solid/discussions/408) — HIGH confidence (maintainer ryansolid)
- [SolidJS GitHub — Compound components discussion #465](https://github.com/solidjs/solid/discussions/465) — HIGH confidence (maintainer confirmation)
- [SolidJS GitHub — Controlled inputs discussion #416](https://github.com/solidjs/solid/discussions/416) — HIGH confidence (maintainer confirmation)
- [LogRocket — Understanding SolidJS props](https://blog.logrocket.com/understanding-solidjs-props-complete-guide/) — MEDIUM confidence (verified against official docs)
- [marmelab.com — SolidJS for React Developers (2025)](https://marmelab.com/blog/2025/05/28/solidjs-for-react-developper.html) — MEDIUM confidence (recent, cross-referenced)

---

*Feature research for: React→SolidJS component library port (Moon Design System)*
*Researched: 2026-05-31*
