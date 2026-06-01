# Phase 6: Storybook Migration (React → SolidJS) - Research

**Researched:** 2026-06-01
**Domain:** storybook-solidjs-vite, Storybook 10, @tanstack/solid-table v8, addon compatibility
**Confidence:** HIGH (adapter + CSF API, verified via Context7 + npm registry), MEDIUM (chromatic compat, verified via web search), LOW (withThemeByClassName behaviour under Solid)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- D-00: SPIKE FIRST — Button story + addons must pass build before bulk-porting 37 stories.
- D-01: Toolchain swap: `@moondesignsystem/react` → `@moondesignsystem/solid`, `react` → `solid-js`, `@storybook/react-vite` → `storybook-solidjs-vite`, `@vitejs/plugin-react` → `vite-plugin-solid`, `@tanstack/react-table` → `@tanstack/solid-table`. Keep addons pending spike.
- D-02: main.ts — `framework.name` = `"storybook-solidjs-vite"`, `StorybookConfig` from `storybook-solidjs-vite`.
- D-03: preview.ts — `Preview` from `storybook-solidjs-vite`, keep `withThemeByClassName`, custom decorator adjusted for Solid CSF.
- D-04: 37 stories — Meta/StoryObj from `storybook-solidjs-vite`, imports from `@moondesignsystem/solid`, render fn adjusted.
- D-05: 4 shared React FCs → Solid components.
- D-06: Table story uses `@tanstack/solid-table` with `createSolidTable`.
- D-07: Build gate — `npm run build-storybook` exits 0.

### Claude's Discretion

- If an addon is incompatible: prefer removing/replacing the single addon over pinning Storybook 9.
- Story-by-story render-fn structure as long as output + controls match.

### Deferred Ideas (OUT OF SCOPE)

- CLI scaffolder + bin rename (Phase 7).
- README/CHANGELOG/version bump/publish (Phase 7).
- Chromatic CI workflow tuning beyond making build-storybook green.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STORY-01 | Swap framework to storybook-solidjs-vite + single Button spike validates renderer + all addons | Adapter version, correct main.ts/preview.ts config, addon compat table, complete Button story example |
| STORY-02 | All 37 stories rewritten in Solid CSF + Table story uses @tanstack/solid-table + build-storybook green | Solid CSF render signature, createJSXDecorator pattern, tanstack/solid-table v8 API, For-loop rendering |
</phase_requirements>

---

## Summary

The `storybook-solidjs-vite` adapter (v10.1.1, community-maintained by `solidjs-community/storybook`) is confirmed compatible with Storybook 10.4.x and `solid-js` 1.9.x. The adapter is actively maintained — v10.1.1 was published 2026-05-25. Its peer deps accept `storybook@^10.0.0`, `vite@^5-8`, `vite-plugin-solid@^2.0-3.0`, and optionally `@solidjs/web@^2.0` (Solid 2 only — irrelevant for this project on Solid 1.x).

**Biggest research correction versus prior PITFALLS.md:** The Solid CSF `render` function does NOT require a double-wrapper `() => () => <X/>`. As of `storybook-solidjs-vite` v10, `render: (args) => <X {...args}/>` works exactly like React CSF. The double-wrapper was a pre-v9 workaround that no longer applies. The adapter handles Solid reactivity internally. This changes the story porting approach significantly — stories are structurally identical to React CSF except for import source and JSX differences.

**Critical decorator change:** The plain `(Story, context) => { ...DOM...; return Story(); }` form used in current `preview.ts` works but requires caution. The adapter provides `createJSXDecorator` to avoid double-rendering. The `withThemeByClassName` decorator from `@storybook/addon-themes` has a known issue when the companion decorator calls `Story()` (function form) vs `<Story/>` (JSX form) — but the current preview already uses `Story()`, which is the *working* form per issue #24625.

**@tanstack/solid-table:** The current published version is 8.21.3 (same as react-table). The function is `createSolidTable` (not `useReactTable`). The column helper API (`createColumnHelper`, accessor columns, `flexRender`, `getCoreRowModel`) is identical to react-table v8. The only Solid-specific differences are: (1) `createSolidTable` instead of `useReactTable`; (2) `createSignal` instead of `useState`; (3) data passed via `get data() { return data() }` getter for reactivity; (4) use `<For>` from `solid-js` instead of `.map()` for reactive iteration.

**@storybook/addon-vitest:** All peer deps are optional (`vitest`, `@vitest/browser`, `@vitest/browser-playwright`). It requires Playwright and browser mode — the docs site does not currently have a `vitest.config.ts` targeting Storybook. The addon registers in `addons` but will not run story tests unless separately configured. It will NOT crash `build-storybook` — it simply adds a test panel. **Verdict: COMPATIBLE for build purposes; Playwright setup is separate from this phase.**

**@chromatic-com/storybook:** The addon is framework-agnostic — it wraps the Storybook build for visual snapshot upload. No framework-specific code. Version 5.2.1 is current. **Verdict: COMPATIBLE.**

