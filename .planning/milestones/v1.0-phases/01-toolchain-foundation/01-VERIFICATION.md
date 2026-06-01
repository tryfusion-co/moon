---
phase: 01-toolchain-foundation
verified: 2026-06-01T04:29:21Z
status: passed
score: 11/11 must-haves verified
overrides_applied: 0
gaps: []
human_verification: []
---

# Phase 1: Toolchain + Foundation Verification Report

**Phase Goal:** The Solid build/test/lint pipeline is fully operational and all shared library primitives (helpers, types, icons) are ported, so every subsequent phase can build, test, and lint without encountering React imports.
**Verified:** 2026-06-01T04:29:21Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                 | Status     | Evidence                                                                                                          |
|----|---------------------------------------------------------------------------------------|------------|-------------------------------------------------------------------------------------------------------------------|
| 1  | `npm run build` exits 0, emitting `dist/index.js` + `dist/index.d.ts`                | VERIFIED   | Build ran live: exit 0, both files confirmed present                                                              |
| 2  | `dist/*.jsx` contain raw JSX (`<svg`/`return <`), NOT compiled Solid (`_tmpl$`/`createComponent`) | VERIFIED | grep for `_tmpl$`/`createComponent` in all dist `.jsx` = 0 matches; `return <svg` present in every icon .jsx     |
| 3  | `dist/*.js` is compiled ESM (import condition)                                        | VERIFIED   | `dist/index.js` contains resolved import/export statements; `dist/_stub.js` has mangled `const O = !0`           |
| 4  | `package.json` exports `.solid` → `./dist/index.jsx`, `.import` → `./dist/index.js`  | VERIFIED   | Exact exports map confirmed in package.json lines 24-30                                                           |
| 5  | Package identity: `@moondesignsystem/solid@3.0.0`, peer `solid-js@^1.9.13`, no React peers | VERIFIED | name/version/peerDependencies confirmed in package.json; no react/react-dom keys                                  |
| 6  | Both tsconfigs: `jsx: preserve` + `jsxImportSource: solid-js`                         | VERIFIED   | tsconfig.json lines 17-18 and tsconfig.build.json lines 23-24 both match                                          |
| 7  | Vitest + jsdom + resolve.conditions browser fix; `npm test` exits 0                  | VERIFIED   | vitest.config.ts: `resolve: { conditions: ["development", "browser"] }` + `ssr: { resolve: { conditions: ["browser"] } }`; test run exit 0, 1 pass |
| 8  | ESLint flat config with `solid/no-destructure: error`; `npx eslint .` exits 0        | VERIFIED   | eslint.config.js uses `eslint-plugin-solid/configs/typescript`, rule set to `"error"`; live run exits 0           |
| 9  | `helpers/mergeClasses.ts` and `types/index.ts` are React-free                        | VERIFIED   | grep for `from "react"` / `import React` in both files = 0 matches; pure TypeScript                               |
| 10 | 5 icons ported to Solid `Component` with `splitProps`, `class` (not `className`), React-free | VERIFIED | All 5 source files: `import { splitProps, type Component, type JSX } from "solid-js"`, `splitProps(props, ["class"])`, `class={local.class}`, no `className`, no React import |
| 11 | `generate-barrel.cjs` produces a valid Solid barrel; `barrelsby` absent              | VERIFIED   | `.cjs` file exists and runs (prebuild produced barrel with 34 components); `barrelsby` not present in package.json |

**Score:** 11/11 truths verified

---

## Required Artifacts

