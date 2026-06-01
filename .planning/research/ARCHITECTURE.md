# Architecture Research

**Domain:** SolidJS component library — monorepo port from React
**Researched:** 2026-05-31
**Confidence:** HIGH (build pipeline verified against tsup-preset-solid source and storybook-solidjs-vite v10.1.1 release; barrel/CLI patterns from direct code inspection)

---

## Standard Architecture

### System Overview (Post-Migration Target)

```
npm workspaces root (moon-react-monorepo)
├── packages/          ← @moondesignsystem/solid (the lib)
│   ├── src/           ← source-of-truth; compiled by tsup
│   │   ├── types/
│   │   ├── helpers/
│   │   ├── assets/icons/
│   │   └── components/
│   ├── dist/          ← built artifacts (ESM + d.ts + preserved-JSX solid entry)
│   ├── cli/           ← scaffolder (Node, not bundled)
│   └── bin/           ← moon-solid executable (renamed from moon-react)
└── docs/              ← Storybook 10 (storybook-solidjs-vite)
    └── stories/components/
```

### Workspace / Consumption Boundaries

| Workspace | Builds | Consumes |
|-----------|--------|----------|
| `packages/` | `dist/` via tsup (ESM + types + solid condition) | `solid-js` (peer), nothing from `docs/` |
| `docs/` | Storybook static via `storybook-solidjs-vite` | `packages/` via `file:../packages` link |
| CLI (`packages/cli/`) | Not bundled — runs via `tsx` at npx time | `packages/src/` directly (copies raw source) |
| Root | Orchestrates `build`, `dev`, `release` | Both workspaces |

**Key constraint:** `docs/` must not be listed as an `imports` source in `packages/`. The `file:` workspace link means `docs/` resolves `@moondesignsystem/solid` to `packages/dist/`. Therefore `packages/` must always be built before `docs/` dev server starts. The root `dev` script must sequence `build:watch` before `storybook dev`.

---

## Build Pipeline Change: tsc → tsup with tsup-preset-solid

### Why the current build does not work for Solid

The React build uses TypeScript's `tsc` with `"jsx": "react-jsx"`. The compiler emits JS with React `createElement` calls baked in. The consumer bundles that JS directly — no Babel pass needed.

Solid JSX does not work this way. `babel-preset-solid` transforms JSX into Solid-specific runtime calls (`_tmpl$`, `createComponent`, `insert`, etc.). If a Solid library ships pre-compiled JS without running `babel-preset-solid`, the JSX is just gone — nothing to transform. The consumer's Vite/babel pass only runs on *their* source, not on pre-built node_modules.

There are two safe options; one clear winner:

| Option | How | Verdict |
|--------|-----|---------|
| **tsup-preset-solid** (recommended) | tsup + esbuild, preset automates the solid condition, generates package.json exports | Use this |
| vite build lib mode + vite-plugin-solid | Vite + Rollup, more manual config | Acceptable fallback if tsup-preset-solid has a blocker |
| type-only tsc (current) + no bundler | Ship raw source under solid condition | Would work if consumers use vite-plugin-solid, but unreliable — requires consumers to configure `resolve.conditions: ["solid"]` |

**Use tsup-preset-solid.** It is the community-standard tool for exactly this use case. It is actively maintained (npm version v0.x, solidjs-community org, GitHub active as of 2025). It handles the only hard part — the `solid` export condition — automatically.

### What tsup-preset-solid produces

Given an entry `src/index.tsx`, the preset builds:

```
dist/
├── index.js          ← compiled ESM, babel-preset-solid applied ("import" condition)
├── index.jsx         ← preserved JSX ("solid" condition — for SolidStart/SSR consumers)
└── index.d.ts        ← TypeScript declarations (tsc emit, separate pass)
```

The preset automatically writes the `package.json` exports field. The generated shape is:

