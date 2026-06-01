# Phase 7: CLI + Release - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning
**Mode:** Auto (--auto) — scope from direct CLI + package.json inspection; the FINAL phase

<domain>
## Phase Boundary

Finish the migration: rename the CLI bin to `moon-solid` and confirm it scaffolds Solid components, update README + CHANGELOG for the 3.0.0 Solid release, and prove the package publishes cleanly (`npm publish --dry-run`) with a smoke consumer resolving the `solid` export condition. Covers CLI-01, REL-01, REL-02. This is the last phase — after it, the milestone is complete.

</domain>

<decisions>
## Implementation Decisions

### Already done (by Phase 1 package rename) — verify, don't redo
- `packages/package.json`: name `@moondesignsystem/solid`, version `3.0.0`, peer `solid-js@^1.9.13`, `exports` has the `solid` condition (`"solid": "./dist/index.jsx"`), homepage `solid.moondesignsystem.com`, repo `...solid.git`, funding `moon-solid`. These are correct — verify only.

### D-01 — CLI bin rename (CLI-01)
- `packages/package.json` `bin`: currently `{ "moon-solid": "bin/moon-react" }` — the KEY is renamed but the VALUE path still points to `bin/moon-react`. FIX: `git mv packages/bin/moon-react packages/bin/moon-solid` and update the bin value to `"moon-solid": "bin/moon-solid"`.
- `packages/bin/moon-solid` (the renamed file): it spawns `npx tsx cli/index.ts`. Content references are generic (no "react" in the runtime path) — verify; update any comment/string mentioning moon-react.
- `packages/cli/index.ts`: enum `MOON_REACT_ARGS` → `MOON_SOLID_ARGS` (cosmetic, internal); flag strings `--add-components`/`--add` unchanged (public API). Update any user-facing "moon-react" string.
- `packages/cli/helpers.ts`, `components-meta.ts`, `directories-constants.ts`, `add.ts`: framework-agnostic file-copy logic — verify no "react"-specific strings/paths. `initMoonCss` (helpers) writes a moonconfig — verify it's framework-neutral.

### D-02 — CLI scaffolds Solid (CLI-01)
The CLI copies component .tsx SOURCE from the lib into a consumer's `src/components` (add.ts copyComponent). Since all 37 components are now Solid (Phases 1-4), the CLI automatically emits Solid templates — no template rewrite needed (research confirmed: CLI is framework-agnostic plumbing). VERIFY: a scaffold-then-typecheck of a generated component (e.g. `--add button`) produces valid Solid source that compiles against solid-js. The `files` array in package.json includes `./src` so the published package ships the Solid component source the CLI copies.

### D-03 — README (REL-01)
- Root `README.md` = "# Moon React" → rewrite for Solid: title "Moon Solid" (or "Moon SolidJS"), install `npm i @moondesignsystem/solid`, usage examples in Solid (import from @moondesignsystem/solid, Solid component usage), `solid-js` peer mention, the `solid` export condition note for SolidStart/Vite consumers. Update badges/links (react.moondesignsystem.com → solid.moondesignsystem.com; npm package name).
- `packages/README.md` (the published one in `files`) → same Solid rewrite.
- Update CLI usage docs: `npx @moondesignsystem/solid` / `moon-solid` (was moon-react / @moondesignsystem/ui).
- Replace React code snippets with Solid equivalents (class not className, no React imports).

### D-04 — CHANGELOG + version (REL-01)
- Add a changeset for the `3.0.0` MAJOR release documenting the breaking change: "Migrated from React to SolidJS. Package renamed @moondesignsystem/react → @moondesignsystem/solid. Peer dep is now solid-js. Public API (component names, props, exported types, class output) preserved; `class` replaces `className` per Solid. Drawer/BottomSheet/Dropdown triggers use display:contents wrappers; Chip uncontrolled toggle behavior improved." Use `npx changeset` (or write the changeset md + CHANGELOG.md entry directly — `.changeset/config.json` exists). version is already 3.0.0 in package.json; ensure CHANGELOG.md reflects it.
- Note: do NOT run `changeset publish` (real publish) — only prepare. `changeset version` would bump from changeset files; since version is already manually 3.0.0, just ensure a coherent CHANGELOG entry exists.

### D-05 — Publish dry-run (REL-02)
- `cd packages && npm run build` (fresh dist), then `npm publish --dry-run` → exit 0. Inspect the dry-run tarball file list: must include dist (with index.js + index.jsx + index.d.ts), cli, bin/moon-solid, README.md, LICENSE, src. Must NOT include node_modules, tests, .planning. Confirm the published `exports.solid` points to a shipped `dist/index.jsx`.

