# Codebase Structure

**Analysis Date:** 2026-06-01

## Directory Layout

```
moon-react-monorepo/
├── packages/                   # Core React component library
│   ├── src/
│   │   ├── components/         # 34 UI components (main exports)
│   │   ├── helpers/            # Shared utility functions
│   │   ├── types/              # Design system type definitions
│   │   ├── assets/icons/       # Reusable SVG icon components
│   │   ├── tests/              # Jest unit tests for components
│   │   └── index.ts            # Main entry point
│   ├── cli/                    # CLI tool for selective component scaffolding
│   │   ├── commands/           # CLI command implementations
│   │   ├── index.ts            # CLI orchestrator
│   │   ├── components-meta.ts  # Component dependency metadata
│   │   ├── helpers.ts          # CLI utilities (logging, prompts, execution)
│   │   └── directories-constants.ts  # Resolved path constants
│   ├── bin/                    # Executable bin script
│   │   └── moon-react          # Entry point for npx moon-react
│   ├── scripts/                # Build and generation scripts
│   │   └── generate-barrel.js  # Auto-generates barrel index
│   ├── dist/                   # Compiled output (generated)
│   ├── package.json            # Package metadata and scripts
│   ├── jest.config.js          # Jest test configuration
│   ├── tsconfig.json           # TypeScript configuration (dev)
│   └── tsconfig.build.json     # TypeScript configuration (build)
│
├── docs/                       # Storybook documentation site
│   ├── stories/                # Component story files
│   │   └── components/         # Individual component stories
│   ├── .storybook/             # Storybook configuration
│   ├── package.json            # Docs workspace dependencies
│   ├── vite.config.ts          # Vite dev server config
│   └── tsconfig.json           # TypeScript config for docs
│
├── .planning/                  # GSD planning documents (generated)
│   └── codebase/               # Architecture, structure, testing docs
│
├── .changeset/                 # Changesets for version management
├── .github/                    # GitHub workflows and config
├── .vscode/                    # VS Code workspace settings
├── .serena/                    # Serena agent state (GSD internal)
├── package.json                # Root workspace package.json
├── package-lock.json           # Locked dependencies
├── moonconfig.json             # Moon config file
├── Dockerfile                  # Docker build config
├── README.md                   # Project README
└── LICENSE                     # MIT License file
```

## Directory Purposes

**packages/src/components/:**
- Purpose: Main UI component library (34+ components)
- Contains: `.tsx` files, each exporting a single React functional component
- Key files: `Button.tsx`, `Alert.tsx`, `Input.tsx`, `Dialog.tsx`, `Accordion.tsx`, etc.
- Notable: Auto-generated `index.ts` barrel export

**packages/src/helpers/:**
- Purpose: Shared utility functions used across components
- Contains: Pure utility functions, no React components
- Key files: `mergeClasses.ts` (class string merging with falsy filtering)

**packages/src/types/:**
- Purpose: Design system type definitions (design tokens)
- Contains: TypeScript type/interface exports only
- Key files: `index.ts` (exports Sizes, Variants, Contexts, Directions, Positions unions)

**packages/src/assets/icons/:**
- Purpose: Reusable SVG icon components
- Contains: React functional components that render SVG elements
- Key files: `ChevronDown.tsx`, `ChevronLeft.tsx`, `ChevronRight.tsx`, `Close.tsx`, `User.tsx`

**packages/src/tests/:**
- Purpose: Unit tests for components
- Contains: Jest test files (`.test.tsx`) using React Testing Library
- Key files: Test file for each component (e.g., `Button.test.tsx`, `Alert.test.tsx`)
- Setup: `setupTests.ts` imports `@testing-library/jest-dom` for DOM matchers

**packages/cli/:**
- Purpose: Command-line interface for selective component installation
- Contains: TypeScript files that execute during `npx @moondesignsystem/react` invocation
- Key files:
  - `index.ts` - main CLI orchestrator, arg parsing
  - `commands/add.ts` - recursive component copying logic
  - `components-meta.ts` - metadata about components and their internal dependencies
  - `helpers.ts` - logger, prompt utilities, Moon UI installer
  - `directories-constants.ts` - resolved absolute paths to src directories

**packages/bin/:**
- Purpose: Executable wrapper for CLI invocation
- Contains: Single shell script that spawns tsx to run CLI TypeScript code
- Key files: `moon-react` - executable that users run via npx

**packages/scripts/:**
- Purpose: Build-time scripts for code generation
- Contains: Node.js scripts that generate or transform code
- Key files: `generate-barrel.js` - auto-generates `src/components/index.ts` barrel file before build

**packages/dist/:**
- Purpose: Compiled distribution output
- Contains: Compiled JavaScript, type definitions, source maps (generated by TypeScript compiler)
- Key files: `index.js`, `index.d.ts` (entry points), compiled component files
- Generated by: `npm run build` (TypeScript tsc)

**docs/stories/:**
- Purpose: Storybook component stories and documentation
- Contains: `.stories.tsx` files, one per component
- Key files: `components/Button.stories.tsx`, `components/Alert.stories.tsx`, etc.

**docs/.storybook/:**
- Purpose: Storybook configuration and theme setup
- Contains: Storybook configuration files, custom middleware/addons
- Key files: `main.ts`, `preview.ts`, custom theme config

## Key File Locations

**Entry Points:**
- `packages/src/index.ts` - Main npm package export (re-exports from components/index.ts)
- `packages/cli/index.ts` - CLI orchestrator entry point
- `packages/bin/moon-react` - Executable entry point for npx