```json
{
  "type": "module",
  "exports": {
    ".": {
      "solid": "./dist/index.jsx",
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

The `"solid"` condition serves consumers that have configured `resolve.conditions: ["solid"]` in their Vite or Node resolver — most notably SolidStart. Those consumers receive the preserved-JSX output and run `babel-preset-solid` themselves, enabling SSR and fine-grained optimization. Standard ESM consumers (Vite app without SolidStart) hit the `"import"` condition and receive the pre-compiled output.

### tsup.config.ts shape

```typescript
import { defineConfig } from "tsup";
import { solidPlugin } from "esm-package-solid";   // NOT vite-plugin-solid
// use the preset
import { withPreset } from "tsup-preset-solid";

export default defineConfig(
  withPreset({
    entries: [{ entry: "src/index.tsx" }],
    // cjs: false  (default — ESM only is correct for a Solid lib)
    // drop_console: true  (set in production)
  })
);
```

**Important:** `tsup-preset-solid` installs `babel-preset-solid` as a peer dependency. Do not add `vite-plugin-solid` to `packages/` devDependencies — it is only needed in `docs/`.

### tsconfig changes in packages/

```jsonc
// tsconfig.json (dev / editor)
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "noEmit": true            // editor only; tsup drives the real emit
  }
}

// tsconfig.build.json (type-emit only, fed to tsup)
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "./dist"
  }
}
```

The `"jsx": "react-jsx"` setting is replaced. `"preserve"` leaves JSX intact for `babel-preset-solid` to handle. `"jsxImportSource": "solid-js"` makes TypeScript validate JSX against Solid's types without the React JSX factory.

### Build script changes in packages/package.json

```json
{
  "scripts": {
    "prebuild": "npm run barrels",
    "build": "tsup",
    "build:watch": "tsup --watch"
  }
}
```

Remove the old `tsc --project tsconfig.build.json` line. tsup reads `tsup.config.ts` and drives both the Babel+esbuild compilation and the `tsc --emitDeclarationOnly` pass internally.

---

## Barrel Generation: barrelsby + generate-barrel.js

**The barrel generator works unchanged.** It is a Node.js script that reads the filesystem (`fs.readdirSync`) and emits `export { default as X } from "./X"` lines. It has no dependency on React, JSX, or any framework — it manipulates file names only.

The generated `src/components/index.ts` will look identical after the port:

```typescript
// Auto-generated. Run: npm run barrels
export * from "../types";
export { default as Button } from "./Button";
export type { ButtonVariants } from "./Button";
// ... 37 components
```

**Tree-shaking:** With `"sideEffects": false` in `packages/package.json` and tsup's ESM output, named re-exports from a barrel are tree-shakeable. Bundlers (Vite, Rollup, webpack 5+) eliminate unused components at build time. The barrel pattern is safe for a published component library.

**One change required:** `barrelsby` (the npm package) is listed as a devDependency but `generate-barrel.js` does not use it — it uses raw `fs`. No barrelsby config is needed, and the barrelsby dependency can be removed. The custom `generate-barrel.js` script is self-contained and runs identically for Solid.

---

## Storybook docs/ Workspace

### Package change

Replace `@storybook/react-vite` with `storybook-solidjs-vite`. This is the community-maintained SolidJS framework adapter. Current version: **v10.1.1** (released May 25, 2026) — it targets Storybook 10 explicitly.

```json
// docs/package.json changes
{
  "dependencies": {
    "@moondesignsystem/solid": "file:../packages",
    "solid-js": "^1.8"
  },
  "devDependencies": {
    "storybook-solidjs-vite": "^10.1.1",
    "vite-plugin-solid": "^2.x"
  }
}
```

Remove `@storybook/react-vite`, `@vitejs/plugin-react`, `react`, `react-dom`, `@types/react*`. Add `solid-js` and `vite-plugin-solid` (the Vite plugin is needed in docs because Storybook's Vite builder must compile Solid JSX from stories — distinct from the lib build which uses tsup).

### main.ts change

```typescript
// docs/.storybook/main.ts
import type { StorybookConfig } from "storybook-solidjs-vite";

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../stories/*.mdx",
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
    "@storybook/addon-themes",
    "@chromatic-com/storybook",
  ],
  framework: {
    name: "storybook-solidjs-vite",
    options: {
      docgen: {
        savePropValueAsString: true,
        shouldExtractLiteralValuesFromEnum: true,
        propFilter: (prop: any) =>
          prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
      },
    },
  },
};

export default config;
```

### file: link behavior

The existing `"@moondesignsystem/solid": "file:../packages"` link (renamed from `react`) resolves to `packages/dist/` via the `exports` field. Storybook's Vite process will resolve `@moondesignsystem/solid` → `dist/index.js` (or `dist/index.jsx` if it honours the `solid` condition via `resolve.conditions`). Either way, the import works. No workspace symlink or `npm link` changes required.

**Risk:** `storybook-solidjs-vite` is community-maintained, not in Storybook's official core. The version cadence tracks Storybook core closely (v10.1.1 matches SB 10), but any future Storybook minor update may lag by days to weeks. Treat this as a known, manageable risk — not a blocker.

---

## CLI Scaffolder Changes

### What changes and what does not

| Aspect | Status | Detail |
|--------|--------|--------|
| CLI orchestration logic (`cli/index.ts`) | Unchanged | Arg parsing, prompts, Moon CSS init — all framework-agnostic |
| Dependency resolution (`add.ts`) | Unchanged | Recursive copy via `COMPONENTS_META` — framework-agnostic |
| `COMPONENTS_META` metadata | Unchanged | Keys, srcPath/destPath mappings remain identical |
| `generate-barrel.js` call from CLI | Unchanged | Script produces same output |
| `directories-constants.ts` | Unchanged | Absolute paths to `src/` subdirs |
| **Source templates being copied** | **Changed** | All `.tsx` files contain React → must become Solid |
| **Bin name** | **Changed** | `bin/moon-react` → `bin/moon-solid` |
| **Package bin field** | **Changed** | `"moon-react": "bin/moon-react"` → `"moon-solid": "bin/moon-solid"` |
| **npx invocation** | **Changed** | `npx @moondesignsystem/solid --add button` |

### What "Solid templates" means for the CLI

The CLI copies raw source files from `packages/src/` into the consumer's project. After the port, those source files will be Solid `.tsx` files using `splitProps`, `mergeProps`, `createSignal`, etc. The CLI copies them verbatim. Consumers who scaffold via CLI get Solid source — correct behavior.

No new CLI code needs to be written. The template change is the component port itself (Phases 03–06). By the time Phase 09 runs, all source is already Solid.

### One data change: COMPONENTS_META case sensitivity

Currently `buttonComponent` in `components-meta.ts` references `name: "button"` (lowercase) while `copyComponent()` capitalizes it to `Button.tsx` at lookup time. This pattern is intentional and framework-agnostic. It works unchanged for Solid components as long as filenames remain PascalCase.

---

## Migration Build Order and Dependency Rationale

The correct order is bottom-up through the dependency graph, then across the framework surface:

```
Phase 01 — Toolchain swap (no component changes)
    ↓
Phase 02 — Helpers + Types + Icons (zero framework surface)
    ↓
Phase 03 — Stateless atoms (depend only on Phase 02 outputs)
    ↓
Phase 04 — Stateful form atoms (depend on Phase 02; some depend on Phase 03)
    ↓
Phase 05 — Compound + Portal components (depend on Phases 02–04; signals shared via context)
    ↓
Phase 06 — Composite/layout components (depend on Phases 02–05)
    ↓
Phase 07 — Tests rewrite (depends on all ported components)
    ↓
Phase 08 — Storybook stories rewrite (depends on all ported components)
    ↓
Phase 09 — CLI bin rename (depends on source being fully Solid)
    ↓
Phase 10 — Release prep
```

### Rationale per layer

**Phase 01 (Toolchain):** Establishes `tsup-preset-solid`, Vitest, `eslint-plugin-solid`, updated tsconfigs, and the new package name. Build must succeed on an empty (or preserved React) barrel before any component is touched. Validates the pipeline independently.

**Phase 02 (Helpers + Types + Icons):**
- `mergeClasses.ts` is pure JavaScript — zero framework coupling. Port cost is zero.
- `types/index.ts` contains only TypeScript union types — zero framework coupling.
- `assets/icons/*.tsx` are the only React FCs outside of `components/`. They use `React.SVGProps<SVGSVGElement>` → replace with `JSX.SvgSVGAttributes<SVGSVGElement>` from `solid-js`. Everything in `components/` depends on icons; porting icons first eliminates a transitive React import that would break subsequent phases.

Must come before Phase 03 because every component imports from helpers, types, and sometimes icons.

**Phase 03 (Stateless atoms):** Button, IconButton, Badge, Tag, Chip, Avatar, Loader, CircularProgress, LinearProgress, Placeholder, Alert, Breadcrumb.
- No `createSignal`, no context, no portal.
- Only dependency: Phase 02.
- This is where the `splitProps`/`mergeProps` pattern is established and stabilized. Getting this right here means Phases 04–06 follow the same pattern mechanically.

Alert is compound (`Alert.Close`, `Alert.Content`, etc.) but manages no internal state — the compound pattern is `Object.assign(Root, {...})` which is pure JavaScript. Include it here.

**Phase 04 (Stateful form atoms):** Checkbox, Radio, Switch, Input, Textarea, FormGroup, SegmentedControl.
- Introduce `createSignal` for controlled/uncontrolled state.
- Some may need `createEffect` for value synchronization.
- Depend only on Phase 02. No cross-component context or portals.
- Carousel also fits here (uses Button from Phase 03 and chevron icons, has local state for slide index). Add Carousel to Phase 04 since its Button dependency is already resolved.

**Phase 05 (Compound + Portal):** Dialog, Drawer, BottomSheet, Snackbar, Tooltip, Dropdown, Menu, Select.
- All require `createContext`/`useContext` for state shared between Root and sub-components.
- Dialog and Drawer use `<Portal>` (`<Portal mount={document.body}>` from `solid-js/web`).
- Refs shared across context boundaries need signal-wrapped refs: `const [ref, setRef] = createSignal<HTMLDialogElement>()`.
- Must come after Phase 04 because Select and Dropdown may internally use Input/Checkbox-like elements.

**Phase 06 (Composite/layout):** Accordion, TabList, Table, List, Pagination, Authenticator.
- Accordion and TabList share state across sub-components — compound context pattern, same as Phase 05 but without portals.
- Table uses `@tanstack/react-table` in the *docs* workspace (stories only). The component itself may or may not depend on tanstack — verify before this phase. If tanstack is used in the component source, replace with `@tanstack/solid-table`.
- Pagination uses ChevronLeft/ChevronRight icons (already ported in Phase 02).
- Authenticator is last because it is the most complex composite.

**Phases 07–09** are independent of each other but depend on all components being ported. They can be parallelized across sessions but not within a single automated pass (tests must see compiled Solid components; stories the same).

---

## Component Boundary Map

```
packages/src/
├── types/index.ts              ← no deps
├── helpers/mergeClasses.ts     ← no deps
├── assets/icons/*.tsx          ← deps: solid-js (JSX types only)
├── components/
│   ├── [stateless atoms]       ← deps: types, helpers, icons
│   ├── [stateful atoms]        ← deps: types, helpers, (some: other atoms)
│   ├── [compound+portal]       ← deps: types, helpers, icons, (some: atoms)
│   └── [composite]             ← deps: types, helpers, icons, atoms, (some: compound)
└── index.ts                    ← re-exports from components/index.ts (barrel)
    └── components/index.ts     ← auto-generated by generate-barrel.js
```

**No circular imports exist** in the current React codebase. The Solid port preserves the same dependency direction: infrastructure → atoms → compound → composite. The barrel (`index.ts`) is a flat re-export and never imported by components themselves, so adding it last in generation order causes no cycles.

---

## Architectural Patterns

### Pattern 1: splitProps + mergeProps on Every Component

**What:** Every Solid component receives a single `props` argument. Defaults are applied via `mergeProps`. Component-owned props are extracted via `splitProps`. The remaining spread goes to the DOM element.

**When to use:** Every component. Without exception.

**Why:** Destructuring `props` in a function signature breaks Solid's reactive proxy — prop updates stop flowing. This is the single most critical porting rule.

**Example:**
```tsx
import { mergeProps, splitProps, type Component } from "solid-js";
import type { JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "fill" | "soft" | "ghost" | "outline";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  context?: "brand" | "neutral" | "positive" | "negative" | "warning";
  isFullWidth?: boolean;
};

const Button: Component<ButtonProps> = (rawProps) => {
  const props = mergeProps(
    { variant: "fill", size: "md", context: "brand" },
    rawProps
  );
  const [local, rest] = splitProps(props, [
    "class", "variant", "size", "context", "isFullWidth", "children",
  ]);

  return (
    <button
      class={mergeClasses(
        "moon-button",
        `moon-button--${local.variant}`,
        `moon-button--${local.size}`,
        local.isFullWidth && "moon-button--full-width",
        local.class
      )}
      {...rest}
    >
      {local.children}
    </button>
  );
};

export default Button;
```

### Pattern 2: Signal-Wrapped Ref for Context-Shared DOM Nodes

**What:** When a ref must be shared across compound sub-components via context, use a signal to hold it. Plain `let ref` is not reactive — context consumers won't re-run when the ref populates.

**When to use:** Dialog, Drawer, BottomSheet — any compound component where the trigger sub-component calls a method on a DOM node owned by the root or content sub-component.

**Example:**
```tsx
import { createSignal, createContext, useContext } from "solid-js";

const DialogContext = createContext<{
  dialogRef: () => HTMLDialogElement | undefined;
  open: () => void;
}>();

const DialogRoot: Component<DialogProps> = (rawProps) => {
  const [dialogRef, setDialogRef] = createSignal<HTMLDialogElement>();

  return (
    <DialogContext.Provider value={{
      dialogRef,
      open: () => dialogRef()?.showModal(),
    }}>
      {rawProps.children}
      <dialog ref={setDialogRef}>{/* ... */}</dialog>
    </DialogContext.Provider>
  );
};
```

### Pattern 3: Compound Component via Object.assign (Unchanged from React)

**What:** Sub-components attached as properties on the root component. The pattern is pure JavaScript — not React-specific.

**When to use:** Alert, Accordion, Dialog, Drawer, Dropdown, Menu, Select, TabList, and any other multi-part component.

**Trade-offs:** No change in mechanics. `displayName` is less useful in Solid devtools than React devtools, but retaining it for debugging is harmless.

**Example:**
```tsx
const DialogRoot: Component<DialogRootProps> = (props) => { /* ... */ };
const DialogTrigger: Component<DialogTriggerProps> = (props) => { /* ... */ };
const DialogContent: Component<DialogContentProps> = (props) => { /* ... */ };

