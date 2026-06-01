# Stack Research

**Domain:** SolidJS component library / design system — npm package authoring
**Researched:** 2026-05-31
**Confidence:** HIGH (core toolchain), MEDIUM (Storybook compat), LOW (tsdown for Solid)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| solid-js | ^1.9.13 | UI framework runtime + JSX types | Stable LTS-like track; 2.0-experimental exists but is not production-ready. 1.9.x is the ecosystem target. |
| vite-plugin-solid | ^2.11.12 | JSX compilation (babel-preset-solid), HMR, Vitest transform | Only official Solid JSX transform for Vite. Required because Solid JSX is incompatible with TypeScript's own JSX transform. |
| TypeScript | ^5.9.3 | Type checking | Keep existing version; no upgrade needed. |

### Build Tool — Recommended: vite build --lib + vite-plugin-solid

**Use `vite build --lib` with `vite-plugin-solid` for the library build.** This is the pattern with the most adoption and the fewest gaps. The alternatives are assessed below.

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vite | ^7.3.1 | Library bundler (lib mode) | Keep existing; `docs/` already uses it. Use same major for lib package. |
| vite-plugin-solid | ^2.11.12 | Solid JSX transform for both build and test | Single plugin handles compile, HMR, and Vitest transform. |
| vitest | ^4.1.7 | Test runner | Native Vite integration; replaces Jest + ts-jest with zero config. |
| @solidjs/testing-library | ^0.8.10 | Component render + query utilities for tests | The official Solid port of Testing Library. render() takes a function `() => <Component />`. |
| @testing-library/user-event | ^14.6.1 | User interaction simulation | Framework-agnostic; keep existing version, compatible with Solid testing lib. |
| @testing-library/jest-dom | ^6.9.1 | DOM assertion matchers (toBeInTheDocument etc.) | Framework-agnostic; import from `@testing-library/jest-dom/vitest` in setup file. |
| jsdom | ^26.x | Browser environment for Vitest | Standard jsdom environment, same as Jest; specify `environment: 'jsdom'` in vitest config. |
| storybook-solidjs-vite | ^10.1.1 | Storybook framework adapter for SolidJS | Community-maintained (solidjs-community/storybook); v10.1.1 aligns with Storybook 10 major. The storybookjs/solidjs repo was archived July 2025 — do NOT use `storybook-solidjs` (old). |
| eslint-plugin-solid | ~0.14.5 | Solid-specific lint rules | Only community-maintained Solid ESLint plugin; supports ESLint 9 flat config via `plugin.configs['flat/typescript']`. Pin tilde (~) not caret (^) — pre-1.0, minor versions may be breaking. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| @typescript-eslint/parser | TypeScript-aware ESLint parsing | Required by eslint-plugin-solid typescript config |
| typescript-eslint | ESLint 9 TypeScript integration | Use with flat config; replaces old `@typescript-eslint/eslint-plugin` |
| barrelsby | Barrel file generation | Keep existing; framework-agnostic, no changes needed |
| @changesets/cli | Versioning and CHANGELOG | Keep existing; no changes needed |

---

## Installation

```bash
# In packages/ workspace

# Remove React toolchain
npm uninstall react react-dom @types/react @types/react-dom \
  @testing-library/react eslint-plugin-react-hooks eslint-plugin-react-refresh

# Add Solid runtime (peer dep + types bundled in solid-js itself)
npm install solid-js

# Build + test toolchain (devDependencies)
npm install -D vite vite-plugin-solid vitest jsdom \
  @solidjs/testing-library @testing-library/user-event \
  @testing-library/jest-dom \
  eslint-plugin-solid @typescript-eslint/parser

# Storybook (in docs/ workspace)
npm install -D storybook-solidjs-vite
# Remove old storybook React integration
npm uninstall @storybook/react-vite
```

---

## tsconfig Settings

The most critical change from the React build. Solid's JSX transform is handled by `babel-preset-solid` inside `vite-plugin-solid`, not by TypeScript. TypeScript must be told to leave JSX alone.

