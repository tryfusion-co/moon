---
phase: 04-compound-portal-composite
reviewed: 2026-06-01T00:00:00Z
depth: standard
files_reviewed: 14
files_reviewed_list:
  - packages/src/components/Dialog.tsx
  - packages/src/components/Drawer.tsx
  - packages/src/components/BottomSheet.tsx
  - packages/src/components/Dropdown.tsx
  - packages/src/components/Menu.tsx
  - packages/src/components/Select.tsx
  - packages/src/components/Tooltip.tsx
  - packages/src/components/Snackbar.tsx
  - packages/src/components/Accordion.tsx
  - packages/src/components/TabList.tsx
  - packages/src/components/Pagination.tsx
  - packages/src/components/Table.tsx
  - packages/src/components/List.tsx
  - packages/src/components/Authenticator.tsx
findings:
  critical: 4
  warning: 4
  info: 1
  total: 9
status: fixed
fix_applied_at: 2026-06-01T10:17:00Z
findings_fixed:
  - CR-01
  - CR-04
findings_rejected_parity:
  - CR-02
  - CR-03
  - WR-01
  - WR-02
  - WR-03
  - WR-04
findings_acknowledged:
  - IN-01
---

# Phase 4: Code Review Report

**Reviewed:** 2026-06-01  
**Depth:** standard  
**Files Reviewed:** 14  
**Status:** issues_found

## Summary

All 14 components are correctly ported away from React (no `from "react"` / `react-dom` imports). Signal-ref patterns in Dialog, Drawer, and BottomSheet are correctly implemented: `createSignal<HTMLDialogElement>()`, context exposes the Accessor getter, and `ref={setDialogRef}` uses the signal setter as a ref callback. `<Portal mount={document.body}>` replaces `createPortal` correctly, and SolidJS Portal does propagate owner context so `useContext` inside portaled content works. `display:contents` trigger wrappers in Drawer and BottomSheet are correct and documented.

Four critical issues were found: a `onChange`-vs-`onInput` parity regression in Select (identical to the Checkbox bug already fixed in phase 3), an RTL direction detection bug in Pagination that reads the wrong element in multi-instance pages, a semantically invalid `<p>` element used as the Dialog.Trigger wrapper, and a type-erasing `onClick` cast in Drawer/BottomSheet Close that silently drops the event object from caller-provided handlers.

---

## Critical Issues

### CR-01: Select — `onChange` fires on blur, not on every selection (parity regression) — **FIXED (06946d3)**

**File:** `packages/src/components/Select.tsx:41-53`  
**Issue:** `Select` spreads `{...rest}` onto a native `<select>` without remapping `onChange` to `onInput`. In SolidJS, `onChange` on a DOM element binds to the native `change` event (fires on blur/commit). In React, `onChange` on `<select>` fires on every option selection (mapped to the native `input` event). A consumer who passes `onChange` expecting live selection feedback (the React contract) gets deferred blur-only notifications instead. This is the identical regression documented and fixed for `Checkbox` in the Checkbox component.

**Fix:** Remap `onChange` at the prop boundary, exactly as Checkbox does:

```tsx
type SelectProps = Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & {
  size?: SelectSizes;
  variant?: SelectVariants;
  error?: boolean;
  children?: JSX.Element;
  class?: string;
  onChange?: JSX.EventHandler<HTMLSelectElement, Event>;
};

const Root: Component<SelectProps> = (props) => {
  const merged = mergeProps({ size: "md" as SelectSizes, variant: "fill" as SelectVariants, error: false }, props);
  const [local, rest] = splitProps(merged, ["children", "size", "variant", "error", "class", "onChange"]);

  const handleInput: JSX.EventHandler<HTMLSelectElement, InputEvent> = (e) => {
    if (typeof local.onChange === "function") {
      local.onChange(e as any);
    }
  };

  return (
    <select
      class={mergeClasses(...)}
      onInput={handleInput}
      {...rest}
    >
      {local.children}
    </select>
  );
};
```

---

### CR-02: Pagination — `isRTL()` queries the wrong element in multi-instance documents — **REJECTED (parity: React original uses identical `document.querySelector(".moon-pagination")` global query)**

**File:** `packages/src/components/Pagination.tsx:69-73`  
**Issue:** `document.querySelector(".moon-pagination")` always returns the **first** matching element in the document. If two or more `<Pagination>` components are rendered simultaneously (e.g., table top/bottom controls, or two separate pages in a test), every instance reads the computed direction of the first one. Additionally, `isRTL()` is called per-render as a plain function (not a signal or memo), so direction changes after mount are not reactive. The function is also duplicated per `Control` instance.