const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Content: DialogContent,
});

export default Dialog;
```

### Pattern 4: Portal for Overlays

**What:** `<Portal>` from `solid-js/web` replaces `createPortal` from `react-dom`. Renders children outside the component tree, mounted to `document.body` by default.

**When to use:** Dialog, Drawer, BottomSheet, Snackbar, Tooltip — any component that must escape CSS stacking contexts.

**Example:**
```tsx
import { Portal } from "solid-js/web";

const DialogContent: Component<DialogContentProps> = (rawProps) => {
  const [local, rest] = splitProps(rawProps, ["class", "children"]);
  return (
    <Portal>
      <div class={mergeClasses("moon-dialog", local.class)} {...rest}>
        {local.children}
      </div>
    </Portal>
  );
};
```

---

## Anti-Patterns

### Anti-Pattern 1: Destructuring Props in the Signature

**What people do:**
```tsx
const Button = ({ variant = "fill", class: cls, ...rest }: ButtonProps) => { /* ... */ };
```

**Why it's wrong:** Solid's reactivity model is proxy-based. Destructuring extracts values at call time — subsequent reactive updates to those props are never observed. The component renders correctly on first render but is effectively frozen for prop changes. This silently breaks controlled inputs, context-driven state, and any dynamic prop.

**Do this instead:** `mergeProps` + `splitProps` as shown in Pattern 1.

### Anti-Pattern 2: Using React's createPortal

**What people do:** Leave `import { createPortal } from "react-dom"` in portal components after a partial port.

**Why it's wrong:** React DOM is not installed. The import will fail at build time (tsup) or runtime.

**Do this instead:** `<Portal>` from `solid-js/web`.

### Anti-Pattern 3: Treating useEffect deps as an Array in createEffect

**What people do:**
```tsx
createEffect(() => { /* ... */ }, [open]); // broken — Solid ignores the second arg
```

**Why it's wrong:** `createEffect` auto-tracks signals accessed during execution. A dependencies array is not valid in Solid and is silently ignored, leading to over-firing or under-firing.

**Do this instead:** Access signals inside the effect body and let Solid's reactive runtime track them.

### Anti-Pattern 4: Shipping Library Without the solid Export Condition

**What people do:** Build with plain tsup/esbuild (no preset) and publish only the `"import"` condition.

**Why it's wrong:** SolidStart consumers can't use the library for SSR because they need the preserved-JSX entry. The `solid` condition is the ecosystem contract for Solid libraries that ship SSR-compatible output.

**Do this instead:** Use `tsup-preset-solid` which generates both conditions automatically.

### Anti-Pattern 5: Installing vite-plugin-solid in packages/

**What people do:** Add `vite-plugin-solid` to `packages/devDependencies` because "it compiles Solid."

**Why it's wrong:** `tsup-preset-solid` uses `babel-preset-solid` under the hood (via esbuild's babel transform). `vite-plugin-solid` is a Vite plugin — it belongs only in `docs/` where Storybook runs Vite. Having both in `packages/` causes version conflicts and confusion about which compiler runs.

**Do this instead:** `packages/` gets `tsup-preset-solid` + `babel-preset-solid`. `docs/` gets `vite-plugin-solid` + `storybook-solidjs-vite`.

---

## Data Flow (Post-Migration)

### NPM Package Import Flow

```
Consumer app
    ↓ import { Button } from "@moondesignsystem/solid"