```jsonc
// packages/tsconfig.json
{
  "compilerOptions": {
    "jsx": "preserve",              // Do NOT use "react-jsx" — Solid needs preserve
    "jsxImportSource": "solid-js", // Provides JSX types from solid-js (not react)
    "module": "ESNext",
    "moduleResolution": "bundler", // Works with Vite's resolution strategy
    "target": "ESNext",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist"
  }
}
```

**Why `jsx: preserve`:** TypeScript's `react-jsx` mode compiles JSX to `React.createElement` calls. Solid's reactive system requires JSX to be compiled by `babel-preset-solid` (which produces DOM expressions + effect registrations). If TypeScript transforms JSX first, Solid's compiler never sees it. `preserve` passes JSX through to Vite/Babel untouched.

---

## vite.config.ts for Library Build

```typescript
// packages/vite.config.ts
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es'],           // ESM-only; consumers use bundlers
      fileName: 'index',
    },
    rollupOptions: {
      external: ['solid-js', 'solid-js/web', 'solid-js/store'], // peer deps, never bundle
      output: {
        preserveModules: true,   // tree-shakeable: one file per source module
        preserveModulesRoot: 'src',
        entryFileNames: '[name].jsx', // .jsx extension preserves Solid JSX for consumers
      },
    },
  },
})
```

**Why `preserveModules: true`:** Produces one output file per input file (vs a single bundle). This is critical for tree shaking — consumers who import only `Button` don't pull in `Dialog`. The existing React build relied on `tsc` for this; Vite lib mode achieves the same.

**Why `.jsx` output extension:** The `solid` export condition (see package.json section below) points to `.jsx` files. These contain compiled-but-JSX-preserved output that consuming app bundlers (also running `vite-plugin-solid`) will process. This is how Solid's reactivity compiles correctly in context.

---

## package.json Exports (lib package)

The `solid` export condition is mandatory for SolidStart and other Solid bundler pipelines to resolve the correct build. Without it, consumers that run `vite-plugin-solid` may get the wrong build.

```jsonc
{
  "name": "@moondesignsystem/solid",
  "version": "3.0.0",
  "type": "module",
  "files": ["dist"],
  "exports": {
    ".": {
      "solid": "./dist/index.jsx",   // Solid bundlers use this — JSX-preserved build
      "import": "./dist/index.js",   // Standard ESM consumers use this
      "types": "./dist/index.d.ts"
    }
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "peerDependencies": {
    "solid-js": "^1.8.0"
  }
}
```

**Why two conditions:** The `solid` condition gives SolidStart/vite-plugin-solid the JSX file so it can run `babel-preset-solid` in the consumer's bundler context. The `import` condition gives regular Node/non-Solid bundlers the pre-compiled JS. This mirrors the pattern used by `solid-router` and `solid-meta` in the official ecosystem.

---

## vitest.config.ts

```typescript
// packages/vitest.config.ts
import { defineConfig } from 'vitest/config'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solidPlugin({ hot: false })],  // hot: false required in test context
  test: {
    environment: 'jsdom',
    globals: true,
    transformMode: {
      web: [/\.[jt]sx?$/],  // all JSX/TSX via Vite pipeline (not esbuild default)
    },
    setupFiles: ['./src/tests/setupTests.ts'],
  },
  resolve: {
    conditions: ['development', 'browser'],  // CRITICAL: force browser builds
  },
  // Required after vite-plugin-solid 2.11.9+ to prevent server-build resolution in jsdom
  // See: https://hy2k.dev/en/blog/2025/10-17-vitest-solid-browser-conditions/
  ssr: {
    resolve: {
      conditions: ['browser'],
    },
  },
})
```

**The `resolve.conditions` + `ssr.resolve.conditions` fix is non-negotiable** as of vite-plugin-solid 2.11.9+. Without it, tests fail with "Client-only API called on the server side" because Vitest's SSR pipeline resolves Solid's server builds instead of browser builds when running under jsdom.

**setupTests.ts** should contain:
```typescript
import '@testing-library/jest-dom/vitest'
```