### D-06 — Smoke consumer (REL-02)
- Create a minimal throwaway Solid + Vite consumer (a temp dir or a documented snippet) that installs the packed tarball (`npm pack` then install the .tgz, OR `file:` link) and imports a component (e.g. Button) — verify it resolves via the `solid` export condition (the .jsx raw-JSX entry) and the Vite/solid build compiles + renders. This proves D-03 (the mandatory solid condition) end-to-end for a real consumer. Keep it minimal; clean up after. If a full app is too heavy, at minimum: `npm pack`, extract, and a node/vite resolution check that `require.resolve`/import of the package with the `solid` condition lands on `dist/index.jsx`.

### D-07 — Final milestone gate
After CLI-01 + REL-01 + REL-02: the whole repo is Solid. Run the full validation once more: `cd packages && npm run build && npx vitest run && npx eslint .` green; `cd docs && npm run build-storybook` green; `npm publish --dry-run` green. This is the milestone-complete checkpoint.

### Claude's Discretion
- Exact README structure/wording (keep it parity with the React README's sections, Solid-ified).
- Whether the smoke consumer is a full Vite app or a resolution-level check — pick the lightest that genuinely proves the solid condition resolves.
- Whether to use `npx changeset` interactively (avoid — non-interactive) or write the changeset/CHANGELOG md directly (prefer direct).

</decisions>

<specifics>
## Specific Ideas

- Verified: CLI is framework-agnostic file-copy (add.ts copies lib .tsx → consumer src/components). All 37 lib components are Solid → CLI emits Solid automatically. Only bin rename + cosmetic string updates needed.
- package.json bin KEY is already "moon-solid" but VALUE still "bin/moon-react" — the file rename is the real CLI-01 task.
- exports.solid → ./dist/index.jsx already set (Phase 1 + the Phase-1 CR-01 two-pass fix makes index.jsx raw JSX). The smoke consumer validates this resolves for real.
- README is the most writing-heavy task; everything else is mechanical/verification.
- root README.md "# Moon React" + packages/README.md both need the Solid rewrite.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Pattern + decisions
- `.planning/phases/07-cli-release/07-CONTEXT.md` — this file (D-01..D-07)
- `.planning/PROJECT.md` — Key Decisions (package rename, hard cut, display:contents, Chip divergence — for the CHANGELOG breaking-change notes)
- `.planning/research/ARCHITECTURE.md` — CLI is framework-agnostic (bin rename + package.json edit only)
- `.planning/research/STACK.md` — the `solid` export condition mechanics (for the smoke consumer + dry-run check)
- `.planning/REQUIREMENTS.md` — CLI-01, REL-01, REL-02 acceptance

### Source of truth
- `packages/package.json` (bin field, exports, files, version — mostly done, verify + fix bin value)
- `packages/bin/moon-react` (rename → moon-solid), `packages/cli/index.ts`, `helpers.ts`, `components-meta.ts`, `directories-constants.ts`, `add.ts` (framework-agnostic — verify/cosmetic)
- `README.md` (root, "# Moon React" → Solid), `packages/README.md` (published)
- `packages/CHANGELOG.md`, `.changeset/config.json`
- `packages/src/components/*.tsx` (the Solid source the CLI ships + copies)
- `packages/dist/` (built output the dry-run ships; index.jsx is the solid condition)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The whole Solid lib (Phases 1-6) — CLI ships it, README documents it, dry-run packs it
- Phase-1 dual build (index.js + index.jsx + index.d.ts) — the dry-run tarball + smoke consumer validate it
- changeset tooling already configured (.changeset/config.json, @changesets/cli dep)

### Established Patterns
- package.json files[] ships dist+cli+bin+src+README+LICENSE
- exports.solid → dist/index.jsx (mandatory condition)

### Integration Points
- bin field → bin/moon-solid → cli/index.ts → add.ts copies src components
- npm publish --dry-run packs files[]; smoke consumer resolves exports.solid

</code_context>

<deferred>
## Deferred Ideas

- Actual `npm publish` (real release) — out of scope; only dry-run. Real publish is a human/CI action post-milestone.
- Repo rename (tryfusion-co/moon) — out of scope (PROJECT.md: keep repo name).
- chromatic CI workflow updates / .github workflows — note if encountered but not required for the dry-run gate.
- SolidStart SSR consumer verification — v2 (ENH-02).
- React package release branch / parallel maintenance — out of scope (hard cut).

</deferred>

---

*Phase: 07-cli-release*
*Context gathered: 2026-06-01*