packages/dist/index.js   ← "import" condition (pre-compiled by babel-preset-solid)
    ↓
packages/dist/Button.js  ← Solid reactive runtime calls (_tmpl$, createComponent, etc.)
    ↓
Consumer's bundler tree-shakes unused exports (sideEffects: false)
    ↓
Browser renders real DOM nodes (Solid has no vDOM)
```

### SolidStart SSR Import Flow

```
SolidStart app (resolve.conditions includes "solid")
    ↓ import { Button } from "@moondesignsystem/solid"
packages/dist/index.jsx  ← "solid" condition (preserved JSX)
    ↓
SolidStart's babel-preset-solid runs on preserved JSX
    ↓
SSR: renderToString(); Hydration: reconciles on client
```

### CLI Scaffold Flow (unchanged mechanics, Solid templates)

```
npx @moondesignsystem/solid --add button dialog
    ↓ bin/moon-solid → tsx packages/cli/index.ts
    ↓ prompts for Moon CSS
    ↓ add.ts: copyComponent("button", DIRECTORIES.COMPONENTS, "src/components")
    ↓ copies packages/src/components/Button.tsx (now Solid source) → consumer/src/components/Button.tsx
    ↓ recurses: copies packages/src/helpers/mergeClasses.ts, packages/src/types/index.ts
    ↓ same for Dialog + Dialog's internal deps
