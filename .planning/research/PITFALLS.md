# Pitfalls Research

**Domain:** React-to-SolidJS component library port (37 components, Tailwind, compound components, portals, Storybook, Vitest, CLI)
**Researched:** 2026-05-31
**Confidence:** HIGH — all critical pitfalls verified against official SolidJS docs, vite-plugin-solid source, @solidjs/testing-library README, and community post-mortems

---

## Critical Pitfalls

### Pitfall 1: Props Destructuring Silently Kills Reactivity

**What goes wrong:**
Every component port fails silently. The component renders correctly on first mount (because initial values are read once) but never updates when the parent passes new prop values. No error is thrown. No warning fires. Tests pass if they only assert initial render.

React pattern (reads props eagerly at call time via argument destructuring):
```tsx
const Button = ({ variant = "fill", size = "md", class: cls, ...rest }) => (
  <button class={mergeClasses("moon-button", cls)} {...rest} />
);
```

Solid broken equivalent (getters called once at destructure time, reactivity severed):
```tsx
// WRONG — looks like it works, never updates
const Button = ({ variant = "fill", size = "md", class: cls, ...rest }: ButtonProps) => (
  <button class={mergeClasses("moon-button", cls)} {...rest} />
);
```

Solid correct pattern:
```tsx
const Button: Component<ButtonProps> = (props) => {
  const merged = mergeProps({ variant: "fill", size: "md" }, props);
  const [local, rest] = splitProps(merged, ["class", "variant", "size", "context", "isFullWidth"]);
  return (
    <button
      class={mergeClasses("moon-button", `moon-button-${local.variant}`, local.class)}
      {...rest}
    />
  );
};
```

**Why it happens:**
SolidJS compiles props into getter functions backed by the parent's reactive system. Destructuring in the function signature calls those getters immediately (at component initialization time, which runs only once). The getter's return value is stored in a plain JavaScript variable — not a signal, not a tracked reference. Subsequent parent updates call the setter but nobody is subscribed to the getter anymore.

**Warning signs:**
- Component renders with correct default/initial props but ignores updates from parent
- Storybook controls panel changes have no visual effect
- Tests that only check initial class output pass; tests that change props and re-assert fail
- ESLint rule `eslint-plugin-solid/no-destructure` reports violations

**Prevention:**
- Enable `eslint-plugin-solid` from Phase 01 (toolchain). The `no-destructure` rule will flag every React-style destructured component signature
- Establish the `mergeProps` + `splitProps` pattern in a single reference component (Button) in Phase 03, then replicate mechanically across all 37 components
- Code-review checklist: no component function signature contains `{ ... }` on the first argument
- This rule applies equally to default values: `const Button = (props) => { const v = props.variant || "fill"; }` — accessing `props.variant` outside a reactive context is the same mistake as destructuring; use `mergeProps({ variant: "fill" }, props)` instead

**Phase to address:** Phase 01 (enable eslint-plugin-solid/no-destructure); Phase 03 (establish the pattern); applies to every component phase

---

### Pitfall 2: Signal Getters vs Signal Values — Passing v() vs v

**What goes wrong:**
When sharing state via context (Dialog, Drawer, Dropdown, etc.) or composing signals, passing `v()` (the current value, a snapshot) instead of `v` (the getter function) breaks downstream reactivity. The consumer receives a static value at subscription time and never sees updates.

```tsx
// WRONG — passes snapshot, consumer can't subscribe
const ctx = { isOpen: isOpen(), setOpen };
<DialogContext.Provider value={ctx}>

// CORRECT — passes getter, consumer subscribes when it calls isOpen()
const ctx = { isOpen, setOpen };
<DialogContext.Provider value={ctx}>
```

The inverse mistake also occurs in JSX: calling a getter in a non-reactive position freezes the value at render time:
```tsx
// WRONG — freezes class string at mount
const cls = mergeClasses("moon-button", props.variant());  // props.variant is already a getter

// CORRECT — reactive read inside JSX expression
<button class={mergeClasses("moon-button", props.variant)} />
```

**Why it happens:**
React developers are accustomed to calling functions to obtain values everywhere. In Solid, signals and prop getters are lazy — they should be passed as references and called only inside reactive contexts (JSX expressions, createEffect, createMemo). Calling them eagerly converts a reactive subscription into a plain value.

**Warning signs:**
- Dialog/Drawer open state does not sync between Trigger and Content sub-components
- Context consumers show stale values after the first signal update
- `console.log` in an effect shows correct updates, but DOM does not change

**Prevention:**
- Context value objects always contain getter references: `{ isOpen, setIsOpen }` not `{ isOpen: isOpen() }`
- When typing context: `type DialogCtx = { isOpen: Accessor<boolean>; ... }` — the type enforces getter-passing
- In JSX, access reactive values inline: `{isOpen() ? ... : ...}` — the getter is called inside JSX's implicit reactive scope
- Pass signal getters to child props: `<Child value={count} />` not `<Child value={count()} />`

