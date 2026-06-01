---
phase: 01-toolchain-foundation
reviewed: 2026-06-01T00:00:00Z
depth: standard
files_reviewed: 16
files_reviewed_list:
  - packages/eslint.config.js
  - packages/package.json
  - packages/scripts/generate-barrel.cjs
  - packages/src/_stub.ts
  - packages/src/assets/icons/ChevronDown.tsx
  - packages/src/assets/icons/ChevronLeft.tsx
  - packages/src/assets/icons/ChevronRight.tsx
  - packages/src/assets/icons/Close.tsx
  - packages/src/assets/icons/User.tsx
  - packages/src/index.ts
  - packages/src/tests/setupTests.ts
  - packages/src/tests/toolchain.test.tsx
  - packages/tsconfig.build.json
  - packages/tsconfig.json
  - packages/vite.config.ts
  - packages/vitest.config.ts
findings:
  critical: 3
  warning: 5
  info: 3
  total: 11
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-06-01T00:00:00Z
**Depth:** standard
**Files Reviewed:** 16
**Status:** issues_found

## Summary

Phase 1 establishes the SolidJS toolchain: build config, icon components, ESLint rules, and a single smoke test. The SolidJS-specific idioms (splitProps, class, kebab-case SVG attributes, jsx=preserve, solid export condition) are largely correct. Three blocking defects exist: the `solid` export condition will ship compiled JS under a `.jsx` extension rather than preserved JSX, making it functionally useless for SSR/Solid bundlers; three of five icons hardcode `fill="black"` and cannot be tinted by consumers; and the first Rollup output object is missing its `dir` field. Five additional warnings cover a hardcoded binary name, a stale repository URL, redundant/risky `main` field, a debug `console.log` inside the prebuild script, and a missing `cleanup` pattern in the test file.

---

## Critical Issues

### CR-01: `solid` export condition will contain compiled JS, not preserved JSX

**File:** `packages/vite.config.ts:1-31`

**Issue:** `vite-plugin-solid` compiles JSX into `createComponent`/`_tmpl$` calls unconditionally for every file that passes through Vite's transform pipeline. The second Rollup output object changes only the output file extension to `.jsx` — it does not disable the SolidJS Babel transform for that output. The resulting `dist/index.jsx` (and every icon/component `.jsx` file) will contain compiled Solid reactive calls, not raw `<svg>` JSX. Solid-aware SSR bundlers (Astro, SolidStart, custom SSR setups) resolve the `solid` condition precisely because they need the raw JSX to apply their own compilation step. Shipping pre-compiled output under the `solid` condition silently breaks SSR for every consumer.

The correct approach requires a separate Vite build invocation that uses `vite-plugin-solid` configured to skip transformation (or bypasses the plugin entirely and relies on `tsc --jsx preserve` / a Rollup plugin that leaves JSX intact), writing those files to the JSX output tree.

**Fix:**

Option A — run two separate `vite build` passes:

```ts
// vite.config.ts — pass 1 (default, compiled ESM)
export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    lib: { entry: "./src/index.ts", formats: ["es"], fileName: "index" },
    rollupOptions: {
      external: ["solid-js", "solid-js/web", "solid-js/store"],
      output: {
        format: "es",
        entryFileNames: "[name].js",
        chunkFileNames: "[name]-[hash].js",
        preserveModules: true,
        preserveModulesRoot: "src",
        dir: "dist",
      },
    },
  },
});
```

```ts
// vite.config.solid.ts — pass 2 (JSX-preserved, for "solid" condition)
import { defineConfig } from "vite";

export default defineConfig({
  // No solidPlugin — JSX must not be compiled
  esbuild: { jsx: "preserve" },
  build: {
    lib: { entry: "./src/index.ts", formats: ["es"], fileName: "index" },
    rollupOptions: {
      external: ["solid-js", "solid-js/web", "solid-js/store"],
      output: {
        format: "es",
        entryFileNames: "[name].jsx",
        chunkFileNames: "[name]-[hash].jsx",
        preserveModules: true,
        preserveModulesRoot: "src",
        dir: "dist",
      },
    },
  },
});
```

```json
// package.json scripts
"build": "vite build && vite build --config vite.config.solid.ts && tsc --project tsconfig.build.json --emitDeclarationOnly"
```

Option B — use `babel-preset-solid` only in the compiled pass and let the second pass emit raw JSX via `@babel/plugin-transform-react-jsx` with `{ pragma: "..." }` set to a no-op, retaining raw JSX syntax. Either approach is valid; Option A is simpler and less fragile.

---

### CR-02: First Rollup output object missing `dir` field

**File:** `packages/vite.config.ts:11-18`