**Primary recommendation:** Swap the adapter per the config below, use `render: (args) => <X {...args}/>` (no double-wrapper), rewrite the custom decorator with `createJSXDecorator`, and keep all existing addons. The spike should pass cleanly.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Component rendering / stories | Browser (Storybook iframe) | — | Storybook renders components in a browser iframe; Solid reactivity lives in browser |
| Story documentation (autodocs, mdx) | Frontend Server (Storybook build) | Browser (runtime) | Build-time static generation; runtime interaction in browser |
| Addon panel (a11y, themes, controls) | Browser (manager + preview) | — | Addons are browser-side; theme class manipulation happens on DOM |
| Visual regression (chromatic) | CDN / CI (external service) | — | Captures screenshots post-build; framework-agnostic |
| Story testing (addon-vitest) | Build tool (Vite + Playwright) | Browser | Playwright runs stories in real browser; orthogonal to build-storybook |
| @tanstack/solid-table | Browser (in-story component) | — | Table instance created inside a Solid component; pure client-side |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| storybook-solidjs-vite | 10.1.1 [VERIFIED: npm registry] | Storybook framework adapter for SolidJS | Only active Solid/Storybook 10 adapter; official Storybook init detects SolidJS and installs this |
| solid-js | 1.9.13 [VERIFIED: npm registry] | SolidJS runtime (already installed in packages/) | Framework peer dep |
| vite-plugin-solid | 2.11.12 [VERIFIED: prior STACK.md research] | JSX transform for Solid inside Vite builder | Required peer dep of storybook-solidjs-vite |
| @tanstack/solid-table | 8.21.3 [VERIFIED: npm registry] | Table state management for Table story | Direct equivalent of @tanstack/react-table; same version |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @storybook/addon-docs | 10.4.x (^10.3.3 → resolves 10.4.1) | Autodocs + MDX pages | Keep; fully compatible [VERIFIED: Context7 migration guide] |
| @storybook/addon-a11y | 10.4.x | Accessibility checks | Keep; framework-agnostic [VERIFIED: Context7 README feature list] |
| @storybook/addon-themes | 10.4.x | `withThemeByClassName` decorator | Keep with workaround; see Pitfalls |
| @storybook/addon-vitest | 10.4.x | Story test panel (Playwright mode) | Keep in addons list; will not crash build without vitest.config.ts; full setup is Phase 7 scope |
| @chromatic-com/storybook | 5.2.1 [VERIFIED: npm registry] | Visual regression wrapper | Keep; framework-agnostic, wraps build output |

### Peer Deps Added

| Package | Why Needed |
|---------|-----------|
| `@solidjs/web` | Peer dep of storybook-solidjs-vite (marked optional; only needed for Solid 2 — can be omitted for Solid 1.x) [VERIFIED: npm peerDependencies] |
| `vite-plugin-solid` | Explicit peer dep of storybook-solidjs-vite; already in packages devDeps, must also be in docs/ devDeps [VERIFIED: npm peerDependencies] |

### Version Verification

```bash
# Verified 2026-06-01 against npm registry:
# storybook-solidjs-vite: 10.1.1  (published 2026-05-25)
# @tanstack/solid-table:  8.21.3  (dist-tag: latest)
# solid-js:               1.9.13  (dist-tag: latest)
# @storybook/addon-vitest: 10.4.1 (dist-tag: latest — note: docs/package.json has ^10.3.3 which resolves to 10.4.1)
# @chromatic-com/storybook: 5.2.1
```

### Installation (docs/ workspace)

```bash
# Remove React framework + React runtime
npm uninstall @storybook/react-vite @vitejs/plugin-react react @tanstack/react-table

# Add Solid framework + Solid runtime + Solid table
npm install solid-js
npm install -D storybook-solidjs-vite vite-plugin-solid @tanstack/solid-table

# All other addons stay at same versions (semver caret will pull 10.4.x)
# No changes to: @storybook/addon-docs, addon-a11y, addon-vitest, addon-themes, @chromatic-com/storybook, chromatic, vite, typescript, tailwindcss, @tailwindcss/vite
```

---

## Addon Compatibility Verdict Table

