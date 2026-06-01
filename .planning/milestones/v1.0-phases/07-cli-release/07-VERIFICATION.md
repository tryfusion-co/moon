---
phase: 07-cli-release
verified: 2026-06-01T17:00:00Z
status: passed
score: 7/7
overrides_applied: 0
---

# Phase 7: CLI + Release — Verification Report

**Phase Goal:** The CLI scaffolder emits Solid templates under the renamed bin, README and CHANGELOG are updated for the 3.0.0 major release, and npm publish --dry-run passes with the solid export condition verified in a smoke consumer.
**Verified:** 2026-06-01T17:00:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `packages/bin/moon-solid` exists; `packages/bin/moon-react` absent | VERIFIED | `ls packages/bin/` → only `moon-solid` present; commit 27397b3 renamed the file via git mv |
| 2 | `packages/package.json` bin field = `{"moon-solid":"bin/moon-solid"}` | VERIFIED | package.json line 52-54 confirmed; commit 27397b3 diff shows value changed from `bin/moon-react` → `bin/moon-solid` |
| 3 | `cli/index.ts` uses `MOON_SOLID_ARGS` with zero `MOON_REACT_ARGS` occurrences | VERIFIED | grep confirms 4 occurrences of `MOON_SOLID_ARGS`, 0 of `MOON_REACT_ARGS` in cli/index.ts |
| 4 | CLI files are framework-agnostic (no React imports) | VERIFIED | grep for `import.*from.*react` across `packages/cli/` returns no matches |
| 5 | package.json is `@moondesignsystem/solid@3.0.0` with `exports.solid → ./dist/index.jsx` (NOT regressed to react@2.5.21) | VERIFIED | package.json: name `@moondesignsystem/solid`, version `3.0.0`, peerDeps `solid-js@^1.9.13`, exports.solid `./dist/index.jsx` — no react references anywhere in package.json |
| 6 | Root README.md and packages/README.md are Solid-only (title "Moon Solid", `@moondesignsystem/solid`, `solid-js` peer, solid export condition note; zero `moon-react`/`className`/`@moondesignsystem/react`) | VERIFIED | Both READMEs confirmed identical, title "# Moon Solid", all install/usage examples reference `@moondesignsystem/solid`, `moon-solid` bin, `class` attribute, `solid-js@^1.9.13` peer note, `solid` export condition section; grep for `moon-react`, `@moondesignsystem/react`, `className` returns zero matches in both files |
| 7 | packages/CHANGELOG.md has 3.0.0 React→Solid entry; .changeset/ has a major changeset for @moondesignsystem/solid | VERIFIED | CHANGELOG.md header `# @moondesignsystem/solid`, `## 3.0.0` section with full breaking change details; `.changeset/moon-solid-3-0-0.md` exists with `"@moondesignsystem/solid": major` |

**Score:** 7/7 truths verified

---

## Critical Regression Check: package.json NOT Reverted

The verification instruction specifically flags a stale-worktree regression risk (react@2.5.21 slipping back in). Direct inspection of `packages/package.json` confirms:

- `"name": "@moondesignsystem/solid"` — NOT `@moondesignsystem/react`
- `"version": "3.0.0"` — NOT `2.5.21`
- `"peerDependencies": { "solid-js": "^1.9.13" }` — NO `react`/`react-dom` peer deps
- `"exports": { ".": { "solid": "./dist/index.jsx", ... } }` — solid condition present
- No `react` or `react-dom` in peerDependencies or dependencies

**Regression: ABSENT. package.json is confirmed Solid/3.0.0.**

## Critical Check: Button.tsx Has mergeProps (Not Regressed)