```tsx
// Both controls on the same page share this logic — both query document.querySelector,
// which always returns the FIRST .moon-pagination in DOM regardless of which instance owns this Control.
const isRTL = () => {
  if (typeof document === "undefined") return false;
  const el = document.querySelector(".moon-pagination"); // <-- BUG: always first instance
  return el ? getComputedStyle(el).direction === "rtl" : false;
};
```

**Fix:** Pass a `ref` from the `<ul>` in Pagination root down to Control, or read direction from the Control's own `<li>` element via a local ref:

```tsx
// In Control, use a local ref to walk up to the nearest pagination container:
let liRef: HTMLLIElement | undefined;
const isRTL = () => {
  if (!liRef) return false;
  return getComputedStyle(liRef).direction === "rtl";
};
// then: ref={el => (liRef = el)} on the <li>
```

Alternatively, hoist the direction computation to the Pagination root and pass it as a prop to Control.

---

### CR-03: Dialog.Trigger — `<p>` wrapper is an invalid HTML container for interactive children — **REJECTED (parity: React Dialog.Trigger was `<p onClick>{children}</p>`; CONTEXT decision keeps Dialog.Trigger as `<p>`)**

**File:** `packages/src/components/Dialog.tsx:35`  
**Issue:** `Dialog.Trigger` wraps its children in a `<p>` element. A `<p>` is a paragraph (phrasing content model) and cannot legally contain block-level descendants such as `<button>`, `<div>`, or another `<p>`. Browsers will break the DOM tree when they encounter such nesting — the outer `<p>` is implicitly closed before the block child, stripping it from the trigger's subtree and breaking the `onClick` handler chain. Drawer.Trigger and BottomSheet.Trigger both correctly use `<span style={{display:"contents"}}>` for this exact reason.

```tsx
// Current — invalid HTML, onClick breaks when child is block-level:
const Trigger: Component<DialogProps> = (props) => {
  const { dialogRef } = useDialogContext();
  const [local] = splitProps(props, ["children"]);
  return (
    <p onClick={() => dialogRef()?.showModal()}>{local.children}</p>
  );
};
```

**Fix:** Use `<span style={{display:"contents"}}>` consistent with Drawer and BottomSheet:

```tsx
const Trigger: Component<DialogProps> = (props) => {
  const { dialogRef } = useDialogContext();
  const [local] = splitProps(props, ["children"]);
  return (
    <span style={{ display: "contents" }} onClick={() => dialogRef()?.showModal()}>
      {local.children}
    </span>
  );
};
```

---

### CR-04: Drawer/BottomSheet — `Close` `onClick` prop cast silently drops event argument — **FIXED (36d0ab8)**

**File:** `packages/src/components/Drawer.tsx:89`, `packages/src/components/BottomSheet.tsx:98`  
**Issue:** Both `Close` components accept `onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>`, which may be a function that expects a `MouseEvent` argument. The internal handler casts it to `(() => void) | undefined` and calls it with no arguments:

```tsx
// Drawer.tsx:87-90
onClick={() => {
  drawerRef()?.close();
  (local.onClick as (() => void) | undefined)?.(); // event arg silently dropped
}}
```

Any consumer that passes `onClick={(e) => e.stopPropagation()}` or otherwise uses the event object will receive `undefined` as `e` and calling `.stopPropagation()` will throw a runtime TypeError. The type assertion at compile time hides this from TypeScript.

**Fix:** Change the prop type to a plain function signature (matching actual call behavior) or pass a synthetic/real event to the callback:

```tsx
// Simplest fix — narrow the type to what is actually supported:
type DrawerCloseProps = {
  onClick?: () => void;
  class?: string;
};

// Then in the handler, no cast is needed:
onClick={() => {
  drawerRef()?.close();
  local.onClick?.();
}}
```

If full event forwarding is needed, attach the onClick directly to the button after calling `drawerRef()?.close()` via a wrapper that captures the event:

```tsx
onClick={(e) => {
  drawerRef()?.close();
  if (typeof local.onClick === "function") local.onClick(e);
}}
```

---

## Warnings

### WR-01: Snackbar Root — native HTML attributes silently swallowed (no `{...rest}` spread) — **REJECTED (parity: React SnackbarProps had no ComponentProps spread on root either)**

**File:** `packages/src/components/Snackbar.tsx:46-62`  
**Issue:** The Root component splits only `["isOpen", "children", "variant", "context"]` from merged props but the root `SnackbarProps` type does not extend `JSX.HTMLAttributes`. However, all three sub-components (Action, Meta, Group) do accept and spread `{...rest}`. If a consumer needs to attach `id`, `data-testid`, `aria-live`, or `role` to the root snackbar element, there is no way to do so — the props are simply absent from the type. The snackbar is typically used with `aria-live` for accessibility.