**Configuration:**
- `packages/package.json` - NPM package metadata, scripts, dependencies
- `packages/tsconfig.json` - Development TypeScript config (noEmit: true)
- `packages/tsconfig.build.json` - Build TypeScript config (outputs to dist/)
- `packages/jest.config.js` - Jest test runner configuration
- `docs/.storybook/main.ts` - Storybook build/dev configuration

**Core Logic:**
- `packages/src/components/` - All 34 UI components
- `packages/src/types/index.ts` - Design token type definitions
- `packages/src/helpers/mergeClasses.ts` - Core utility function
- `packages/cli/commands/add.ts` - Component scaffolding logic

**Testing:**
- `packages/src/tests/` - Jest unit tests (19 test files)
- `packages/jest.config.js` - Jest runner config

**Build Output:**
- `packages/dist/` - Compiled JavaScript, type definitions, source maps

## Naming Conventions

**Files:**
- Components: PascalCase (Button.tsx, Alert.tsx, Input.tsx)
- Tests: match component name + .test.tsx (Button.test.tsx)
- Stories: match component name + .stories.tsx (Button.stories.tsx)
- Helpers: camelCase (mergeClasses.ts)
- Icons: PascalCase (ChevronDown.tsx, Close.tsx)
- Utilities: camelCase (helpers.ts, generate-barrel.js)

**Directories:**
- Plural for collections (components/, helpers/, assets/, tests/, stories/)
- Descriptive for features (icons/ under assets/, commands/ under cli/)

**TypeScript:**
- Component types: `{ComponentName}Props`, `{ComponentName}Variants`, `{ComponentName}Sizes` (e.g., ButtonProps, ButtonVariants)
- Root props: `{ComponentName}RootProps` for compound component root (e.g., AlertRootProps)
- Utility functions: camelCase (e.g., mergeClasses, initMoonCss)
- Constants: UPPER_SNAKE_CASE (e.g., COMPONENTS_META, MOON_REACT_ARGS)
- CSS class names: Derived from Moon UI BEM convention `moon-{component}-{modifier}` (e.g., moon-button, moon-button-lg)

**Exports:**
- Components: Default export (e.g., `export default Button`)
- Types: Named exports (e.g., `export type ButtonVariants`)
- Sub-components: Attached via Object.assign (e.g., `Alert.Close`, `Alert.Content`)

## Where to Add New Code

**New UI Component:**
1. Create file: `packages/src/components/MyComponent.tsx`
2. Define props type: Extend React.ComponentProps<"element"> + design token props
3. Use mergeClasses() for conditional class composition
4. Export component as default + any Size/Variant/Context type exports
5. Add displayName: `MyComponent.displayName = "MyComponent"`
6. Add to COMPONENTS_META in `packages/cli/components-meta.ts` with internal dependencies
7. Create test: `packages/src/tests/MyComponent.test.tsx` using React Testing Library
8. Create story: `docs/stories/components/MyComponent.stories.tsx` for Storybook
9. Run barrel generation: `npm run barrels` (auto-updates src/components/index.ts)

**New Helper Utility:**
1. Create file: `packages/src/helpers/myHelper.ts`
2. Implement pure function (no side effects, no React hooks)
3. Export as default and named export
4. Add to COMPONENTS_META dependencies if components use it (destPath: "src/helpers")
5. Import in components that need it: `import myHelper from "../helpers/myHelper"`

**New SVG Icon:**
1. Create file: `packages/src/assets/icons/MyIcon.tsx`
2. Functional component that returns SVG JSX
3. Export as default
4. Add to COMPONENTS_META if components depend on it (destPath: "src/assets/icons")
5. Import in component: `import MyIcon from "../assets/icons/MyIcon"`

**New CLI Feature:**
1. Create file: `packages/cli/commands/myCommand.ts`
2. Export default async function that receives args
3. Call from `packages/cli/index.ts` by parsing MOON_REACT_ARGS enum
4. Use logger object from helpers.ts for user feedback
5. Test manually: `npx tsx packages/cli/index.ts --my-flag`

**New Test:**
1. Create file: `packages/src/tests/MyComponent.test.tsx`
2. Import component: `import MyComponent from "../components/MyComponent"`
3. Use React Testing Library: `render()`, `screen.getByRole()`, etc.
4. Use jest matchers: `expect(el).toHaveClass("moon-component")`
5. Run: `npm run test` (root workspace runs all tests)

**New Story:**
1. Create file: `docs/stories/components/MyComponent.stories.tsx`
2. Use Storybook 7+ format with Meta + Story exports
3. Define variants as different stories
4. Import component from `@moondesignsystem/react`
5. Stories auto-discovered by Storybook dev server

## Special Directories

**packages/dist/:**
- Purpose: Generated distribution build output
- Generated: Yes (by `npm run build` → TypeScript tsc)
- Committed: No (in .gitignore)
- Contents: Compiled JS, declaration files (.d.ts), source maps

**packages/cli/:**
- Purpose: CLI tool that runs during npm package initialization
- Generated: No
- Committed: Yes
- Contents: TypeScript that executes on user's machine via npx

**docs/.storybook/:**
- Purpose: Storybook framework configuration
- Generated: No
- Committed: Yes
- Contents: Config files for build system integration, theme customization, addon setup

**.planning/codebase/:**
- Purpose: GSD (Get Stuff Done) agent analysis documents
- Generated: Yes (by /gsd-map-codebase command)
- Committed: Yes (tracked in git)
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md

**.changeset/:**
- Purpose: Version and changelog management via changesets
- Generated: Yes (by `changeset add` command)
- Committed: Yes
- Contents: `.md` files describing changes for next release

---

*Structure analysis: 2026-06-01*