---

## ESLint Configuration (flat config, ESLint 9)

```typescript
// eslint.config.ts (packages/)
import js from '@eslint/js'
import solid from 'eslint-plugin-solid/configs/typescript'
import * as tsParser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    ...solid,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: 'tsconfig.json',
      },
    },
  },
]
```

**Remove** `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` — both are React-specific and produce false positives on Solid code. `eslint-plugin-solid` covers Solid-specific rules (no-destructure, component naming, JSX key, etc.).

---

## Storybook — FLAGGED: Compat Risk

**Use `storybook-solidjs-vite` from `solidjs-community/storybook` (v10.1.1).**

The situation as of 2026-05-31:

| Package | Status | Action |
|---------|--------|--------|
| `storybook-solidjs` | DEPRECATED — archived July 2025 | Remove entirely |
| `storybookjs/solidjs` repo | ARCHIVED July 2025 | Do not reference |
| `storybook-solidjs-vite` | ACTIVE — v10.1.1 (May 25, 2026), community-maintained at `solidjs-community/storybook` | Use this |

v10.1.1 version number tracks Storybook 10 major. The package explicitly states Solid 1 AND Solid 2 support, Vite-powered builder, and Storybook addon ecosystem compatibility. `npx storybook@latest init` auto-detects SolidJS and installs `storybook-solidjs-vite`.

**.storybook/main.ts:**
```typescript
import type { StorybookConfig } from 'storybook-solidjs-vite'

const config: StorybookConfig = {
  framework: 'storybook-solidjs-vite',
  stories: ['../stories/**/*.stories.{ts,tsx}'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    '@storybook/addon-vitest',
  ],
}

export default config
```

**Risk flag:** `storybook-solidjs-vite` is community-maintained, not Chromatic/Storybook core. It has a v9→v10 migration guide indicating breaking changes exist. The `@addon-vitest` and Chromatic integration compatibility with `storybook-solidjs-vite` specifically should be verified at Phase 8 execution time before assuming full parity with the React Storybook setup.

**Storybook 10 breaking change to note:** Storybook 10 is ESM-only. `docs/` package.json must have `"type": "module"` or use `.mjs` extension for config files if not already set.

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| `vite build --lib` | `tsup` + `tsup-preset-solid` | tsup-preset-solid last released December 2023 (v2.2.0, 2.5 years stale). tsup itself is no longer actively maintained. Using it would introduce a dead dependency. |
| `vite build --lib` | `tsdown` + `unplugin-solid` | tsdown 0.20.x is promising (Rolldown-powered, 3-10x faster) and has an official Solid recipe, but is pre-1.0 and the `unplugin-solid` integration has no community track record yet for component libraries. Revisit at Solid 2.0 migration. |
| `vite build --lib` | Rollup directly | Vite wraps Rollup internally; no benefit to dropping Vite here since the docs site already uses it. Adds configuration burden with no gain. |
| `vitest` | Jest | Jest requires `ts-jest` + `babel-jest` + heavy config to handle Solid JSX. Vitest shares the Vite config, so `vite-plugin-solid` handles JSX in tests automatically. Also eliminates the `jest-environment-jsdom` separate package. Drop Jest entirely. |
| `storybook-solidjs-vite` | `@storybook/html` (fallback) | `@storybook/html` renders arbitrary HTML strings — no component story format, no arg types, no controls. Not viable for a typed component library. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `storybook-solidjs` (old npm package) | Deprecated; points to archived `storybookjs/solidjs` repo (archived July 2025). Unmaintained, will not receive Storybook 10 fixes. | `storybook-solidjs-vite` |
| `tsup-preset-solid` | Last release December 2023. The underlying `tsup` is no longer actively maintained. No updates for Storybook 10 era toolchain. | `vite build --lib` |
| `"jsx": "react-jsx"` in tsconfig | TypeScript transforms JSX before Solid's compiler sees it — destroys reactivity signals. | `"jsx": "preserve"` + `"jsxImportSource": "solid-js"` |
| Destructuring props in Solid components | Breaks Solid's fine-grained reactivity — props become static values at call-time. This is the #1 porting mistake. | `splitProps` + `mergeProps` for every component |
| `eslint-plugin-react-hooks` | React-specific rules; false positives on Solid code (e.g., it flags `createEffect` dependencies). | `eslint-plugin-solid` |
| Jest | Requires ts-jest, babel-jest, separate jsdom package, and doesn't integrate with Vite pipeline. Every Solid project using Vite now uses Vitest. | `vitest` |
| `@testing-library/react` | React-specific render and act() semantics. Solid's batching model is different. | `@solidjs/testing-library` |
| `babel-preset-solid` directly | Always consumed indirectly via `vite-plugin-solid`. Wiring it manually risks version skew and missing the Vite integration (HMR, resolve conditions, etc.). | `vite-plugin-solid` which bundles and configures babel-preset-solid |

