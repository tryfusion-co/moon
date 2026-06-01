---
phase: 02-stateless-atoms
reviewed: 2026-06-01T00:00:00Z
depth: standard
files_reviewed: 12
files_reviewed_list:
  - packages/src/components/Alert.tsx
  - packages/src/components/Avatar.tsx
  - packages/src/components/Badge.tsx
  - packages/src/components/Breadcrumb.tsx
  - packages/src/components/Button.tsx
  - packages/src/components/Chip.tsx
  - packages/src/components/CircularProgress.tsx
  - packages/src/components/IconButton.tsx
  - packages/src/components/LinearProgress.tsx
  - packages/src/components/Loader.tsx
  - packages/src/components/Placeholder.tsx
  - packages/src/components/Tag.tsx
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: issues_found
fix_status:
  CR-01: rejected/intentional
  WR-01: fixed
  WR-02: fixed
  WR-03: fixed
  IN-01: deferred
  IN-02: deferred
---

# Phase 02: Code Review Report

**Reviewed:** 2026-06-01
**Depth:** standard
**Files Reviewed:** 12
**Status:** issues_found

## Summary

All 12 stateless atoms are correctly ported in terms of SolidJS mechanics: no prop destructuring at the parameter level, `mergeProps`/`splitProps` used consistently, `mergeClasses(...)` called inline in JSX (not hoisted to a const), `{...rest}` always comes from the post-`splitProps` remainder, no `from "react"` imports, and `class` used everywhere instead of `className`. Class-output order and default values match the React originals across 11 of the 12 components.

One blocker was found: `Chip` has a behavioral divergence in its internal toggle logic caused by a missing `isActive` default in `mergeProps`. Three warnings cover a dropped-but-consumed `class` prop in `Chip`, a misleading JSX.EventHandlerUnion type check, and a dead `mergeProps` default in `LinearProgress`. Two info items cover the wholesale absence of `displayName` on all 12 ported components, and a misleading type signature on `Alert.Root` / `Tag` / `Badge` that advertises div/span HTML attrs that are silently dropped at runtime.

---

## Critical Issues

### CR-01: Chip — `isActive` default mismatch breaks uncontrolled toggle parity

**File:** `packages/src/components/Chip.tsx:25-34`

**Issue:**
The React original destructs `isActive = false` as a default parameter. The Solid port provides no `isActive` default in `mergeProps`, so `local.isActive` is `undefined` when the prop is not passed.

This produces a divergence in two places:

1. **`currentActive` computation.** Both versions use nullish coalescing (`??`). Because `false ?? active` short-circuits on `false` (not `null`/`undefined`), the React chip always produces `currentActive = false` when `isActive` is not provided by the caller — the internal `active` signal is unreachable. The Solid chip evaluates `undefined ?? active()` which does read the signal, making the chip toggle-able on click.

2. **`handleClick` guard.** `if (local.isActive === undefined)` is `true` in Solid (prop absent), so `setActive` fires on every click. In React the guard evaluated `false` (default was `false`, not `undefined`), so `setActive` never fired.

**Result:** An uncontrolled Solid Chip (no `isActive` prop) gains and shows `moon-chip-active` after the first click; an equivalent React Chip never showed `moon-chip-active` via click. This is a class-output parity failure.

**Fix:**
Add `isActive: false` to the `mergeProps` defaults to match the React original exactly, collapsing uncontrolled Solid behaviour back to the same (inert) state as React:

```tsx
// packages/src/components/Chip.tsx line 16
const merged = mergeProps({ size: "md", variant: "fill", isActive: false } as const, props);
```

With this change, `local.isActive` is `false` (not `undefined`) when the prop is absent, `false ?? active()` short-circuits, and the `=== undefined` guard never fires — exact React parity.

> Note: the React original's uncontrolled behaviour was arguably a latent bug (the internal `active` signal was dead code). If the project later decides to activate the toggle, this default should be intentionally changed to `undefined` with an accompanying test. For now the contract requires parity.

---

## Warnings

### WR-01: Chip — `class` prop consumed by `splitProps` but silently dropped

**File:** `packages/src/components/Chip.tsx:18, 37-43`

**Issue:**
`"class"` is included in the `splitProps` key list (line 18), so it is extracted into `local` and removed from `rest`. However, `local.class` is never passed to `mergeClasses` (line 37-43), and `rest` no longer carries it either. Any `class` prop passed by a caller is silently discarded.

The React original also did not append `className` to the `mergeClasses` call — but it left `className` in `...props`, so the spread onto `<button>` caused the caller's value to replace (not append) the generated class string. That was a confusing API, but the prop was at least not lost.

In Solid the prop is completely invisible at runtime while TypeScript (via `JSX.ButtonHTMLAttributes<HTMLButtonElement>`) still accepts it without complaint.

**Fix option A — match React override semantics (append last):**
```tsx
class={mergeClasses(
  "moon-chip",
  local.size !== "md" && `moon-chip-${local.size}`,
  local.variant !== "fill" && `moon-chip-${local.variant}`,
  currentActive() && "moon-chip-active",
  local.class   // append caller class as final segment
)}
```

**Fix option B — match React override semantics (pass via rest):**
Remove `"class"` from the `splitProps` key list and do not reference it. Callers' `class` will then flow through `rest` and be spread directly onto `<button>`, overriding the built class string — exactly as React did.

Choose whichever semantic the design system intends, then add a test assertion for it.

---

### WR-02: Chip — `JSX.EventHandlerUnion` tuple form silently ignored in `handleClick`

**File:** `packages/src/components/Chip.tsx:31-33`