**Phase to address:** Phase 01 (establish typing conventions for Accessor<T>); Phase 05 (compound/portal components — highest risk)

---

### Pitfall 3: Refs Shared via Context — Plain `let` Is Not Reactive

**What goes wrong:**
Dialog, Drawer, BottomSheet use a ref that is assigned in one sub-component (Content) and read in another (Trigger, Close). In React this works because `useRef` returns a stable object whose `.current` property is mutated. In Solid, a plain `let ref!: HTMLDialogElement` assigned via `<dialog ref={ref} />` is fine for local single-component use, but sharing it through context does not work: context consumers capture the `undefined` initial value, not a live reference.

```tsx
// WRONG — context consumers see undefined forever
let dialogRef!: HTMLDialogElement;
const DialogContext = createContext({ ref: dialogRef });

// CORRECT — signal-wrapped ref propagates the element assignment
const [dialogRef, setDialogRef] = createSignal<HTMLDialogElement>();
<dialog ref={setDialogRef} />
// consumer: dialogRef()?.showModal()
```

**Why it happens:**
`let ref!: T` is a plain JavaScript variable. When it is captured in a closure (the context default value or a sub-component's event handler), the closure captures the variable binding's value at that moment — `undefined`. When `ref` is later assigned by Solid's JSX compiler, existing closures still hold the old snapshot. Signal getters, by contrast, always read the current value from the signal atom.

**Warning signs:**
- `dialogRef?.showModal()` throws "Cannot read properties of undefined" when Trigger fires before Content mounts
- Dialog opens on direct DOM test but not when Trigger is in a different sub-tree
- TypeScript shows `HTMLDialogElement | undefined` after narrowing, but runtime value is always `undefined`

**Prevention:**
- Any ref that crosses a component boundary via context must be signal-wrapped: `createSignal<HTMLElementType>()`
- The setter function is used as the `ref` prop directly: `<dialog ref={setDialogRef} />`
- Local single-component refs (never shared) can remain as `let ref!: T`
- Add to code-review checklist: "does this ref leave the component that owns it?"

**Phase to address:** Phase 05 (Dialog, Drawer, BottomSheet, Dropdown, Menu, Select)

---

### Pitfall 4: Effects — Missing onCleanup, createEffect vs onMount Timing, No Dependency Array

**What goes wrong:**
Three distinct sub-pitfalls:

**4a — Missing onCleanup causes memory leaks:**
```tsx
// WRONG — event listener never removed
createEffect(() => {
  window.addEventListener("resize", updateScrollState);
});

// CORRECT
createEffect(() => {
  window.addEventListener("resize", updateScrollState);
  onCleanup(() => window.removeEventListener("resize", updateScrollState));
});
```
Carousel.tsx already has this pattern in React with fragile cleanup — the Solid port must be explicit.

**4b — createEffect vs onMount timing:**
`createEffect` runs after each reactive update (including initial render). `onMount` runs once after first DOM insertion. For one-shot initialization (attaching a listener, measuring a DOM node), use `onMount`. For reactive side effects that re-run on signal changes, use `createEffect`. Mixing them causes effects to run at wrong times or fail to re-run.

**4c — No dependency array (intentional, not a mistake):**
React developers reflexively add dependency arrays. Solid's `createEffect` has no dependency array — it auto-tracks all reactive reads inside its body. The correct pattern to skip the initial run is `on(signal, handler, { defer: true })`. Wrapping reads in `untrack()` removes them from tracking. Attempting to manually manage dependencies (e.g., reading signals outside the effect to prevent tracking) is the wrong mental model.

**Why it happens:**
React's useEffect API and Solid's createEffect look identical in syntax. The behavioral difference (auto-tracking vs explicit deps) is invisible until effects run at unexpected times or fail to clean up.

**Warning signs:**
- Memory usage grows on repeated component mount/unmount cycles (4a)
- DOM initialization happens before elements exist, or initialization skips after prop changes (4b)
- Effects run more times than expected; infinite update loops when an effect writes to a signal it reads (4c)

**Prevention:**
- Lint rule: ban `useEffect` import — enforces Solid equivalents
- Every `createEffect` or `onMount` that adds an event listener must have a corresponding `onCleanup` in the same scope
- Use `onMount` for: DOM measurement, one-shot subscriptions, non-reactive initialization
- Use `createEffect` for: reactive updates driven by signals
- Never nest reactive reads outside of effects/memos to "control" tracking — use `untrack()` explicitly

**Phase to address:** Phase 01 (set eslint rules); Phase 04 (stateful form atoms first encounter); Phase 05 (Carousel event listeners)

---

### Pitfall 5: Children — Multiple Access and the children() Helper

**What goes wrong:**
Accessing `props.children` multiple times in one component body causes child components to be created multiple times — each access re-executes the children factory. This is a silent performance and correctness bug: duplicate DOM nodes, duplicate effects, duplicate event bindings.

```tsx
// WRONG — TabList renders children twice, creating duplicate elements
const TabList = (props) => {
  const count = props.children.length; // first evaluation
  return <div>{props.children}</div>;  // second evaluation — elements duplicated
};

// CORRECT — children() memoizes and resolves
const TabList = (props) => {
  const resolved = children(() => props.children);
  const count = () => (resolved() as Element[]).length;
  return <div>{resolved()}</div>;
};
```

Additional pitfall: calling `children()` above a Context Provider executes child factories before the provider is in the tree, causing context lookups to return the default (usually undefined/null).

**Why it happens:**
In React, `props.children` is a static snapshot of the VDOM tree — safe to read multiple times. In Solid, `props.children` is a reactive function (or array of functions). Each read can invoke component constructors. The `children()` helper wraps in a memo, calling the factory once and caching the result.

**Warning signs:**
- Compound sub-components (Accordion.Item, TabList.Item, Radio.Item) appear duplicated or double-mounted
- `useContext` inside a compound child returns the context default rather than the provider's value
- Effect cleanup runs twice per child (double mount/unmount cycle visible in test output)

**Prevention:**
- Whenever `props.children` is read in more than one expression (including passing to a count, map, or filter), wrap with `children(() => props.children)`
- Never access `props.children` before rendering the Context Provider that wraps it
- For compound components that iterate children (TabList, Radio, Accordion), always use the `children()` helper and operate on its `.toArray()` or resolved value

**Phase to address:** Phase 06 (Accordion, TabList, Radio — compound iterators); Phase 05 (compound portal components)

---

### Pitfall 6: Conditional Rendering — && Falsy Leak and 0 Rendered to DOM

**What goes wrong:**
The `&&` pattern renders falsy values when the left side is a non-boolean falsy (0, empty string). Solid has no VDOM diffing to suppress these — it compiles the expression into a DOM text node.

```tsx
// WRONG — renders "0" to the DOM when count is 0
{count() && <Badge>{count()}</Badge>}

// CORRECT — uses boolean coercion
{count() > 0 && <Badge>{count()}</Badge>}

// PREFERRED — explicit Show component
<Show when={count() > 0}>
  <Badge>{count()}</Badge>
</Show>
```

`<Show>` also provides a `fallback` prop eliminating nested ternaries, and is the SolidJS idiomatic pattern. Using `&&` works only when the left side is guaranteed boolean.

**Why it happens:**
React developers rely on `&&` extensively. React's reconciler converts falsy non-null values to null before rendering. Solid compiles JSX expressions more literally — `{0}` becomes a text node "0".

**Warning signs:**
- Numeric "0" appears in rendered UI when a count or length is zero
- Empty string renders as visible whitespace in unexpected places
- TypeScript does not flag this — the JSX types accept any expression

**Prevention:**
- Project-wide rule: prefer `<Show when={...}>` over `&&` for conditional rendering
- When `&&` is used, always coerce the condition: `{!!x && ...}` or `{x !== undefined && ...}`
- `eslint-plugin-solid` includes a `no-react-specific-props` rule; consider a custom rule banning bare `&&` with non-boolean left operands in JSX

**Phase to address:** Phase 03 (establish pattern in atom components); applies to all component phases

---

### Pitfall 7: Spreading Props — class/className Collision

**What goes wrong:**
Two distinct failure modes:

**7a — `className` passed to a Solid native element:**
React components use `className`. Solid native elements use `class`. If the codebase uses `{...rest}` spreading and a consumer passes `className`, it lands on the element as the attribute `className` (which browsers ignore for styling) rather than `class`. The correct attribute is set to empty/undefined.

```tsx
// If consumer passes className="extra", it is ignored by browser
<button class={local.class} {...rest} />
// rest contains { className: "extra" } — goes to DOM as attribute, not class
```

**7b — Dynamic class and classList interaction:**
If a component uses both `class` (static string) and `classList` (reactive object) on the same element, and `class` is updated dynamically (via a signal), it can overwrite `classList`-managed classes depending on evaluation order.

**Prevention for 7a:**
- All component props interfaces use `class?: string` not `className?: string` — Solid convention
- In `splitProps`, always include `"class"` (not `"className"`) in the local keys
- If consuming legacy code passes `className`, handle it explicitly: `const cls = local.class ?? (rest as any).className`
- `eslint-plugin-solid` provides `no-react-specific-props` which flags `className` on native elements

**Prevention for 7b:**
- Choose one mechanism per element: either `class` (string) OR `classList` (object), not both
- When combining multiple class sources use `mergeClasses` (already in codebase) which produces a single string for `class`
- The `combineProps` helper from `@solid-primitives/props` handles merging `class`/`classList` reactively if needed

**Warning signs:**
- Tailwind classes from consumers silently not applying
- Components accept `class` prop but DOM element shows incorrect or missing classes
- TypeScript reports no error (both `class` and `className` are valid JSX attribute names in different contexts)

**Phase to address:** Phase 01 (update prop types); Phase 03 (establish class merging pattern); applies to all component phases

---

### Pitfall 8: Portal — Event Bubbling Model and Context Propagation

**What goes wrong:**
Two failure modes:

**8a — Event bubbling:**
React's `createPortal` propagates events through the React component tree (synthetic events), not the DOM tree. SolidJS uses native DOM events (no synthetic event system). `<Portal>` renders children into a different DOM node, so native events bubble up the real DOM tree. This means `onClick` handlers on a Dialog's ancestor component will NOT receive events from inside the Portal unless the ancestor is also an ancestor in the DOM tree (e.g., `document.body`). For this codebase (modal portals to body), this is usually not an issue, but click-outside handlers that rely on event.stopPropagation to not reach the body will behave differently.

**8b — Context propagation:**
Solid's `<Portal>` preserves context from the component tree — context does propagate into portals, unlike the DOM parent relationship. This is correct behavior. The pitfall is the reverse: using the `children()` helper to eagerly resolve children BEFORE they are rendered inside a Portal/Provider will execute child factories outside the context tree, breaking context reads.

```tsx
// WRONG — children resolved before Provider, context reads return default
const resolved = children(() => props.children);
return (
  <Portal>
    <DialogContext.Provider value={ctx}>
      {resolved()}
    </DialogContext.Provider>
  </Portal>
);

// CORRECT — children resolved inside Provider scope
return (
  <Portal>
    <DialogContext.Provider value={ctx}>
      {props.children}
    </DialogContext.Provider>
  </Portal>
);
```

**Warning signs:**
- Click-outside detection fires inside the modal (event reaches body listener via real DOM)
- `useContext(DialogContext)` returns the default value inside Portal children despite Provider being present
- `stopPropagation` in a child stops the event in the DOM tree but not in the "React-style" component tree (no surprise — Solid is native events)

**Phase to address:** Phase 05 (Dialog, BottomSheet, Drawer — portal components)

---

### Pitfall 9: Controlled Inputs — onInput vs onChange

**What goes wrong:**
React's `onChange` fires on every keystroke (it is mapped to the native `input` event). SolidJS's `onChange` fires on native `change` — which triggers only on blur/focus-loss. A direct port of `<input onChange={setValue} />` appears to work in initial Storybook testing (type, tab away, value updates) but fails in real use where users expect immediate reactivity.

```tsx
// React — onChange fires on every keystroke
<input value={value()} onChange={(e) => setValue(e.currentTarget.value)} />

// Solid WRONG — only fires on blur
<input value={value()} onChange={(e) => setValue(e.currentTarget.value)} />

// Solid CORRECT — use onInput for immediate updates
<input value={value()} onInput={(e) => setValue(e.currentTarget.value)} />
```

Additionally, for a truly controlled input in Solid, the `value` prop must be a signal getter call inside JSX (reactive position) — `value={value()}` — not `value={value}` (which passes the getter itself as the attribute value, resulting in a function string).

**Why it happens:**
React normalized onChange to mean "fires on every input change" — a convenience abstraction. Solid follows the native DOM event model. `onChange` → `change` event → fires on blur. `onInput` → `input` event → fires on every keystroke.

**Warning signs:**
- Input value updates only after tabbing out of the field
- Form submissions capture stale values
- `fireEvent.input()` in tests fires the handler; `fireEvent.change()` does too (both trigger in jsdom) — masking the production difference

**Prevention:**
- Audit all `<input>`, `<textarea>`, `<select>` elements during port: replace `onChange` with `onInput` for value binding
- For `<select>` controlled value, `onChange` is correct (selects fire `change` on selection)
- Test with `fireEvent.input()` not `fireEvent.change()` to match production behavior

**Phase to address:** Phase 04 (Checkbox, Radio, Switch, Input, Textarea, FormGroup)

---

## Build and Toolchain Pitfalls

### Pitfall 10: Vitest Without vite-plugin-solid

**What goes wrong:**
Running Vitest on Solid JSX files without the plugin causes immediate failure: `SyntaxError: Unexpected token` on the first JSX expression. More subtly, if the plugin is added to `vite.config.ts` but not to the Vitest-specific config, tests run in a separate Vite instance that lacks the solid transform.

Solid components must be compiled by `babel-preset-solid` (via `vite-plugin-solid`) before any test runner can interpret them. Without it:
- JSX is not transformed to Solid's `createComponent`/`insert` calls
- The module resolution does not pick up the `solid` export condition from `solid-js/package.json`
- Reactivity primitives (`createSignal`, etc.) may load from the wrong module resolution path

Correct minimal `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  test: {
    environment: "jsdom",
    globals: true,
    // solid-js and solid-js/web must not be de-duplicated across test/app contexts
    resolve: {
      conditions: ["development", "browser"],
    },
  },
});
```

Since `vite-plugin-solid` v2.8.2, the plugin auto-injects most configuration; pinning to at least that version is required.

**Warning signs:**
- `SyntaxError: Unexpected token '<'` in test output
- Tests pass in Storybook dev server but fail in `vitest run`
- `dispose is undefined` errors from solid-js internals (module loaded twice)
- Storybook works but `vitest` produces transform errors

**Prevention:**
- Add `vite-plugin-solid` to `vitest.config.ts` (or `vite.config.ts` if shared) as the first plugin, before any other transform
- Set `resolve.conditions: ["development", "browser"]` to ensure the `solid` condition is picked up
- Do NOT share `vitest.config.ts` with the library build config without verifying the transform is consistently applied

**Phase to address:** Phase 01 (toolchain setup — must be correct before any component is ported)

---

### Pitfall 11: tsconfig JSX Configuration Mismatch

**What goes wrong:**
The existing tsconfig uses `"jsx": "react-jsx"` and `"jsxImportSource": "react"`. Leaving this unchanged causes TypeScript to inject React's JSX runtime (`react/jsx-runtime`) instead of Solid's, producing type errors on every Solid-specific JSX attribute (`class`, `classList`, `on:*`) and missing the Solid component type checking.

The required tsconfig changes:
```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "solid-js"
  }
}
```

`"jsx": "preserve"` leaves JSX untouched for `vite-plugin-solid`/`babel-preset-solid` to handle. `"jsxImportSource": "solid-js"` sources JSX types from `solid-js` (specifically from `solid-js/types/jsx.d.ts`).

A common mistake is setting `"jsx": "react-jsx"` with `"jsxImportSource": "solid-js"` — this causes TypeScript to emit `_jsx` calls with Solid types but React runtime imports, breaking at runtime.

**Warning signs:**
- TypeScript errors on `class=` attribute: "Property 'class' does not exist on type..."
- `className` is not flagged even on native elements
- Storybook and Vite build work but TypeScript language server reports JSX type errors
- `import { createSignal } from "solid-js"` resolves correctly but component return types error

**Prevention:**
- Phase 01 must update both `tsconfig.json` (for IDE) and `tsconfig.build.json` (for emit)
- Verify with `tsc --noEmit` that no JSX type errors remain before starting component ports

**Phase to address:** Phase 01 (toolchain)

---

### Pitfall 12: The `solid` Export Condition Missing from package.json

**What goes wrong:**
SolidJS component libraries should ship their source (or a JSX-preserved build) alongside the compiled output so that consuming applications can compile the components with their own `vite-plugin-solid` configuration. This is the `"solid"` condition in `package.json` exports. Without it, consumers get pre-compiled output — which works, but loses SSR support and tree-shaking granularity.

More critically: if the `"browser"` or `"solid"` condition is absent, Vitest's module resolver may not find the correct solid-js entry point, causing `solid-js` to load through two different paths (one via the internal Vite server, one via Node) — triggering "dispose is not a function" or signal tracking failures in tests.

Recommended exports structure for a Solid library:
```json
{
  "exports": {
    ".": {
      "solid": "./dist/source/index.jsx",
      "browser": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    }
  }
}
```

**Warning signs:**
- Consumer apps get "dispose is not a function" when importing from `@moondesignsystem/solid`
- Context does not propagate between library components and app components (two solid-js instances)
- SSR renders fail in consumer Next.js/SolidStart apps

**Prevention:**
- Add the `"solid"` export condition pointing to JSX-preserved source during Phase 01 / release prep
- Test by consuming the built package in a fresh SolidJS Vite project before publishing

**Phase to address:** Phase 01 (package.json structure); Phase 10 (release prep — publish dry-run must verify)

---

### Pitfall 13: Storybook — storybook-solidjs vs storybook-solidjs-vite Version Confusion

**What goes wrong:**
There are two Storybook SolidJS adapters:
1. `storybook-solidjs` (older community package, `solidjs-community/storybook`) — has broken dependencies, does not work with Storybook 8+, no TypeScript autocompletion for args
2. `storybook-solidjs-vite` (newer, maintained by storybookjs org) — built for Storybook 8 and 9, uses Vite, correct `Meta`/`StoryObj` types

The existing `docs/` site uses Storybook 10 + React. Migrating to `storybook-solidjs` (wrong package) results in install failures or runtime crashes immediately. Migrating to `storybook-solidjs-vite` (correct package) requires verifying its Storybook 10 compatibility — it is tested for Storybook 9, so pinning Storybook to 9 may be required.

Story format changes: React stories use `render: (args) => <Component {...args} />`. Solid stories use `render: (args) => () => <Component {...args} />` — the extra wrapping function is required because Solid components are functions that run once, not render functions.

**Warning signs:**
- `npm install storybook-solidjs` succeeds but Storybook fails to start
- Stories render but Storybook controls panel doesn't update components (missing reactivity wrapping)
- `StoryObj<typeof Component>` type errors about args types

**Prevention:**
- Use `storybook-solidjs-vite`, not `storybook-solidjs`
- If Storybook 10 is incompatible with `storybook-solidjs-vite`, pin Storybook to 9.x for the docs site
- Story render functions must return a function: `render: (args) => () => <Component {...args} />`
- Verify with one story (Button) before porting all 37

**Phase to address:** Phase 08 (Storybook migration)

---

## Testing-Library Pitfalls

### Pitfall 14: @solidjs/testing-library API Differences from @testing-library/react

**What goes wrong:**
Direct API swap fails at multiple points:

**14a — render() wraps in a function:**
```ts
// React
render(<Button>Click</Button>)

// Solid — component must be wrapped in a function
render(() => <Button>Click</Button>)
```

Passing the component directly to `render()` causes a runtime error or renders nothing.

**14b — No rerender() method:**
Solid does not re-execute component functions. There is no `rerender()` equivalent. To test prop changes, manage signals at the test scope:
```ts
const [variant, setVariant] = createSignal("fill");
render(() => <Button variant={variant()}>Click</Button>);
// Later:
setVariant("outline");
// DOM updates synchronously — no await needed for synchronous signals
expect(button).toHaveClass("moon-button-outline");
```

**14c — Reactivity is synchronous — rarely need waitFor:**
Unlike React's async rendering, Solid's DOM updates from signal changes are synchronous (batched microtask at worst). Tests should use synchronous `getBy` queries after triggering events, not `await findBy`. Exception: Suspense, async resources, and deferred transitions still require `await`.

**14d — Jest globals vs Vitest globals:**
The existing test setup imports `jest.fn()`, `jest.mock()`, `beforeAll`, etc. Vitest provides equivalent APIs but they come from `vitest` not `jest`. With `globals: true` in vitest config, `vi.fn()` is available as a global. Existing `jest.fn()` calls will throw `jest is not defined`. All mock calls must be updated to `vi.fn()`.

**14e — HTMLDialogElement mocks in jsdom:**
The existing `beforeAll` that mocks `HTMLDialogElement.prototype.showModal` must be preserved — jsdom does not implement `showModal()`. Pattern stays identical, but uses `vi.fn()` instead of `jest.fn()`.

**Warning signs:**
- `render(<Button />)` produces `TypeError: Component is not a function`
- Tests that call `rerender()` fail with "rerender is not a function"
- `jest is not defined` on every test file (missing globals migration)
- Tests pass locally with `--watch` but fail in CI (environment inconsistency)

**Prevention:**
- Phase 07 plan: migrate all test files in a single phase with the API differences documented above as a checklist
- Normalize test filenames to PascalCase (fix `accordion.test.tsx` outlier) in the same phase
- Run `vitest run` on the full test suite at the end of Phase 01 (it will fail — that is expected — but it confirms Vitest is wired correctly before component porting begins)

**Phase to address:** Phase 01 (install @solidjs/testing-library, vitest); Phase 07 (rewrite all 18 test files)

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip `children()` helper when children appear only once | Less boilerplate | Silent double-mount if structure changes | Never — use it consistently for compound components |
| Use `className` on internal elements "for now" | Fewer changes during port | Consumer-passed `class` is silently ignored; `eslint-plugin-solid` reports violations | Never — fix immediately in Phase 01 type definitions |
| Keep `onChange` on inputs as a "compatible" alias | Fewer changes | Value only updates on blur; breaks controlled input behavior | Never for text inputs; acceptable for `<select>` |
| Use `&&` instead of `<Show>` for simple conditionals | Terser code | Renders "0" or "" to DOM with non-boolean left operands | Only when left side is guaranteed boolean (typeof check, explicit comparison) |
| Skip `onCleanup` in effects that seem "stable" | Less code | Memory leak on unmount; accumulating listeners in Carousel, Dialog | Never — effects with subscriptions always need cleanup |
| Defer `solid` export condition to release prep | Faster Phase 01 | Consumer apps may dual-load solid-js during integration testing | Acceptable — but must be done before publish dry-run |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Vitest + vite-plugin-solid | Plugin added to build config but not test config | Use a shared `vite.config.ts` or explicitly add `solid()` to `vitest.config.ts` |
| storybook-solidjs-vite | Pinning to latest Storybook (10) before verifying adapter compatibility | Pin adapter and Storybook versions together; verify with single story first |
| @solidjs/testing-library | Importing `cleanup` manually (was needed in older versions) | Cleanup is automatic in v0.8+; importing it manually causes double-cleanup errors |
| mergeClasses + class spreading | Passing `class` through rest props on elements that also have a static class attribute | Always use `splitProps` to extract `class`, merge via `mergeClasses`, never spread into an element that has its own `class` |
| tsup library build + solid | Using tsup without `@rollup/plugin-babel` or without preserving JSX | Use tsup's `solid` preset or configure `vite build --lib` with `vite-plugin-solid`; do not emit compiled JS without JSX preservation for the `solid` export condition |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Accessing `props.children` multiple times without `children()` | Duplicate DOM nodes, doubled effects | Wrap with `children(() => props.children)` and use the resolved value | Any compound component with more than one child access |
| Creating new objects/arrays inside JSX expressions | Excessive reactive re-runs (object reference changes each render) | Hoist static objects outside JSX; use `createMemo` for computed objects | High-frequency signal updates (Carousel scroll, Pagination) |
| Calling signal getters in module scope (outside component) | Signal never tracked; stale reads | Only call getters inside reactive contexts (JSX, createEffect, createMemo) | Any singleton/module-level initialization |
| Large `createEffect` bodies with many reactive reads | Entire effect re-runs on any single read change | Break into smaller effects or `createMemo`; use `untrack()` for non-reactive reads | Components with many props that change independently |

---

## "Looks Done But Isn't" Checklist

- [ ] **Props reactivity:** All 37 components use `mergeProps` + `splitProps` — verify no `{ ...destructure }` in function signatures
- [ ] **Signal types:** Context value interfaces use `Accessor<T>` not `T` for reactive values
- [ ] **Ref sharing:** All refs that cross component boundaries via context are `createSignal<HTMLElement>()`-wrapped
- [ ] **Input handlers:** All `<input>` and `<textarea>` elements use `onInput` not `onChange` for value binding
- [ ] **Conditional rendering:** No bare `&&` with non-boolean left side in JSX; `<Show>` used for component-level conditionals
- [ ] **Effect cleanup:** Every `createEffect` or `onMount` with an event listener has a corresponding `onCleanup`
- [ ] **children() helper:** Every compound component that accesses `props.children` more than once uses `children()`
- [ ] **class not className:** All prop interfaces and JSX attributes use `class`, not `className`; `eslint-plugin-solid/no-react-specific-props` passes with zero violations
- [ ] **Vitest config:** `vite-plugin-solid` plugin present in vitest config; `resolve.conditions` includes `"solid"` or `"browser"`
- [ ] **package.json exports:** `"solid"` condition present pointing to JSX-preserved source
- [ ] **test render():** Every `render()` call wraps the component in a function: `render(() => <Comp />)`
- [ ] **jest → vi:** Zero references to `jest.fn()`, `jest.mock()`, `jest.spyOn()` — all replaced with `vi.*` equivalents
- [ ] **Storybook adapter:** `storybook-solidjs-vite` (not `storybook-solidjs`) installed and pinned; story render functions use `() => () => <Comp />`
- [ ] **Storybook 10 compat:** Verify `storybook-solidjs-vite` works with the pinned Storybook version before porting all 37 stories

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Props destructuring found after Phase 03 | MEDIUM | `eslint-plugin-solid/no-destructure --fix` identifies all violations; fix component-by-component; tests immediately reveal broken reactivity |
| Vitest transform wrong across 18 test files | LOW | Fix `vitest.config.ts` once; all tests re-run correctly |
| className collision discovered post-Phase 03 | LOW | Search `className` in component files; replace with `class`; verify with eslint |
| Ref context sharing broken in Dialog | MEDIUM | Wrap ref in `createSignal`; update Context type; update all consumers — Dialog has 4 sub-components |
| storybook-solidjs installed instead of storybook-solidjs-vite | LOW | `npm uninstall storybook-solidjs && npm install storybook-solidjs-vite`; adapter swap is package-level |
| onChange used everywhere on inputs | LOW | Grep `onChange` in form atom components; replace with `onInput` for text fields |
| children() missing, causing double-mount in compound components | MEDIUM | Identify affected components via test failures; wrap with `children()` helper; re-run tests |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Props destructuring kills reactivity | Phase 01 (eslint rule), Phase 03 (establish pattern) | `eslint-plugin-solid/no-destructure` zero violations; Storybook controls update live |
| Signal getters vs values in context | Phase 01 (Accessor<T> type convention), Phase 05 | Context consumers update when provider signal changes (integration test) |
| Refs shared via context not reactive | Phase 05 (Dialog, Drawer, BottomSheet) | Trigger.click() opens dialog when Content is in separate sub-tree |
| Missing onCleanup in effects | Phase 01 (eslint), Phase 04 (Carousel), Phase 05 | Mount/unmount test cycle shows no listener accumulation |
| Children multiple access | Phase 06 (Accordion, TabList, Radio) | No duplicate DOM nodes; compound children render exactly once |
| Conditional && falsy leak | Phase 03 (establish Show pattern) | Numeric 0 never renders as text in badge/count components |
| class/className collision | Phase 01 (prop types), Phase 03 | `eslint-plugin-solid/no-react-specific-props` zero violations |
| Portal context/event behavior | Phase 05 (Dialog, BottomSheet, Drawer) | useContext returns Provider value inside Portal; click-outside handler fires correctly |
| onInput vs onChange | Phase 04 (form atoms) | Typing in Input component updates value on each keystroke, not on blur |
| Vitest missing solid plugin | Phase 01 (toolchain) | `vitest run` on empty test suite exits 0 with correct transform |
| tsconfig JSX mismatch | Phase 01 (toolchain) | `tsc --noEmit` zero errors; `class=` accepted in JSX |
| solid export condition absent | Phase 01 (package.json structure), Phase 10 (verify) | Consumer app can `import { Button } from "@moondesignsystem/solid"` without dual-loading |
| Storybook adapter wrong/incompatible | Phase 08 (storybook migration) | Single Button story renders and controls work before porting remaining 36 |
| @solidjs/testing-library API differences | Phase 01 (install), Phase 07 (rewrite tests) | All 18 test files pass with `vitest run`; zero `jest is not defined` errors |

---

## Sources

- [Props — SolidJS Documentation](https://docs.solidjs.com/concepts/components/props) — props reactivity, splitProps, mergeProps (HIGH confidence)
- [Understanding SolidJS props: A complete guide — LogRocket](https://blog.logrocket.com/understanding-solidjs-props-complete-guide/) — children helper, signal passing (MEDIUM confidence)
- [Props/Splitting Props — SolidJS Tutorial](https://www.solidjs.com/tutorial/props_split) — splitProps examples (HIGH confidence)
- [SolidJS for React Developers — Marmelab](https://marmelab.com/blog/2025/05/28/solidjs-for-react-developper.html) — React→Solid migration pitfalls (MEDIUM confidence)
- [SolidJS pain points and pitfalls — Vladislav Lipatov](https://vladislav-lipatov.medium.com/solidjs-pain-points-and-pitfalls-a693f62fcb4c) — untracked deps, resource pitfalls (MEDIUM confidence)
- [class/className/classList in SolidJS — GitHub Discussion #948](https://github.com/solidjs/solid/discussions/948) — class collision details (HIGH confidence)
- [solid-testing-library README — GitHub](https://github.com/solidjs/solid-testing-library) — render() API, cleanup, reactivity in tests (HIGH confidence)
- [Testing — SolidJS Documentation](https://docs.solidjs.com/guides/testing) — Vitest config, testEffect (HIGH confidence)
- [How to use onChange in Solid.js — TypeOfNaN](https://typeofnan.dev/how-to-use-onchange-in-solidjs/) — onInput vs onChange (MEDIUM confidence)
- [vite-plugin-solid — GitHub](https://github.com/solidjs/vite-plugin-solid) — Vitest configuration, dependency gotchas (HIGH confidence)
- [storybook-solidjs-vite — Storybook Addons](https://storybook.js.org/addons/storybook-solidjs-vite) — correct adapter for Storybook 8/9 (HIGH confidence)
- [Document how to build a library for SolidJS — vite-plugin-solid Issue #97](https://github.com/solidjs/vite-plugin-solid/issues/97) — solid export condition (MEDIUM confidence)
- [Portal — SolidJS Documentation](https://docs.solidjs.com/concepts/control-flow/portal) — event bubbling, context propagation (HIGH confidence)
- [children helper — SolidJS Documentation](https://docs.solidjs.com/reference/component-apis/children) — multiple access pitfall (HIGH confidence)
- [Converting a React Component to SolidJS — DEV Community](https://dev.to/mbarzeev/converting-a-react-component-to-solidjs-5bgj) — practical migration notes (MEDIUM confidence)

---
*Pitfalls research for: React→SolidJS component library port (Moon Design System)*
*Researched: 2026-05-31*