`packages/src/components/Button.tsx` line 1: `import { mergeProps, splitProps, type Component, type JSX } from "solid-js"` — `mergeProps` is present and used at line 18. No `import React` or `className`. **Not regressed.**

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/bin/moon-solid` | Renamed bin entrypoint | VERIFIED | Exists; spawns `npx tsx cli/index.ts`; no "react" strings in content |
| `packages/cli/index.ts` | MOON_SOLID_ARGS enum, no MOON_REACT_ARGS | VERIFIED | 4 hits MOON_SOLID_ARGS, 0 MOON_REACT_ARGS |
| `packages/src/components/Button.tsx` | Solid (mergeProps+splitProps, class=, no className) | VERIFIED | mergeProps line 1+18, splitProps, class= attribute, no React import |
| `README.md` | Solid rewrite | VERIFIED | "# Moon Solid", @moondesignsystem/solid throughout |
| `packages/README.md` | Solid rewrite (published file) | VERIFIED | Identical to root README — Solid-only |
| `packages/CHANGELOG.md` | 3.0.0 entry, header @moondesignsystem/solid | VERIFIED | Header matches, ## 3.0.0 present with full breaking-change prose |
| `.changeset/moon-solid-3-0-0.md` | Major changeset for @moondesignsystem/solid | VERIFIED | `"@moondesignsystem/solid": major` in frontmatter |
| `packages/dist/index.js` | Built ESM entry | VERIFIED | Present in dist/ |
| `packages/dist/index.jsx` | Built raw-JSX solid condition entry | VERIFIED | Present; head confirms it re-exports ./components/*.jsx (not createComponent) |
| `packages/dist/index.d.ts` | TypeScript declarations | VERIFIED | Present in dist/ |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `packages/package.json` bin `moon-solid` | `packages/bin/moon-solid` | bin field value | VERIFIED | Value is `"bin/moon-solid"` — points to existing file |
| `packages/bin/moon-solid` | `packages/cli/index.ts` | `path.join(__dirname,'..','cli','index.ts')` | VERIFIED | Spawn command hardcoded in bin script |
| `exports.solid` | `dist/index.jsx` | package.json exports map | VERIFIED | `"solid": "./dist/index.jsx"` — file exists as raw-JSX re-exporter |
| `dist/index.jsx` | `dist/components/Button.jsx` (raw JSX) | re-export chain | VERIFIED | dist/components/Button.jsx first line: `import { mergeProps, splitProps } from "solid-js"` and contains raw `<button` JSX, no `createComponent` |

---

## Data-Flow Trace (Level 4)

N/A — this phase delivers CLI tooling, documentation files, and release artifacts. No dynamic data-rendering components introduced.

---

## Behavioral Spot-Checks

Dry-run and smoke consumer executed as part of phase 07-03 (commits 8fc2245, 4bba022, b002d0c). Evidence recorded in commit messages and SUMMARY:

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `npm publish --dry-run` exits 0 | `cd packages && npm run build && npm publish --dry-run` | Exit 0; 263 files, 71.8kB, @moondesignsystem/solid@3.0.0 | PASS |
| Tarball includes bin/moon-solid, excludes bin/moon-react | Tarball audit in 8fc2245 | All 12 tarball checks passed | PASS |
| `--conditions=solid` resolves to `dist/index.jsx` | `node --conditions=solid import.meta.resolve` via packed tgz | Resolved to dist/index.jsx; default resolves to dist/index.js | PASS |
| `dist/components/Button.jsx` is raw JSX (no createComponent) | grep createComponent on installed pkg | 0 matches; raw `<button` JSX confirmed | PASS |
| Milestone gate: 278 tests, 0 lint errors, storybook 37 stories | `vitest run` + `eslint .` + `build-storybook` | All exit 0 | PASS |

---

## Requirements Coverage

| Requirement | Description | Status | Evidence |
|-------------|-------------|--------|----------|
| CLI-01 | CLI scaffolder emits Solid templates; bin renamed moon-solid; package.json bin updated | SATISFIED | bin/moon-solid exists; package.json bin `{"moon-solid":"bin/moon-solid"}`; cli/*.ts framework-agnostic; Solid components in src/components/ |
| REL-01 | README + CHANGELOG updated for Solid; major version 3.0.0 via changeset | SATISFIED | Both READMEs Solid; CHANGELOG ## 3.0.0 entry; .changeset/moon-solid-3-0-0.md major |
| REL-02 | npm publish --dry-run passes; smoke consumer resolves solid export condition | SATISFIED | dry-run exit 0; node --conditions=solid → dist/index.jsx confirmed end-to-end |

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | — | — | No blockers or warnings found |

No TODO/FIXME/placeholder patterns in modified files. No empty implementations. No react imports in CLI or component source.

---

## Human Verification Required

None. All must-haves are verifiable programmatically and evidence is complete.

---

## Gaps Summary

No gaps. All 7 truths verified. All 3 requirements satisfied. The critical regression check (package.json not reverted to react@2.5.21) is confirmed clean.

---

## Commit Traceability

SUMMARY 07-01 listed commits 2699473, da1343d, 9daee29 but actual git log shows a single squash commit 27397b3 covering all three tasks. This is a documentation discrepancy (intermediate hashes from execution that were squashed before final push) — the codebase state matches all claimed changes. The deliverables are verified from file content, not commit hashes.

---

_Verified: 2026-06-01T17:00:00Z_
_Verifier: Claude (gsd-verifier)_