| Artifact                                       | Expected                                       | Status   | Details                                                                     |
|------------------------------------------------|------------------------------------------------|----------|-----------------------------------------------------------------------------|
| `packages/vite.config.ts`                      | Vite lib build with vite-plugin-solid          | VERIFIED | solidPlugin(), preserveModules, solid-js external                           |
| `packages/vitest.config.ts`                    | Vitest + jsdom + browser conditions fix        | VERIFIED | resolve.conditions browser + ssr.resolve.conditions browser present         |
| `packages/eslint.config.js`                    | ESLint flat config with solid/no-destructure   | VERIFIED | eslint-plugin-solid/configs/typescript + no-destructure:error               |
| `packages/tsconfig.json`                       | jsx:preserve + jsxImportSource:solid-js        | VERIFIED | Lines 17-18 confirmed                                                        |
| `packages/tsconfig.build.json`                 | jsx:preserve + jsxImportSource:solid-js        | VERIFIED | Lines 23-24 confirmed                                                        |
| `packages/package.json`                        | Solid identity, exports map, no React peers    | VERIFIED | All fields confirmed                                                         |
| `packages/src/_stub.ts`                        | Exports MOON_SOLID_TOOLCHAIN_READY stub        | VERIFIED | Exports `true as const`                                                     |
| `packages/src/tests/toolchain.test.tsx`        | Solid render() test, no client-on-server error | VERIFIED | Uses @solidjs/testing-library render(() => <Probe/>); passes                |
| `packages/src/assets/icons/ChevronDown.tsx`    | Solid Component with splitProps                | VERIFIED | splitProps, class, no className, no React                                    |
| `packages/src/assets/icons/ChevronLeft.tsx`    | Solid Component with splitProps                | VERIFIED | Same pattern                                                                 |
| `packages/src/assets/icons/ChevronRight.tsx`   | Solid Component with splitProps                | VERIFIED | Same pattern                                                                 |
| `packages/src/assets/icons/Close.tsx`          | Solid Component with splitProps + kebab attrs  | VERIFIED | fill-rule/clip-rule kebab-case confirmed                                     |
| `packages/src/assets/icons/User.tsx`           | Solid Component with splitProps + kebab attrs  | VERIFIED | fill-rule/clip-rule kebab-case confirmed                                     |
| `packages/scripts/generate-barrel.cjs`         | Framework-agnostic barrel generator            | VERIFIED | Renamed from .js to avoid ESM/CJS conflict; runs correctly                  |
| `packages/scripts/build-solid-condition.mjs`   | esbuild jsx:preserve pass for solid condition  | VERIFIED | Uses esbuild with jsx:"preserve", outExtension .jsx; produces raw JSX       |
| `packages/dist/index.js`                       | Compiled ESM import-condition entry            | VERIFIED | Present, contains compiled output                                            |
| `packages/dist/index.jsx`                      | Raw JSX solid-condition entry                  | VERIFIED | Present, `export * from "./_stub"` (no JSX needed for re-export)            |
| `packages/dist/index.d.ts`                     | TypeScript declarations                        | VERIFIED | Present                                                                      |
| `packages/dist/assets/icons/ChevronDown.jsx`   | Raw JSX solid-condition icon                   | VERIFIED | `return <svg` present, no _tmpl$/createComponent                             |
| `packages/dist/assets/icons/Close.jsx`         | Raw JSX solid-condition icon                   | VERIFIED | `return <svg` present, fill-rule/clip-rule intact                            |

---

## Key Link Verification

| From                            | To                                   | Via                                   | Status   | Details                                                                              |
|---------------------------------|--------------------------------------|---------------------------------------|----------|--------------------------------------------------------------------------------------|
| `package.json` exports.solid    | `dist/index.jsx`                     | Direct path reference                 | WIRED    | `"solid": "./dist/index.jsx"` in exports map                                         |
| `package.json` exports.import   | `dist/index.js`                      | Direct path reference                 | WIRED    | `"import": "./dist/index.js"` in exports map                                         |
| `src/index.ts`                  | `src/_stub.ts`                       | `export * from "./_stub"`             | WIRED    | Confirmed in src/index.ts                                                            |
| `npm run build`                 | vite build + esbuild script + tsc    | `package.json` build script           | WIRED    | `"build": "vite build && node scripts/build-solid-condition.mjs && tsc --project tsconfig.build.json --emitDeclarationOnly"` |
| `vitest.config.ts`              | `src/tests/toolchain.test.tsx`       | `include` filter                      | WIRED    | `include: ["src/tests/toolchain.test.tsx"]` scopes Phase 1 gate                      |
| `vitest.config.ts`              | `src/tests/setupTests.ts`            | `setupFiles`                          | WIRED    | `setupFiles: ["./src/tests/setupTests.ts"]`                                          |
| `build-solid-condition.mjs`     | `dist/*.jsx`                         | esbuild with jsx:preserve             | WIRED    | Script imports esbuild, sets outExtension .jsx, confirmed output exists              |

---

## Data-Flow Trace (Level 4)

Not applicable — phase outputs are build toolchain, config files, and static primitive utilities. No dynamic data rendering components exist in this phase.

---

## Behavioral Spot-Checks