---

## Version Compatibility Matrix

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `solid-js@^1.9.13` | `vite-plugin-solid@^2.11.12` | vite-plugin-solid requires solid-js as peer dep — install both |
| `vite-plugin-solid@^2.11.12` | `vite@^7.x` | vite-plugin-solid 2.x supports Vite 5+; Vite 7 is current |
| `vitest@^4.1.7` | `vite@^7.x` | Vitest 4.x requires Vite 6+ |
| `@solidjs/testing-library@^0.8.10` | `solid-js@>=1.0.0` | Works with 1.9.x confirmed |
| `storybook-solidjs-vite@^10.1.1` | `storybook@^10.x` | v10.x version number tracks Storybook 10 major |
| `eslint-plugin-solid@~0.14.5` | `eslint@^9.x` | ESLint 9 flat config supported; pin `~` not `^` |
| `@testing-library/user-event@^14.6.1` | `@solidjs/testing-library@^0.8.x` | Framework-agnostic; keep existing version |
| `@testing-library/jest-dom@^6.9.1` | `vitest@^4.x` | Import from `@testing-library/jest-dom/vitest` not default |

---

## Sources

- `solidjs-community/storybook` GitHub — storybook-solidjs-vite v10.1.1 confirmed, Solid 1+2 support ([github.com/solidjs-community/storybook](https://github.com/solidjs-community/storybook)) — HIGH confidence
- `solidjs/vite-plugin-solid` GitHub — v2.11.12 current, tsconfig requirements ([github.com/solidjs/vite-plugin-solid](https://github.com/solidjs/vite-plugin-solid)) — HIGH confidence
- Vitest jsdom fix blog post — resolve.conditions + ssr.resolve.conditions requirement after vite-plugin-solid 2.11.9 ([hy2k.dev](https://hy2k.dev/en/blog/2025/10-17-vitest-solid-browser-conditions/)) — HIGH confidence
- `solid-transition-group` vitest.config.ts — community reference config ([github.com](https://github.com/solidjs-community/solid-transition-group/blob/main/vitest.config.ts)) — HIGH confidence
- `solidjs-community/tsup-preset-solid` — last release Dec 2023, confirmed stale ([github.com](https://github.com/solidjs-community/tsup-preset-solid)) — HIGH confidence (for "avoid" recommendation)
- tsdown Solid recipe — `unplugin-solid/rolldown` pattern confirmed ([tsdown.dev](https://tsdown.dev/recipes/solid-support)) — MEDIUM confidence (pre-1.0 tool)
- WebSearch: solid-js@1.9.13 as current stable — MEDIUM confidence (npm page, not official release notes)
- WebSearch: storybook 10 ESM-only breaking change — MEDIUM confidence
- `eslint-plugin-solid` GitHub — v0.14.5, ESLint 9 flat config support ([github.com/solidjs-community/eslint-plugin-solid](https://github.com/solidjs-community/eslint-plugin-solid)) — HIGH confidence
- `solid-js` package.json exports structure (solid-router, solid-meta pattern) — HIGH confidence via WebSearch aggregate

---

*Stack research for: SolidJS component library authoring and npm publishing*
*Researched: 2026-05-31*