Consumer now has Solid source files, editable in their own project
```

### Storybook Dev Flow

```
npm run dev (root)
    ↓ build:watch (packages/) — tsup --watch compiles src/ → dist/
    ↓ storybook dev (docs/) — Storybook 10 + Vite + vite-plugin-solid
    ↓ docs/stories/Button.stories.tsx imports Button from "@moondesignsystem/solid"
    ↓ resolved via file:../packages → packages/dist/index.js
    ↓ Storybook serves HMR'd stories at localhost:6006
```

---

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `packages/src` → `packages/dist` | tsup compilation (prebuild + build) | generate-barrel.js runs first (prebuild hook) |
| `docs/` → `packages/` | `file:../packages` npm workspace link | Resolves to `dist/` via exports field; requires packages/ to be built first |
| `packages/cli/` → `packages/src/` | `fs.copy` at runtime (not import) | CLI reads src/ directly; does not use dist/ |
| Component → types/helpers/icons | TypeScript `import` | All within packages/src/; no cross-workspace |
| Compound Root → Sub-components | Solid `createContext` / `useContext` | Signal-wrapped refs for DOM node sharing |

### External Services

| Service | Integration | Notes |
|---------|-------------|-------|
| `solid-js@^1.8` | Peer dependency | Must be installed by consumer; not bundled |
| `@moondesignsystem/ui` (CSS) | CLI prompts install | Runtime CSS; unchanged by migration |
| Changesets | Release orchestration | `packages/package.json` version bump only |
| Chromatic | Storybook visual CI | Unchanged; points to `docs/` |

---

## Scaling Considerations

This is a component library, not a backend service. "Scaling" means: can the build and testing workflow handle more components?

| Concern | Current (37 components) | After port (37 components) | At 100 components |
|---------|------------------------|--------------------------|-------------------|
| Build time | tsc ~2–5s | tsup ~3–8s (adds babel pass) | tsup ~10–15s (esbuild is fast) |
| Barrel file | 37 exports, instant generate | Identical script, same speed | Linear, still fast |
| Storybook startup | Vite cold start ~15s | Same ballpark with vite-plugin-solid | May need storybook lazy loading |
| CLI scaffolder | Recursive copy, O(n) deps | Unchanged | Add component entries to COMPONENTS_META |

tsup's esbuild core is fast enough that build time is not a concern at this component count. The barrel file generator is a synchronous fs script — it will remain fast at 100+ components.

---

## Sources

- [tsup-preset-solid GitHub](https://github.com/solidjs-community/tsup-preset-solid) — authoritative; MEDIUM confidence (community-maintained, no official Solid team endorsement, but ecosystem-standard)
- [storybook-solidjs-vite GitHub](https://github.com/solidjs-community/storybook) — v10.1.1 as of 2026-05-25; HIGH confidence
- [SolidJS solid-js splitProps / mergeProps docs](https://context7.com/solidjs/solid/llms.txt) — HIGH confidence (Context7, official)
- [vite-plugin-solid issue #97](https://github.com/solidjs/vite-plugin-solid/issues/97) — confirms that library build with vite-plugin-solid is underdocumented; validated preference for tsup-preset-solid
- [solid-js package.json exports](https://github.com/solidjs/solid/blob/main/packages/solid/package.json) — reference for the solid/import/browser condition shape; HIGH confidence
- Direct codebase inspection: `packages/package.json`, `tsconfig.build.json`, `scripts/generate-barrel.js`, `cli/commands/add.ts`, `cli/components-meta.ts`

---

*Architecture research for: Moon SolidJS Design System (monorepo port)*
*Researched: 2026-05-31*