**Issue:** When `rollupOptions.output` is an array, each entry must specify its own `dir` (or `file`). The first output object (`.js` ESM output) has `preserveModules: true` and `preserveModulesRoot: "src"` but no `dir`. Rollup falls back to `build.outDir` (`dist`), which happens to be correct, but the absence is fragile: if `build.outDir` is ever changed or if Rollup changes its fallback behaviour, the first output will write to an unintended location without an error. The second output explicitly sets `dir: "dist"`, making the asymmetry a latent bug.

**Fix:**

```ts
output: [
  {
    format: "es",
    entryFileNames: "[name].js",
    chunkFileNames: "[name]-[hash].js",
    preserveModules: true,
    preserveModulesRoot: "src",
    dir: "dist",          // <-- add this
  },
  {
    format: "es",
    entryFileNames: "[name].jsx",
    chunkFileNames: "[name]-[hash].jsx",
    preserveModules: true,
    preserveModulesRoot: "src",
    dir: "dist",
  },
],
```

---

### CR-03: Three icons hardcode `fill="black"` — cannot be tinted by consumers

**File:** `packages/src/assets/icons/ChevronDown.tsx:18`, `packages/src/assets/icons/ChevronLeft.tsx:18`, `packages/src/assets/icons/ChevronRight.tsx:18`

**Issue:** The `<path>` elements in `ChevronDown`, `ChevronLeft`, and `ChevronRight` all carry `fill="black"`. `Close` and `User` correctly use `fill="currentColor"`. The hardcoded `"black"` value means:

1. The icons are always black regardless of the CSS `color` property on the parent element.
2. Dark-mode consumers cannot invert the icon colour.
3. Consumer overrides via the spread `{...rest}` cannot override `fill` on the `<path>` (only on the root `<svg>`), because `fill="black"` is a child-element attribute.

The constraint in CLAUDE.md — "Public API (component names, prop names, exported types, class names) must stay identical — consuming apps swap framework only" — implies visual output must also be identical. If the React originals used `fill="currentColor"` (standard for icon libraries), this is a regression.

**Fix:** Change `fill="black"` to `fill="currentColor"` on the `<path>` in each affected icon.

```tsx
// ChevronDown.tsx line 18 — same fix for ChevronLeft.tsx and ChevronRight.tsx
<path
  id="Icon"
  d="M5.50316 ..."
  fill="currentColor"   // was: fill="black"
/>
```

---

## Warnings

### WR-01: `package.json` — stale React metadata in a Solid package

**File:** `packages/package.json:13-19`

**Issue:** Multiple fields still reference the React package:

- `"repository".url`: `"git+https://github.com/moondesignsystem/react.git"` — should point to the Solid repo.
- `"homepage"`: `"https://react.moondesignsystem.com"` — should be the Solid docs URL.
- `"bin"."moon-react"`: The CLI binary is named `moon-react` but the package is now `@moondesignsystem/solid`. Consumers running `npx @moondesignsystem/solid --help` will invoke a binary named `moon-react`, creating brand confusion and friction for any tooling that inspects the binary name.

**Fix:**

```json
"repository": {
  "type": "git",
  "url": "git+https://github.com/moondesignsystem/solid.git"
},
"homepage": "https://solid.moondesignsystem.com",
...
"bin": {
  "moon-solid": "bin/moon-react"
}
```

Note: renaming the bin key is a breaking change for any consumer scripts that reference `moon-react` by name. If backwards compat is required, keep both keys pointing to the same file.

---

### WR-02: `package.json` — `"main"` field will break CommonJS consumers

**File:** `packages/package.json:6`

**Issue:** `"main": "./dist/index.js"` causes Node.js (and bundlers without `exports` support) to load the ESM file via `require()`, which throws `ERR_REQUIRE_ESM`. The `"exports"` map is correct (no `require` condition, which is intentional for an ESM-only package), but the `"main"` field bypasses `exports` for legacy tooling. If no CJS output is intended, `"main"` should be removed entirely — modern bundlers and Node.js 12+ use `"exports"`. Leaving `"main"` pointing at an ESM file is a trap for legacy consumers.

**Fix:** Remove the `"main"` field if CJS is not supported. If CJS support is needed, add a CJS build output and point `"main"` to it.

```json
// Remove these if CJS is not supported:
// "main": "./dist/index.js",
// "module": "./dist/index.js",

// Keep only:
"exports": {
  ".": {
    "solid": "./dist/index.jsx",
    "import": "./dist/index.js",
    "types": "./dist/index.d.ts"
  }
}
```

---

### WR-03: `generate-barrel.cjs` — debug `console.log` fires on every `prebuild`

**File:** `packages/scripts/generate-barrel.cjs:64`