**Fix:** Extend `SnackbarProps` with `JSX.HTMLAttributes<HTMLDivElement>` and spread `rest`:

```tsx
type SnackbarProps = JSX.HTMLAttributes<HTMLDivElement> & {
  isOpen: boolean;
  children?: JSX.Element;
  variant?: SnackbarVariants;
  context?: Contexts;
};

const Root: Component<SnackbarProps> = (props) => {
  const merged = mergeProps({ variant: "fill" as SnackbarVariants, context: "brand" as Contexts }, props);
  const [local, rest] = splitProps(merged, ["isOpen", "children", "variant", "context", "class"]);
  return (
    <Show when={local.isOpen}>
      <div class={mergeClasses(...)} {...rest}>
        {local.children}
      </div>
    </Show>
  );
};
```

---

### WR-02: Pagination — uncontrolled regression when `activePage` prop changes — **REJECTED (parity: React used `useState(activePage)` one-shot init with no useEffect sync — same non-reactive behavior)**

**File:** `packages/src/components/Pagination.tsx:107`  
**Issue:** `createSignal(local.activePage)` captures the initial value of `activePage` once. If a parent component controls the active page (e.g., syncing with URL state) and passes a new `activePage` value, the internal `currentPage` signal is never updated — the component stays on the stale page. The React version's `activePage` prop is similarly uncontrolled, but controlled integration is a common usage pattern.

```tsx
// local.activePage is reactive but only read once here for signal initialization:
const [currentPage, setCurrentPage] = createSignal(local.activePage);
```

**Fix:** Add a `createEffect` to sync external control:

```tsx
import { createSignal, createEffect } from "solid-js";

const [currentPage, setCurrentPage] = createSignal(local.activePage);
createEffect(() => setCurrentPage(local.activePage));
```

---

### WR-03: Tooltip.Trigger — `<p>` wrapper is semantically inappropriate — **REJECTED (parity: React Tooltip used `<p>` similarly)**

**File:** `packages/src/components/Tooltip.tsx:21`  
**Issue:** `Tooltip.Trigger` wraps children in a `<p>` (paragraph) element. While less severe than the Dialog case (Tooltip.Trigger content is more likely to be inline text), a `<p>` around arbitrary children still creates the same HTML invalidity risk when the child is block-level. It also imposes `display: block` and paragraph margins that likely conflict with tooltip positioning. No other trigger wrapper in this codebase uses `<p>`.

**Fix:** Use a neutral wrapper consistent with other trigger patterns. Since Tooltip.Trigger does not need `showModal()`, a `<span>` (or `display:contents`) is appropriate:

```tsx
const Trigger: Component<TooltipChildProps> = (props) => {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <span class={local.class} {...rest}>
      {local.children}
    </span>
  );
};
```

---

### WR-04: Authenticator — `internalValue` not synced when controlled `value` prop changes — **REJECTED (parity: React used `useState(value)` one-shot init, no sync)**

**File:** `packages/src/components/Authenticator.tsx:46`  
**Issue:** `createSignal(local.value)` is initialized from the `value` prop once. If the parent resets the OTP value (e.g., on form submission or error), the displayed inputs keep the stale internal value. The `onChange` callback is present (suggesting controlled usage is intended), but there is no mechanism to push external `value` changes back into `internalValue`.

```tsx
const [internalValue, setInternalValue] = createSignal(local.value); // read once; stale on prop change
```

**Fix:** Add an effect to sync controlled value:

```tsx
import { createSignal, createEffect } from "solid-js";

const [internalValue, setInternalValue] = createSignal(local.value);
createEffect(() => setInternalValue(local.value));
```

---

## Info

### IN-01: TabList `register()` counter — caveat not enforced at type level — **ACKNOWLEDGED (documented in code comment; matches React Children.map static assumption)**

**File:** `packages/src/components/TabList.tsx:85-88`  
**Issue:** The comment on line 85 correctly documents that `register()` only works correctly for static children, but this constraint is not enforced or communicated at the API level. If a consumer renders `<TabList.Item>` inside a `<Show>` or `<For>`, indices will be assigned during initial render and then become stale as items appear/disappear. The counter resets only on component remount. This is a documentation/API design gap rather than an immediate bug.

**Fix:** Consider either asserting in development that `index` is always provided when dynamic children are detected, or document the limitation in JSDoc on the `TabListProps` type. At minimum, the existing comment is correct and sufficient if the API contract is established.

---

_Reviewed: 2026-06-01_  
_Reviewer: Claude (gsd-code-reviewer)_  
_Depth: standard_