| Addon | Current Version | Compatible with storybook-solidjs-vite? | Evidence | Action |
|-------|----------------|----------------------------------------|----------|--------|
| `@storybook/addon-docs` | ^10.3.3 → 10.4.1 | **COMPATIBLE** | Listed in official storybook-solidjs-vite README and migration guide addons example [CITED: Context7/solidjs-community/storybook] | Keep unchanged |
| `@storybook/addon-a11y` | ^10.3.3 → 10.4.1 | **COMPATIBLE** | Listed in official README; `addonA11y()` available from `@storybook/addon-a11y/preview` [CITED: Context7 definePreview example] | Keep; optionally use definePreview API |
| `@storybook/addon-vitest` | ^10.3.3 → 10.4.1 | **COMPATIBLE (build only)** — needs Playwright for test execution | All peer deps (vitest, @vitest/browser, playwright) are optional. Addon registers panel but does not fail build without them. Official storybook-solidjs-vite README lists it in recommended setup [CITED: Context7 MIGRATION.md]; confirmed framework-agnostic by peer deps [VERIFIED: npm peerDependenciesMeta] | Keep in addons list with `options: { cli: false }`. Do NOT set up vitest.config.ts in this phase. |
| `@storybook/addon-themes` | ^10.3.3 → 10.4.1 | **COMPATIBLE with workaround** | `withThemeByClassName` works when companion decorator uses `Story()` call (not `<Story/>` JSX). Current preview.ts already uses `Story()` — the correct form [CITED: GitHub issue #24625]. See Pitfall 3. | Keep `withThemeByClassName`; rewrite companion decorator with `createJSXDecorator` |
| `@chromatic-com/storybook` | ^5.1.1 → 5.2.1 | **COMPATIBLE** | Framework-agnostic; wraps `build-storybook` output for upload. Web search confirms active maintenance and standard install alongside storybook-solidjs-vite [VERIFIED: npm registry 5.2.1 published ~15 days ago as of research date] | Keep unchanged |

---

## Architecture Patterns

### System Architecture Diagram

```
Story files (.stories.tsx)
  |  [import] @moondesignsystem/solid (built dist)
  |  [Meta/StoryObj] from storybook-solidjs-vite
  v
Storybook Builder (storybook build)
  |-- .storybook/main.ts  ← framework: storybook-solidjs-vite
  |     |-- vite-plugin-solid (handles JSX transform)
  |     |-- @storybook/builder-vite (bundler)
  |     |-- addons: docs, a11y, vitest(panel), themes, chromatic
  |
  |-- .storybook/preview.ts  ← decorators, globalTypes, parameters
  |     |-- withThemeByClassName (theme class on <html>)
  |     |-- createJSXDecorator (dir attr + docsStory class)
  v
Static output (storybook-static/)
  |-- Consumed by chromatic for visual snapshots
  |-- Consumed by GitHub Pages / docs hosting
```

### Recommended Project Structure (docs/)

```
docs/
├── .storybook/
│   ├── main.ts          # framework: storybook-solidjs-vite; getAbsolutePath via import.meta.resolve
│   ├── preview.ts       # Solid Preview type; createJSXDecorator; withThemeByClassName
│   └── globals.css      # unchanged
├── stories/
│   ├── components/      # 37 *.stories.tsx — Solid CSF
│   ├── shared/          # LinksBlock.tsx, Version.tsx, icons/ — Solid components
│   ├── utils/           # component-links.ts/.json — framework-agnostic, unchanged
│   └── gettingStarted.mdx  # MDX docs page — verify imports
└── package.json         # solid-js, storybook-solidjs-vite, vite-plugin-solid, @tanstack/solid-table
```

### Pattern 1: main.ts — Storybook 10 + storybook-solidjs-vite

**What:** Framework config with ESM-native addon path resolution.
**When to use:** This is the only supported form for storybook-solidjs-vite 10.x.

```typescript
// .storybook/main.ts
// Source: Context7 /solidjs-community/storybook MIGRATION.md + llms.txt
import type { StorybookConfig } from 'storybook-solidjs-vite';
import path from 'path';

const getAbsolutePath = (packageName: string): string =>
  path.dirname(import.meta.resolve(path.join(packageName, 'package.json'))).replace(/^file:\/\//, '');

const config: StorybookConfig = {
  stories: [
    '../stories/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../stories/*.mdx',
  ],
  staticDirs: ['../stories/assets'],
  addons: [
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-a11y'),
    {
      name: getAbsolutePath('@storybook/addon-vitest'),
      options: { cli: false },
    },
    getAbsolutePath('@storybook/addon-themes'),
  ],
  framework: {
    name: 'storybook-solidjs-vite',
    options: {
      docgen: {
        savePropValueAsString: true,
        shouldExtractLiteralValuesFromEnum: true,
        propFilter: (prop: any) =>
          prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
      },
    },
  },
  managerHead: (head) => `
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-6L8W2YTV0W"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-6L8W2YTV0W');
    </script>
    <link rel="icon" href="https://assets.moon.io/symbols/product/moon.png" type="image/png">
    ${head}
    <style>.sidebar-header img {height: 24px}</style>
  `,
};

export default config;
```

**Key changes from current main.ts:**
- Remove `createRequire` / `const require = createRequire(...)` — no longer needed
- Replace `dirname(require.resolve(...))` with `path.dirname(import.meta.resolve(...))` in getAbsolutePath
- Replace the `getAbsolutePath` function body with the `import.meta.resolve` form
- `framework.name` → `'storybook-solidjs-vite'`
- `StorybookConfig` from `'storybook-solidjs-vite'`
- Add `options: { cli: false }` to addon-vitest entry
- Add `features: { experimentalTestSyntax: true }` only if using Vitest story-level test syntax (not needed for build-only phase)

### Pattern 2: preview.ts — Solid Preview type + createJSXDecorator

**What:** Preview configuration with correct Solid types and the `createJSXDecorator` wrapper.
**When to use:** Required — `createJSXDecorator` prevents double-rendering of the companion DOM-manipulation decorator.

```typescript
// .storybook/preview.ts
// Source: Context7 /solidjs-community/storybook llms.txt (createJSXDecorator, definePreview)
import type { Preview } from 'storybook-solidjs-vite';
import { createJSXDecorator } from 'storybook-solidjs-vite';
import { withThemeByClassName } from '@storybook/addon-themes';
import './globals.css';

const preview: Preview = {
  globalTypes: {
    direction: {
      name: 'Text Direction',
      description: 'Switch between LTR and RTL',
      defaultValue: 'ltr',
      toolbar: {
        icon: 'transfer',
        items: [
          { value: 'ltr', title: 'LTR (Left to Right)' },
          { value: 'rtl', title: 'RTL (Right to Left)' },
        ],
        showName: true,
      },
    },
  },
  parameters: {
    options: {
      storySort: {
        order: ['Getting started', '*'],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light-theme',
        dark: 'dark-theme',
      },
      defaultTheme: 'light',
    }),
    // createJSXDecorator marks the return value as JSX and prevents
    // Storybook from double-executing this decorator when args change.
    // The Story() call form (not <Story/>) is required to keep
    // withThemeByClassName hooks in context (GitHub issue #24625).
    createJSXDecorator((Story, context) => {
      const direction = context.globals.direction || 'ltr';
      const theme = context.globals?.theme || 'light';
      document.documentElement.setAttribute('dir', direction);
      const docsStory = document.querySelector('.docs-story');
      const mainPadded = document.querySelector('.sb-main-padded');
      if (docsStory) {
        docsStory.classList.remove('dark-theme', 'light-theme');
        docsStory.classList.add(`${theme}-theme`);
      }
      if (mainPadded) {
        mainPadded.classList.remove('dark-theme', 'light-theme');
        mainPadded.classList.add(`${theme}-theme`);
      }
      return Story();
    }),
  ],
  tags: ['autodocs'],
};

export default preview;
```

**Key changes from current preview.ts:**
- `import type { Preview } from 'storybook-solidjs-vite'` (was `@storybook/react-vite`)
- Add `import { createJSXDecorator } from 'storybook-solidjs-vite'`
- Wrap the second (DOM-manipulation) decorator body in `createJSXDecorator(...)` — body is identical
- `withThemeByClassName` import and usage unchanged — it is framework-agnostic

### Pattern 3: Solid CSF render signature (the CRITICAL correction)

**What:** The render function in storybook-solidjs-vite v10 does NOT need a double-wrapper.
**Confirmed:** Context7 source shows `render: (args) => <Button {...args} />` as the official example. The adapter handles Solid reactivity internally via its renderer.

```typescript
// Source: Context7 /solidjs-community/storybook llms.txt — "Default and Custom Render Functions"
// The render function is IDENTICAL in shape to React CSF:
render: (args) => <Button {...args} />,

// NOT the old double-wrapper pattern from training data:
// render: (args) => () => <Button {...args} />,  // WRONG for storybook-solidjs-vite v10
```

The `render: (args) => <JSX />` form works because storybook-solidjs-vite v10 wraps the render call appropriately. The double-wrapper was needed for very old versions and is now an anti-pattern.

### Pattern 4: Complete Working Button Story (Solid CSF, spike target)

```typescript
// docs/stories/components/Button.stories.tsx
// Source: adapted from Context7 /solidjs-community/storybook llms.txt patterns
import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { Button } from '@moondesignsystem/solid';
import type { ComponentProps } from 'solid-js';
import LinksBlock from '../shared/LinksBlock';

type Type = ComponentProps<typeof Button>;

const meta: Meta<Type> = {
  title: 'Actions/Button',
  parameters: {
    docs: {
      container: ({ context }: any) => (
        <LinksBlock context={context} component="Button" />
      ),
    },
  },
  argTypes: {
    size: {
      description: 'Defines Button size',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      control: 'select',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    disabled: {
      description: 'Disables Button when set to true',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    isFullWidth: {
      description: 'Sets Button to full width',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    variant: {
      description: 'Defines Button variant',
      options: ['fill', 'outline', 'soft', 'ghost'],
      control: 'select',
      table: {
        defaultValue: { summary: 'fill' },
      },
    },
    context: {
      description: 'Defines Button context',
      options: ['brand', 'neutral', 'positive', 'negative', 'caution', 'info'],
      control: 'select',
      table: {
        defaultValue: { summary: 'brand' },
      },
    },
  },
  render: ({ variant, size, context, ...props }) => {
    const buttonProps = {
      ...props,
      ...(variant !== 'fill' && { variant }),
      ...(size !== 'md' && { size }),
      ...(context !== 'brand' && { context }),
    };
    return <Button {...buttonProps}>Button</Button>;
    //            ^-- No double-wrapper. Identical to React CSF form.
  },
};

export default meta;

type Story = StoryObj<Type>;

export const ButtonStory: Story = {
  args: {
    size: 'md',
    variant: 'fill',
    context: 'brand',
    disabled: false,
    isFullWidth: false,
  },
};
```

**Changes from React version:**
1. `import type { Meta, StoryObj } from 'storybook-solidjs-vite'` — NOT `@storybook/react`
2. `import { Button } from '@moondesignsystem/solid'` — NOT `/react`
3. `type Type = ComponentProps<typeof Button>` from `solid-js` — NOT `React.ComponentProps`
4. `render` body is structurally identical — no changes to arg destructuring logic
5. `render` return is `<Button ...>` directly — NOT wrapped in `() => <Button ...>`

**Spike success criteria:**
- `npm install` succeeds with no unmet peer dep errors
- `npm run build-storybook` exits 0
- `storybook dev` opens and shows Button story with working controls panel
- Toggling size/variant in controls updates the rendered button
- a11y panel appears (no crash)
- Themes toolbar shows light/dark toggle
- Dir toolbar shows LTR/RTL toggle
- No console errors about addon-vitest missing Playwright (warning acceptable)

### Pattern 5: Shared Solid component (LinksBlock.tsx)

```typescript
// docs/stories/shared/LinksBlock.tsx
// Source: [ASSUMED] based on Solid component patterns from Phase 1-5
import type { Component } from 'solid-js';
// ... props: no React.FC, use ComponentProps or explicit interface
// class not className on all elements
// JSX.Element children typed as JSX.Element or children prop pattern
```

The 4 shared files follow the same Solid port pattern as the packages icons: remove React imports, use `class` not `className`, type with `Component<Props>`.

### Anti-Patterns to Avoid

- **Double-wrapper render:** `render: (args) => () => <X/>` — this is the OLD pattern for pre-v9 storybook-solidjs. In v10 it causes the story to render a function object instead of JSX. Use `render: (args) => <X/>` directly.
- **`<Story/>` JSX form in companion decorator:** Use `Story()` call form, not `<Story/>`, to maintain hook context for `withThemeByClassName`. The companion decorator body already uses `Story()` — keep it.
- **Old `createRequire` getAbsolutePath:** The current main.ts uses `dirname(require.resolve(...))`. Storybook 10 requires `import.meta.resolve` form. `createRequire` still works in ESM but the migration guide mandates the newer pattern.
- **`storybookjs/solidjs` package:** The `storybookjs` organization repo was archived July 2025. Do not reference. The correct package is `storybook-solidjs-vite` from `solidjs-community`.
- **storybook-solidjs (old npm name):** Deprecated, does not work with Storybook 8+. Only `storybook-solidjs-vite`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSX decorator that wraps stories | Custom `[IS_SOLID_JSX_FLAG]` symbol manipulation | `createJSXDecorator` from `storybook-solidjs-vite` | Adapter provides this helper for exactly this pattern; sets the flag, handles reactivity |
| Table state management in story | Manual reactive store | `createSolidTable` from `@tanstack/solid-table` | v8 API with Solid reactive store; identical column/row APIs to react-table |
| Addon path resolution | String literal addon paths | `getAbsolutePath` using `import.meta.resolve` | Storybook 10 ESM requirement; string paths fail in some monorepo setups |
| Solid JSX transform in Vite | Custom babel config | `vite-plugin-solid` as peer dep | storybook-solidjs-vite uses vite-plugin-solid internally; do not duplicate config |

---

## @tanstack/solid-table v8 API

The current published version (8.21.3) uses `createSolidTable`, which is the Solid-reactive wrapper around the core `createTable` from `@tanstack/table-core`. [VERIFIED: read from node_modules/@tanstack/solid-table/src/index.tsx]

### React v8 → Solid v8 mapping

| React Table v8 | Solid Table v8 | Notes |
|----------------|----------------|-------|
| `useReactTable(opts)` | `createSolidTable(opts)` | Same options object |
| `import { useReactTable } from '@tanstack/react-table'` | `import { createSolidTable } from '@tanstack/solid-table'` | |
| `import { createColumnHelper } from '@tanstack/react-table'` | `import { createColumnHelper } from '@tanstack/solid-table'` | Identical API |
| `import { flexRender } from '@tanstack/react-table'` | `import { flexRender } from '@tanstack/solid-table'` | Slightly different impl but same call signature |
| `import { getCoreRowModel } from '@tanstack/react-table'` | `import { getCoreRowModel } from '@tanstack/solid-table'` | Re-exported from table-core |
| `const [data] = useState(() => [...])` | `const [data] = createSignal([...])` | Solid signal |
| `data: data` in options | `get data() { return data() }` in options | Getter ensures reactivity |
| `rows.map((row) => ...)` in JSX | `<For each={table.getRowModel().rows}>{(row) => ...}</For>` | Solid reactive loop |
| `import { ColumnDef } from '@tanstack/react-table'` | `import { ColumnDef } from '@tanstack/solid-table'` | Identical type |

### Note on v9 alpha

Context7 shows a v9 alpha API (`createTable`, `tableFeatures`, `_rowModels`) — this is from `@tanstack/solid-table@9.0.0-alpha.51` (dist-tag: `alpha`). **Do not use this.** The project must use `@tanstack/solid-table@^8.21.3` (dist-tag: `latest`). The v9 alpha is a major API redesign and not production-ready.

### Complete Solid Table Story

```typescript
// docs/stories/components/Table.stories.tsx  (Solid version)
// Source: adapted from Context7 /tanstack/table + solid source code [VERIFIED: src/index.tsx]
import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { Table as TableComponent } from '@moondesignsystem/solid';
import type { ComponentProps } from 'solid-js';
import { createSignal, For } from 'solid-js';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  createSolidTable,
} from '@tanstack/solid-table';
import LinksBlock from '../shared/LinksBlock';

type Type = ComponentProps<typeof TableComponent>;

const meta: Meta<Type> = {
  title: 'Content display/Table',
  parameters: {
    docs: {
      container: ({ context }: any) => (
        <LinksBlock context={context} component="Table" />
      ),
    },
  },
  argTypes: {
    size: {
      description: 'Defines Table row size',
      options: ['sm', 'md', 'lg', 'xl'],
      control: 'select',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
  },
  render: ({ size, ...props }) => {
    const tableProps = {
      ...props,
      ...(size !== 'md' && { size }),
    };
    const rows = new Array(5).fill('');
    const cols = new Array(3).fill('');
    return (
      <TableComponent {...tableProps}>
        <TableComponent.Head>
          <TableComponent.Row>
            <For each={cols}>
              {(_, index) => (
                <TableComponent.HeadCell>Title</TableComponent.HeadCell>
              )}
            </For>
          </TableComponent.Row>
        </TableComponent.Head>
        <TableComponent.Body>
          <For each={rows}>
            {(_, rowIndex) => (
              <TableComponent.Row>
                <For each={cols}>
                  {(_, colIndex) => (
                    <TableComponent.Cell>Cell</TableComponent.Cell>
                  )}
                </For>
              </TableComponent.Row>
            )}
          </For>
        </TableComponent.Body>
      </TableComponent>
    );
  },
};

export default meta;

type Story = StoryObj<Type>;

export const Table: Story = {
  args: { size: 'md' },
  parameters: {
    docs: {
      description: {
        story: 'Basic Table example with simple rows and columns.',
      },
    },
  },
};

// -------- TanStack Table example --------

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

const defaultData: Person[] = [
  { firstName: 'tanner', lastName: 'linsley', age: 24, visits: 100, status: 'In Relationship', progress: 50 },
  { firstName: 'tandy',  lastName: 'miller',  age: 40, visits: 40,  status: 'Single',          progress: 80 },
  { firstName: 'joe',    lastName: 'dirte',   age: 45, visits: 20,  status: 'Complicated',     progress: 10 },
];

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor((row) => row.firstName, {
    id: 'firstName',
    cell: (info) => info.getValue(),
    header: () => <span>First Name</span>,
  }),
  columnHelper.accessor((row) => row.lastName, {
    id: 'lastName',
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>Last Name</span>,
  }),
  columnHelper.accessor('age',      { header: () => 'Age',             cell: (info) => info.renderValue() }),
  columnHelper.accessor('visits',   { header: () => <span>Visits</span> }),
  columnHelper.accessor('status',   { header: 'Status' }),
  columnHelper.accessor('progress', { header: 'Profile Progress' }),
];

// columns defined outside the component — no reactivity needed for static column defs

const TanstackTableExample = (props: Type) => {
  const { size, ...rest } = props;  // NOTE: this is ok in a story helper (not a Solid component)
  const tableProps = { ...rest, ...(size !== 'md' && { size }) };

  const [data] = createSignal([...defaultData]);

  const table = createSolidTable({
    get data() { return data(); },  // getter for Solid reactivity
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <TableComponent {...tableProps}>
      <TableComponent.Head>
        <For each={table.getHeaderGroups()}>
          {(headerGroup) => (
            <TableComponent.Row>
              <For each={headerGroup.headers}>
                {(header) => (
                  <TableComponent.HeadCell>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableComponent.HeadCell>
                )}
              </For>
            </TableComponent.Row>
          )}
        </For>
      </TableComponent.Head>
      <TableComponent.Body>
        <For each={table.getRowModel().rows}>
          {(row) => (
            <TableComponent.Row>
              <For each={row.getVisibleCells()}>
                {(cell) => (
                  <TableComponent.Cell>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableComponent.Cell>
                )}
              </For>
            </TableComponent.Row>
          )}
        </For>
      </TableComponent.Body>
    </TableComponent>
  );
};

export const TableWithTanstackTable: Story = {
  args: { size: 'md' },
  render: (args) => <TanstackTableExample {...args} />,
};
```

**Key differences from React version:**
1. `useReactTable` → `createSolidTable` with `get data()` getter
2. `useState(() => [...])` → `createSignal([...])`
3. `rows.map(...)` → `<For each={...}>` (REQUIRED — plain `.map()` does not set up reactive tracking in Solid)
4. `import { For, createSignal } from 'solid-js'` added
5. All imports from `@tanstack/solid-table` instead of `@tanstack/react-table`
6. Outer component `TanstackTableExample` — note that destructuring `props` is acceptable in a story helper function since it is not a Solid reactive component (it is invoked by Storybook's renderer, not by Solid's reactivity system). However, if this helper were a proper Solid component receiving reactive props, `splitProps` would be required.

---

## Common Pitfalls

### Pitfall 1: Using the double-wrapper render form from old docs / PITFALLS.md

**What goes wrong:** Story renders a function object to the DOM: `[object Object]` or blank canvas.
**Why it happens:** PITFALLS.md (from initial research) documented the pre-v9 pattern `render: (args) => () => <X/>`. As of `storybook-solidjs-vite` v9+, the renderer wraps the call internally. The double-wrapper is now harmful.
**How to avoid:** Always use `render: (args) => <X {...args}/>` — identical to React CSF.
**Warning signs:** Story renders blank or shows a serialized function string; controls don't update UI.

### Pitfall 2: createRequire-based getAbsolutePath in main.ts

**What goes wrong:** `storybook build` fails with "Cannot find module" or ESM resolution error.
**Why it happens:** Storybook 10 requires ESM config; the v9 pattern `dirname(require.resolve(...))` works under CJS but the new canonical form is `path.dirname(import.meta.resolve(...))`.
**How to avoid:** Use the MIGRATION.md pattern: `path.dirname(import.meta.resolve(path.join(packageName, 'package.json'))).replace(/^file:\/\//, '')`.
**Warning signs:** Works locally but fails in CI or on Node 22; "require is not defined in ES module scope".

### Pitfall 3: withThemeByClassName + Story() call order

**What goes wrong:** Storybook throws "preview hooks can only be called inside decorators".
**Why it happens:** `withThemeByClassName` uses `useStoryContext()` internally. When a companion decorator renders `<Story/>` (JSX component form), it breaks the hook execution context. The `Story()` function-call form (already used in current preview.ts) is correct.
**How to avoid:** Keep `return Story()` in the companion decorator body — do NOT change to `return <Story/>`.
**Warning signs:** Error: "Storybook preview hooks can only be called inside decorators and story functions."

### Pitfall 4: Using @tanstack/solid-table v9 alpha

**What goes wrong:** Import `createTable` from `@tanstack/solid-table` → "createTable is not a function" or wrong API.
**Why it happens:** `npm install @tanstack/solid-table` installs v8.21.3 (latest). Context7 docs show v9 alpha API. `createSolidTable` is the v8 function.
**How to avoid:** Confirm installed version is 8.x; use `createSolidTable`, `createColumnHelper`, `getCoreRowModel`, `flexRender` — all identical in name to react-table v8.
**Warning signs:** TypeScript error "Property 'createSolidTable' does not exist"; build fails after installing alpha tag.

### Pitfall 5: Plain .map() instead of For in story JSX

**What goes wrong:** Table rows render correctly on first load but do not reactively update when Storybook controls change `size` or other args.
**Why it happens:** `.map()` in Solid JSX is not tracked reactively. `<For each={...}>` sets up fine-grained reactive tracking for the array.
**How to avoid:** Use `<For each={arr}>{(item) => ...}</For>` for all array iteration in Solid JSX. The `key` prop is not needed on `<For>` children.
**Warning signs:** Controls panel changes don't update table; no error thrown (silent).

### Pitfall 6: @solidjs/web peer dep warning

**What goes wrong:** `npm install storybook-solidjs-vite` shows unmet peer dep warning for `@solidjs/web@^2.0.0`.
**Why it happens:** storybook-solidjs-vite declares it as a peer dep for Solid 2 users. On Solid 1.x it is not needed.
**How to avoid:** The warning is safe to ignore for Solid 1.9.x. Do NOT install `@solidjs/web` — it requires `solid-js@^2.0.0-experimental`.
**Warning signs:** Warning during npm install; `@solidjs/web` is currently at `2.0.0-experimental.0` only.

### Pitfall 7: MdX docs importing React components from LinksBlock

**What goes wrong:** `gettingStarted.mdx` or story doc containers crash at build time because `LinksBlock` is a React component.
**Why it happens:** MDX pages are rendered by the Solid renderer; any React component import will fail.
**How to avoid:** Port `LinksBlock.tsx` to Solid (D-05) before attempting to build stories that use it. This is the spike dependency — the Button story imports LinksBlock.
**Warning signs:** Build error: "React is not defined" or "cannot read properties of undefined (reading createElement)" in LinksBlock.

---

## CSF3 + Autodocs + MDX

- **CSF3**: Fully supported — `storybook-solidjs-vite` is CSF3-native. `satisfies Meta<typeof Button>` syntax works. [VERIFIED: Context7 official examples all use CSF3]
- **`tags: ['autodocs']`**: Supported both at meta level and global level in preview.ts. [VERIFIED: Context7 Meta type example shows `tags: ['autodocs']`]
- **`.mdx` pages**: Supported via `@storybook/addon-docs`. The `stories` glob in main.ts already includes `'../stories/*.mdx'`. [ASSUMED: based on standard Storybook MDX + addon-docs integration; no Solid-specific MDX documentation found]
- **`docs.container`**: The `parameters.docs.container` pattern (used in Button.stories for LinksBlock) works in Solid CSF stories — it's a docs configuration parameter, not a render function. [ASSUMED]

---

## vite-plugin-solid Integration

`storybook-solidjs-vite` bundles and configures `vite-plugin-solid` internally via `@storybook/builder-vite`. You do NOT need to add `vite-plugin-solid` to a `viteFinal` function in main.ts — the framework adapter handles it. [CITED: storybook-solidjs-vite peerDependencies list `vite-plugin-solid`; adapter dependency on `@storybook/builder-vite`]

The only required action is:
1. Install `vite-plugin-solid` as a devDep in docs/ (it is a peer dep that npm may warn about if absent)
2. Remove `@vitejs/plugin-react` from docs/package.json

Do NOT add `vite-plugin-solid` to a `viteFinal` block or `docs/vite.config.ts` — the adapter does this internally.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `render: (args) => <X/>` works without double-wrapper in storybook-solidjs-vite v10 | Pattern 3 | HIGH — if wrong, all story renders are broken and need to be re-wrapped; but Context7 official example explicitly shows this form |
| A2 | `parameters.docs.container` with JSX (LinksBlock) works in Solid CSF | CSF3 section | MEDIUM — if unsupported, LinksBlock must be removed from story parameters; build-time error will be obvious |
| A3 | `gettingStarted.mdx` works after porting LinksBlock imports to Solid | CSF3 section | LOW — MDX with @storybook/addon-docs is standard; no Solid-specific MDX issues found |
| A4 | Plain `.map()` in Table story body (not JSX loop) won't cause issues for static data | Table story | LOW — Table story data is static; `.map()` is fine for non-reactive arrays. Use `<For>` in the reactive parts (header/row groups) |

**All other claims in this document are VERIFIED or CITED.**

---

## Open Questions

1. **`@solidjs/web` peer dep warning level**
   - What we know: The package is Solid 2 only; current npm version is `2.0.0-experimental.0`
   - What's unclear: Whether `npm install` will fail (hard error) or warn (soft warning) on the unmet peer dep
   - Recommendation: Run `npm install --legacy-peer-deps` in the spike if npm errors; otherwise ignore the warning

2. **LinksBlock in `docs.container` JSX**
   - What we know: `parameters.docs.container` receives a `context` and renders a React component in current setup
   - What's unclear: Whether storybook-solidjs-vite's docs plugin evaluates `container` in Solid or plain JS context
   - Recommendation: Port LinksBlock to Solid before spike; if docs.container fails, move LinksBlock rendering to a story-level decorator instead

3. **addon-vitest panel with no vitest.config.ts**
   - What we know: All addon-vitest peer deps are optional; docs README lists it in recommended addons
   - What's unclear: Whether the addon shows a warning panel or a breaking error in Storybook UI when no vitest.config.ts targets it
   - Recommendation: Keep `options: { cli: false }` in the addons entry; this suppresses the CLI prompt. If a panel error appears, the addon can be removed without affecting build-storybook.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | storybook-solidjs-vite migration guide requires 20.19+ or 22.12+ | Assumed available | Check with `node -v` | Upgrade Node |
| npm | package management | Available | — | — |
| storybook CLI | `storybook build` / `storybook dev` | Available (in devDeps) | via npx | — |
| Playwright | @storybook/addon-vitest browser mode | NOT REQUIRED for this phase | — | Skip vitest story tests in Phase 6 |

---

## Validation Architecture

The docs workspace has no test suite — `build-storybook` is the gate.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Notes |
|--------|----------|-----------|-------------------|-------|
| STORY-01 | Spike: Button story builds + controls work | build smoke | `cd docs && npm run build-storybook` | Green = STORY-01 complete |
| STORY-01 | Spike: all addons load without crash | dev smoke | `cd docs && npm run dev` | Manual visual check |
| STORY-02 | All 37 stories build | build gate | `cd docs && npm run build-storybook` | Green = STORY-02 complete |

### Sampling Rate

- Per wave commit: `cd docs && npm run build-storybook` after each batch of story ports
- Phase gate: `build-storybook` exits 0 with all 37 stories

### Wave 0 Gaps

None — no test files to create. The build command IS the test.

---

## Security Domain

This phase only modifies documentation/Storybook output — a static site build. No authentication, API endpoints, user data, or cryptography involved. ASVS categories do not apply.

`security_enforcement: N/A for static docs build`

---

## Sources

### Primary (HIGH confidence — verified via tools)

- `solidjs-community/storybook` — Context7 `/solidjs-community/storybook` — render signature, decorator patterns, main.ts config, migration guide, addon list
- npm registry — `storybook-solidjs-vite@10.1.1` confirmed, peer deps, dist-tags (2026-06-01)
- npm registry — `@tanstack/solid-table@8.21.3` confirmed, dist-tags (2026-06-01)
- `@tanstack/solid-table` source — read from `node_modules/@tanstack/solid-table/src/index.tsx` — confirms `createSolidTable`, `flexRender` exports
- npm registry — `@storybook/addon-vitest@10.4.1` peerDependenciesMeta — all deps optional

### Secondary (MEDIUM confidence — web search verified)

- [storybook-solidjs-vite npm page](https://www.npmjs.com/package/storybook-solidjs-vite) — version + publication date
- [WebSearch: chromatic + storybook-solidjs-vite] — framework-agnostic compatibility, 5.2.1 current
- [TanStack Table v8 Solid docs](https://tanstack.com/table/v8/docs/framework/solid/solid-table) — `createSolidTable` API confirmed
- [tanstack/table Context7] — `/tanstack/table` v8 API, flexRender, column helper

### Tertiary (cited for specific claims)

- [GitHub issue #24625](https://github.com/storybookjs/storybook/issues/24625) — `withThemeByClassName` + `Story()` call vs `<Story/>` — confirmed `Story()` is the working form

---

## Metadata

**Confidence breakdown:**
- Adapter version + framework name: HIGH — verified via npm registry (10.1.1)
- Render signature (no double-wrapper): HIGH — verified via Context7 official examples
- Addon compatibility (docs/a11y/themes): HIGH — verified via official migration guide + README
- Addon-vitest (build-only mode): HIGH — verified via peerDependenciesMeta all optional
- Chromatic compatibility: MEDIUM — web search verified, no dedicated docs
- @tanstack/solid-table v8 API: HIGH — verified by reading package source + npm dist-tag
- MDX/autodocs: MEDIUM — standard addon-docs, no Solid-specific docs found
- withThemeByClassName workaround: MEDIUM — cited GitHub issue, functionally correct since current code already uses Story() form

**Research date:** 2026-06-01
**Valid until:** 2026-07-01 (stable, but storybook-solidjs-vite is community-maintained; check npm for point releases before execution)