**Issue:** `console.log(\`${componentName}: found types [${exports.join(", ")}]\`)` is called inside `getExportedTypes()` for every component file scanned. In a library with 34+ components, this will print 34+ lines of type-scan noise to stdout on every `npm run build`. This is diagnostic output left over from development, not a progress indicator.

**Fix:** Remove or guard the log behind a `--verbose` flag:

```js
// Remove line 64, or replace with:
if (process.env.BARREL_VERBOSE) {
  console.log(`${componentName}: found types [${exports.join(", ")}]`);
}
```

---

### WR-04: `package.json` — CLI dependencies in `dependencies` instead of `devDependencies`

**File:** `packages/package.json:55-62`

**Issue:** `execa`, `fs-extra`, `prompts`, `tsx`, and their `@types/*` packages are in `"dependencies"`. These are CLI-only runtime dependencies consumed by `packages/cli/` and `packages/bin/`. When a consuming application installs `@moondesignsystem/solid` to use its UI components, it will also download all CLI dependencies into its `node_modules`. For a UI component library, CLI tooling dependencies should be either:

- Moved to `devDependencies` if the CLI is bundled at publish time (the built `bin/moon-react` script would inline them), or
- Split into a separate `@moondesignsystem/solid-cli` package.

**Fix:** Audit whether `bin/moon-react` requires these at runtime (i.e., it calls `require('execa')` from the consumer's `node_modules`). If the CLI is run via `npx` and requires these at runtime, keeping them in `dependencies` is technically correct but bloats every consumer's install. If they can be bundled, move them to `devDependencies`.

---

### WR-05: `src/tests/toolchain.test.tsx` — missing `cleanup` after render

**File:** `packages/src/tests/toolchain.test.tsx:9`

**Issue:** `@solidjs/testing-library` v0.8.x does not automatically call `cleanup()` between tests (unlike `@testing-library/react`). The single test file renders into jsdom and never cleans up. While this is harmless with one test, it establishes a pattern that will cause DOM leaks and test-order-dependent failures when Phase 7 adds more tests to this suite.

**Fix:** Import and call `cleanup` in an `afterEach`:

```tsx
import { render, cleanup } from "@solidjs/testing-library";
import { describe, it, expect, afterEach } from "vitest";
import type { Component } from "solid-js";

afterEach(cleanup);

const Probe: Component = () => <div data-testid="probe">ok</div>;

describe("toolchain", () => {
  it("renders a Solid component in jsdom without server-build errors", () => {
    const { getByTestId } = render(() => <Probe />);
    expect(getByTestId("probe").textContent).toBe("ok");
  });
});
```

---

## Info

### IN-01: `eslint.config.js` — `vite.config.ts` and `vitest.config.ts` excluded from lint

**File:** `packages/eslint.config.js:50-51`

**Issue:** Both config files are in the ESLint `ignores` array. The comment explains this is because they fall outside `tsconfig.json`'s `project` scope. This is acceptable in isolation, but it means the `solid/no-destructure` rule and TypeScript checks are never applied to these files. If a future config change introduces a Solid anti-pattern (e.g., destructuring inside a Solid plugin callback), ESLint will not catch it.

**Fix:** Add a separate `overrides` block (or a dedicated tsconfig that includes the config files) so at minimum JavaScript-level ESLint rules apply to them. If the `@typescript-eslint/parser` project constraint is the only blocker, omit the `parserOptions.project` for that file glob.

---

### IN-02: `tsconfig.json` vs `tsconfig.build.json` — ES target mismatch

**File:** `packages/tsconfig.json:3`, `packages/tsconfig.build.json:3`

**Issue:** `tsconfig.json` (used for editor/test tooling) targets `ES2022`; `tsconfig.build.json` (used for declaration emit) targets `ES2020`. The `lib` arrays also differ (`ES2022` vs `ES2020`). Code using ES2022+ features (e.g., `Array.at()`, `Object.hasOwn()`) will pass type-checking in the IDE but may produce declarations referencing types unavailable in the ES2020 lib, confusing consumers who target ES2020.

**Fix:** Align both to the same target. Given the project uses Node 22 and modern bundlers, `ES2022` is the appropriate baseline:

```json
// tsconfig.build.json
"target": "ES2022",
"lib": ["ES2022", "DOM", "DOM.Iterable"],
```

---

### IN-03: `package.json` — `"funding"` URL references Moon React OpenCollective page

**File:** `packages/package.json:16-19`

**Issue:** The `"funding".url` is `"https://opencollective.com/moon-react-library"`. The package is being republished as `@moondesignsystem/solid`. If a separate OpenCollective project exists for the Solid version, this should be updated. If the same fund covers both, the URL is acceptable but may be confusing.

**Fix:** Update to the Solid-specific funding URL once created, or add a comment clarifying the shared fund.

---

_Reviewed: 2026-06-01T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