| Behavior                                                        | Command                          | Result                                             | Status  |
|-----------------------------------------------------------------|----------------------------------|----------------------------------------------------|---------|
| Build emits dist artifacts, exits 0                             | `npm run build`                  | Exit 0; dist/index.js, dist/index.jsx, dist/index.d.ts present | PASS |
| Vitest passes Solid render, no client-on-server error           | `npm test`                       | 1 passed (1), Duration 1.65s, no server-build error | PASS   |
| ESLint exits 0 on stub + foundation source                      | `npx eslint .`                   | Exit 0, no output                                  | PASS    |
| dist/*.jsx contain raw JSX, not compiled Solid calls            | grep _tmpl$/createComponent dist | 0 matches across all .jsx files                    | PASS    |
| dist/assets/icons/*.jsx contain `return <svg`                   | grep `return <` dist/assets      | 11 matches across 5 icon .jsx files                | PASS    |
| No React imports in icons/helpers/types src                     | grep `from "react"` src/assets src/helpers | 0 matches                               | PASS    |

---

## Requirements Coverage

| Requirement | Description                                                                   | Status    | Evidence                                                                                        |
|-------------|-------------------------------------------------------------------------------|-----------|-------------------------------------------------------------------------------------------------|
| TOOL-01     | vite build --lib + vite-plugin-solid, ESM + .d.ts                             | SATISFIED | vite.config.ts uses solidPlugin + lib mode; dist/index.js + dist/index.d.ts present            |
| TOOL-02     | solid export condition → preserved JSX; dist/*.jsx raw, dist/*.js compiled    | SATISFIED | build-solid-condition.mjs produces raw JSX via esbuild jsx:preserve; zero _tmpl$ in .jsx files |
| TOOL-03     | Package @moondesignsystem/solid@3.0.0, solid-js peer, no React peers          | SATISFIED | package.json name/version/peerDependencies confirmed                                            |
| TOOL-04     | tsconfig jsx:preserve + jsxImportSource:solid-js in both tsconfigs            | SATISFIED | Both tsconfig files confirmed                                                                   |
| TOOL-05     | Vitest + @solidjs/testing-library + jsdom + resolve.conditions browser fix    | SATISFIED | vitest.config.ts confirmed; npm test exits 0                                                    |
| TOOL-06     | ESLint flat config + eslint-plugin-solid + solid/no-destructure               | SATISFIED | eslint.config.js confirmed; npx eslint . exits 0                                                |
| TOOL-07     | Empty/barrel build green before any component ported                          | SATISFIED | Build + test + lint all exit 0; destructure probe confirmed rule fires (REVIEW.md evidence)     |
| FND-01      | mergeClasses.ts React-free, compiles under Solid toolchain                    | SATISFIED | Pure TypeScript, no React imports, compiles via tsc                                             |
| FND-02      | types/index.ts (Sizes/Contexts/Variants/Directions/Positions) exported        | SATISFIED | All 5 types present, no React imports                                                           |
| FND-03      | 5 icons ported: Solid Component, splitProps, class not className, identical SVG | SATISFIED | All 5 icons verified; fill-rule/clip-rule kebab-case in Close/User                             |
| FND-04      | generate-barrel produces valid Solid barrel; barrelsby removed                | SATISFIED | generate-barrel.cjs works; barrelsby absent from package.json                                  |

---

## Anti-Patterns Found

| File                                    | Line | Pattern                                             | Severity | Impact                                                                                    |
|-----------------------------------------|------|-----------------------------------------------------|----------|-------------------------------------------------------------------------------------------|
| `scripts/build-solid-condition.mjs`     | 1    | `import esbuild from "esbuild"` — esbuild not in devDependencies | WARNING  | Works via transitive dep from vite in workspace root; fragile under strict package manager isolation or clean installs |
| `src/tests/toolchain.test.tsx`          | 9    | No `cleanup()` after render (WR-05 from REVIEW.md — deferred) | INFO    | Single test, no DOM leak risk now; Phase 5 cleanup                                        |
| `package.json` bin                      | —    | `"bin": { "moon-solid": "bin/moon-react" }` — bin target filename still `moon-react` | INFO | Deferred to Phase 7 (CLI phase); pre-existing from React package                          |

---

## Human Verification Required

None. All requirements for this phase are verifiable programmatically. Build, test, and lint ran live and passed.

---

## Gaps Summary

No gaps. All 11 must-have truths are verified against actual codebase artifacts and live command execution.

**Notable architectural point:** TOOL-02's "solid condition = preserved JSX" is implemented via a two-step build: vite (compiled .js) followed by a custom `build-solid-condition.mjs` script (esbuild jsx:preserve → .jsx). This is correct and confirmed working. The code review's CR-01 finding (pre-fix state) was addressed before phase submission.

**One undeclared dependency (WARNING, not blocker):** `esbuild` is imported in `build-solid-condition.mjs` but not listed in `packages/package.json` devDependencies. It resolves as a transitive dependency of vite from the workspace root. `npm run build` passes today. This should be explicitly declared before the package is published or CI uses a strict node_modules isolation strategy.

---

_Verified: 2026-06-01T04:29:21Z_
_Verifier: Claude (gsd-verifier)_