**Issue:**
The `onClick` prop type is `JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>` which is `EventHandler<T, E> | [EventHandler<T, E>, unknown]`. The guard `typeof local.onClick === "function"` correctly handles the function form but silently drops the array/tuple form (`typeof` returns `"object"`). If a caller passes `onClick={[handler, data]}` for Solid's event-delegation pattern, the handler is never called.

```tsx
// current — misses tuple form
if (typeof local.onClick === "function") {
  local.onClick(e);
}
```

**Fix:**
Delegate to the `<button>`'s native Solid event binding instead of calling the handler manually. Extract `onClick` into `rest` rather than `local`, and let Solid's JSX runtime handle both function and tuple forms:

```tsx
const [local, rest] = splitProps(merged, [
  "class",
  "size",
  "variant",
  "isActive",
  // remove "onClick" — let it stay in rest
  "children",
]);

// handleClick no longer needs to forward onClick manually
const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
  if (local.isActive === undefined) {
    setActive((prev) => !prev);
  }
  // Solid will call rest.onClick automatically via the spread
};

return (
  <button
    class={...}
    onClick={handleClick}   // only the toggle guard
    {...rest}               // rest.onClick fires independently via spread
  >
```

Note: Solid does not compose two `onClick` handlers when both are present; the spread `onClick` in `rest` would override the explicit `onClick={handleClick}`. The correct pattern is to call the forwarded handler from within the wrapper:

```tsx
const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
  if (local.isActive === undefined) {
    setActive((prev) => !prev);
  }
  if (typeof local.onClick === "function") {
    local.onClick(e);
  } else if (Array.isArray(local.onClick)) {
    local.onClick[0](e, local.onClick[1]);
  }
};
```

---

### WR-03: LinearProgress — dead `mergeProps` default for required `value` prop

**File:** `packages/src/components/LinearProgress.tsx:15`

**Issue:**
`value` is typed as `value: number` (required, no `?`) in `LinearProgressProps`. The `mergeProps` call on line 15 nonetheless supplies `value: 0` as a default:

```tsx
const merged = mergeProps({ value: 0, size: "2xs" } as const, props);
```

Because TypeScript enforces the required prop at call sites, `props.value` is always defined and the `mergeProps` default for `value` can never be reached at runtime. It is dead code that misleads readers into thinking `value` has a runtime fallback.

The React original had the same mismatch (`value: number` required + `value = 0` destructure default), so this is a pre-existing inconsistency preserved by the port.

**Fix:**
Either make the prop optional to legitimise the fallback:

```tsx
type LinearProgressProps = {
  // ...
  value?: number;   // default handled by mergeProps
};
```

Or remove the dead `mergeProps` default and keep the prop required:

```tsx
const merged = mergeProps({ size: "2xs" } as const, props);
```

---

## Info

### IN-01: All 12 components missing `displayName`

**Files:** All 12 reviewed components

**Issue:**
The React originals set `displayName` on every component and sub-component (e.g., `Button.displayName = "Button"`, `Alert.displayName = "Alert"`, `Action.displayName = "Alert.Action"`). None of the 12 Solid ports carry these assignments.

The project CONVENTIONS.md lists `displayName` under **Code Style**: "displayName property used instead for runtime debugging". Although Solid DevTools does not use `displayName` in the same way React DevTools does, the property is still a JS property on the component function, is visible in browser DevTools call stacks, and the project convention explicitly requires it.

**Fix:**
Add `displayName` assignments after each component or sub-component function, matching the React originals. For example:

```tsx
// Button.tsx
Button.displayName = "Button";

// Alert.tsx
Root.displayName = "Alert";
Action.displayName = "Alert.Action";
Content.displayName = "Alert.Content";
Meta.displayName = "Alert.Meta";
// Close has no displayName in React original — omit

// Breadcrumb.tsx
Root.displayName = "Breadcrumb";
Item.displayName = "Breadcrumb.Item";
```

---

### IN-02: `Alert.Root`, `Tag`, `Badge` accept HTML attributes in type but silently drop them at runtime

**Files:**
- `packages/src/components/Alert.tsx:13-17` (`AlertRootProps`)
- `packages/src/components/Tag.tsx:9` (`TagProps`)
- `packages/src/components/Badge.tsx:7` (`BadgeProps`)

**Issue:**
All three types include `JSX.HTMLAttributes<HTMLDivElement>` / `JSX.HTMLAttributes<HTMLSpanElement>` in their intersection, which means TypeScript accepts props like `id`, `aria-label`, `data-testid`, `style`, and `onClick` without error. However, none of these components captures a `rest` from `splitProps` and none spreads it onto the underlying element. The extra props are consumed into the void.

This matches the React originals (which had the same type-vs-spread gap), so it is not a regression. It is worth calling out because it can cause subtle test failures (`getByTestId` won't find elements targeted with `data-testid`) and confuses callers reading the type signature.

**Fix (if desired):**
Narrow the types to remove the HTML attribute inheritance if the components intentionally do not forward attrs:

```tsx
// Alert.tsx — remove JSX.HTMLAttributes<HTMLDivElement> intersection
type AlertRootProps = AlertProps & {
  variant?: AlertVariants;
  context?: Contexts;
};
```

Or — the cleaner alternative — capture and spread `rest` so the type matches the runtime:

```tsx
const [local, rest] = splitProps(merged, ["variant", "context", "children", "class"]);
return (
  <div
    class={mergeClasses(...)}
    {...rest}
  >
    {local.children}
  </div>
);
```

---

_Reviewed: 2026-06-01_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
