---
phase: 03-stateful-atoms-carousel
reviewed: 2026-06-01T00:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - packages/src/components/Carousel.tsx
  - packages/src/components/SegmentedControl.tsx
  - packages/src/components/Radio.tsx
  - packages/src/components/Switch.tsx
  - packages/src/components/Checkbox.tsx
  - packages/src/components/Input.tsx
  - packages/src/components/Textarea.tsx
  - packages/src/components/FormGroup.tsx
findings:
  critical: 2
  warning: 4
  info: 1
  total: 7
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-06-01T00:00:00Z
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

Seven form components and the Carousel were reviewed against the React→SolidJS port contract
(class-output parity, identical public API, Solid-correct reactivity). The overall quality is
high: no `from "react"` imports, no `useRef`/`useEffect`/`useCallback`, correct `let ref!` and
`createSignal` usage, `onCleanup` inside `onMount`, `splitProps`/`mergeProps` throughout, and
`class` not `className` everywhere.

Two blockers were found: the `Carousel.Control` internal `onClick` handler can be silently
clobbered by caller-supplied `onClick` via the `{...rest}` spread, and `Checkbox` passes
`onChange` straight through in `rest` — binding it to Solid's native `change` event (fires on
blur), which is inconsistent with the React contract and with how `Switch` explicitly bridges
`onChange` to `onInput`. Four warnings cover: `Switch`'s `onInput` handler being overrideable
by a caller-supplied `onInput` in `rest`; stale context value for a dynamic `Radio.Group` `name`
prop; the `SegmentedControl` index counter breaking on dynamic children; and dead `size` payload
in the SegmentedControl context.

---

## Critical Issues

### CR-01: Carousel.Control — `{...rest}` overrides the internal `onClick` scroll handler

**File:** `packages/src/components/Carousel.tsx:28-37`

**Issue:** `Control` accepts `JSX.ButtonHTMLAttributes<HTMLButtonElement>` as its base type,
meaning callers (or composed wrappers) can legally pass an `onClick` prop. `onClick` is not
included in the `splitProps` destructure at line 26, so it lands in `rest`. In JSX, the later
assignment wins: the `{...rest}` spread at line 33 comes **after** the explicit
`onClick={() => local.onScrollDirection(local.direction)}` at line 31, silently overriding it.
When that happens the scroll buttons render but clicking them does nothing — the reel never
moves. `Control` is not a public export but it is part of the composed public `Carousel` type
and the `ControlProps` type explicitly extends `JSX.ButtonHTMLAttributes`.

**Fix:** Add `onClick` to the `splitProps` keys so it is removed from `rest`, or move the
spread before the explicit handler:

```tsx
// Option A — exclude onClick from rest (preferred; prevents any bypass)
const [local, rest] = splitProps(props, [
  "class", "direction", "disabled", "onScrollDirection", "onClick"
]);

// Option B — move spread before the explicit handler so explicit wins
<button
  {...rest}                                              // spread first
  class={mergeClasses("moon-carousel-control", local.class)}
  disabled={local.disabled}
  onClick={() => local.onScrollDirection(local.direction)}
  aria-label={local.direction === "previous" ? "Previous" : "Next"}
>
```

Option A is safer because it makes the behaviour explicit and avoids any ambiguity about which
handler fires.

---

### CR-02: Checkbox — `onChange` not bridged to `onInput`, breaking immediate-toggle semantics

**File:** `packages/src/components/Checkbox.tsx:10-25`

**Issue:** `CheckboxProps` extends `JSX.InputHTMLAttributes<HTMLInputElement>` (omitting only
`type`). The `splitProps` call at line 10 only pulls out `["class", "label"]`; every other
prop, including `onChange`, lands in `rest` and is spread onto the `<input>`. In Solid, binding
`onChange` on a DOM element maps to the native `change` event, which fires on **blur** (when
focus leaves the element), not on every click/toggle. In React, `onChange` fires on every
change immediately. Switch explicitly addresses this discrepancy (see `Switch.tsx` lines 9-29
and the onInput bridge). Checkbox does not. A consumer that wires an `onChange` callback to
`Checkbox` expecting immediate-toggle feedback will get no response until the element loses
focus — a silent, hard-to-diagnose behavioral regression.

**Fix:** Apply the same `onChange`→`onInput` bridge pattern that `Switch` uses:

```tsx
type CheckboxProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  label?: string;
  class?: string;
  onChange?: JSX.EventHandler<HTMLInputElement, Event>;
};

const Checkbox: Component<CheckboxProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "label", "onChange"]);

  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    if (typeof local.onChange === "function") {
      local.onChange(e as any);
    }
  };

  if (local.label) {
    return (
      <label class={local.class}>
        <input type="checkbox" class="moon-checkbox" onInput={handleInput} {...rest} />
        <span>{local.label}</span>
      </label>
    );
  }
  return (
    <input
      type="checkbox"
      class={mergeClasses("moon-checkbox", local.class)}
      onInput={handleInput}
      {...rest}
    />
  );
};
```

---

## Warnings

### WR-01: Switch — caller-supplied `onInput` in `{...rest}` overrides the internal handler

**File:** `packages/src/components/Switch.tsx:34-43`

**Issue:** `onInput={handleInput}` is set at line 36, but `{...rest}` is spread at line 42
(after it). `SwitchProps` extends `JSX.InputHTMLAttributes<HTMLInputElement>` (line 7), so a
caller can pass `onInput`. It is NOT excluded from `rest` (the `splitProps` at line 23 only
pulls `["onChange", "size", "label", "class"]`). A caller-supplied `onInput` in rest will
override the bridge handler, silently disconnecting the `onChange` public callback from the
toggle event. This is the same class of bug as CR-01.

**Fix:** Either exclude `onInput` from rest, or move the spread before the explicit binding:

```tsx
// Option A — exclude from rest
const [local, rest] = splitProps(merged, ["onChange", "onInput", "size", "label", "class"]);

// Option B — spread before explicit handler
<input
  type="checkbox"
  {...rest}                   // spread first
  onInput={handleInput}       // explicit handler wins
  class={mergeClasses(...)}
/>
```

---

### WR-02: Radio.Group — context value holds a plain string, not a reactive accessor; dynamic `name` changes do not propagate

**File:** `packages/src/components/Radio.tsx:54`

**Issue:** The Provider receives `value={{ name: local.name }}`. While `local.name` from
`splitProps` is a reactive getter, the object `{ name: local.name }` is constructed at the
time the JSX expression evaluates. Solid's `createContext`/`Provider` does not re-invalidate
consumers when the `value` reference changes — consumers received the object from
`useContext()` once and hold it. If the `name` prop on `Radio.Group` changes after initial
mount, `group.name` inside `Radio` root will still return the stale value. The correct Solid
pattern is to pass a reactive accessor in the context so consumers can subscribe to changes.

**Fix:** Store `name` as an accessor in the context type and pass a getter:

```tsx
// Context type
type RadioGroupCtx = { name: () => string };
const RadioGroupContext = createContext<RadioGroupCtx>();

// In Group component
<RadioGroupContext.Provider value={{ name: () => local.name }}>

// In Root component consumer
const name = () => group?.name() ?? (local.name as string | undefined);
```

This is consistent with how SegmentedControl stores `activeIndex` as an accessor in its
context (line 16 of SegmentedControl.tsx).

---

### WR-03: SegmentedControl — `register()` index counter breaks when children are dynamically added after initial mount

**File:** `packages/src/components/SegmentedControl.tsx:88-89`

**Issue:** The counter `let counter = 0` is declared in the Root component body (line 88).
Because Solid component functions run once, the counter correctly assigns sequential indices
to Items that mount during initial render. However, the counter is never reset and never
decremented. If a consumer conditionally renders Items using a signal (`<Show>` or `<For>`),
the Items that mount in the second render pass call `register()` on the still-incrementing
counter, producing wrong indices. In uncontrolled mode, the wrong index makes the item's
`isActive()` comparison `ctx.activeIndex() === index` permanently false or true for the wrong
item, causing stale active state.

**Fix:** Use a `createSignal` counter and reset it at the start of each reactive render pass,
or (preferred) have each Item accept an explicit `index` prop and make index assignment the
caller's responsibility — the `index?: number` prop already exists. Alternatively, document
that auto-registration via `register()` only supports static children and callers must supply
explicit `index` props for dynamic lists.

---

### WR-04: SegmentedControl — `size` is stored in context but never consumed by `Item`

**File:** `packages/src/components/SegmentedControl.tsx:18,92`

**Issue:** The `SegmentedControlContextType` declares a `size` field (line 18) and `Root`
passes `size: local.size` in the context value (line 92). The `Item` component reads only
`activeIndex`, `setActiveIndex`, and `register` from context — it never reads `ctx.size`.
This means the context carries dead data: it misleads future contributors into thinking
`Item` can be size-aware via context when it actually cannot be without additional wiring.
If size-dependent item styling was intended (e.g., padding or font size per item), it is
currently silently not applied.

**Fix:** Either remove `size` from the context type and value if it is not needed:

```ts
type SegmentedControlContextType = {
  activeIndex: () => number;
  setActiveIndex: (_idx: number) => void;
  register: () => number;
};
```

Or add `ctx.size` consumption inside `Item` to apply size-specific classes:

```tsx
class={mergeClasses(
  "moon-segmented-control-item",
  ctx.size !== "md" && `moon-segmented-control-item-${ctx.size}`,
  isActive() && "moon-segmented-control-item-active",
  local.class
)}
```

---

## Info

### IN-01: Carousel.Root — `canScrollEnd` initialises to `true`; there is a one-frame flash on zero-content carousels in real browsers

**File:** `packages/src/components/Carousel.tsx:45`

**Issue:** `canScrollEnd` is initialised to `true` (line 45), meaning the Next button renders
enabled on the very first paint before `onMount` has run. After `onMount` calls
`updateScrollState`, if `scrollWidth === clientWidth` (nothing to scroll), it is corrected to
`false`. In a real browser this causes a one-frame flash where the Next button is visually
enabled even when there is no overflow content to scroll to. In jsdom tests, `scrollWidth` and
`clientWidth` are both 0 so `0 < 0 = false` and onMount immediately disables the button
(tests pass). The inconsistency means tests do not catch the visual flicker.

**Fix:** Initialise `canScrollEnd` to `false` as well, and rely entirely on `onMount` /
`updateScrollState` to enable it once the DOM dimensions are known:

```ts
const [canScrollEnd, setCanScrollEnd] = createSignal(false);
```

This eliminates the one-frame enabled→disabled flash and makes initial state consistent with
`canScrollStart`.

---

_Reviewed: 2026-06-01T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
