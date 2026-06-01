<!-- GSD:project-start source:PROJECT.md -->
## Project

**Moon SolidJS Design System**

Moon is a component library / design system shipped as `@moondesignsystem/solid@3.0.0` — a monorepo with a SolidJS component package (`packages/`), a Storybook docs site (`docs/`), and a CLI scaffolder (`bin/moon-solid`). It was migrated in v1.0 from React 19 to SolidJS in-place on `main` (was `@moondesignsystem/react@2.5.21`; hard cut, React abandoned). Consumers are app developers who install Moon components and style them with Tailwind.

**Core Value:** Every existing Moon component renders and behaves identically under SolidJS — same public API surface, same Tailwind class output, same DOM — so consuming apps get a true framework swap, not a redesign.

### Constraints

- **Tech stack**: Target `solid-js@^1.9.13` (current production; 2.0 is experimental). Build via `vite build --lib` + `vite-plugin-solid` (chosen over abandoned `tsup-preset-solid`). Mandatory `solid` export condition in package.json. No headless deps.
- **Compatibility**: Public API (component names, prop names, exported types, class names) must stay identical — consuming apps swap framework only.
- **Compatibility**: Tailwind class output per component must match the React version exactly (verified via tests/Storybook).
- **Process**: In-place rewrite on `main`. Full GSD workflow per phase.
- **Testing**: Every component ships with a Solid test asserting real DOM render + events (component-level E2E via `@solidjs/testing-library`). No mocking own code.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.9.3 - Main implementation language for components, utilities, and CLI
- JSX/TSX - React component syntax used throughout `packages/src/components/` and `docs/stories/`
- JavaScript - Configuration files and build scripts (`packages/scripts/generate-barrel.js`, `packages/bin/moon-react`)
## Runtime
- Node.js 22.19.0 - Specified in `.tool-versions`
- Node.js 22-alpine - Used in Docker container
- npm - Primary package manager with workspaces
- Lockfile: `package-lock.json` present
## Frameworks
- React 19.2.4 - Peer dependency for component library in `packages/package.json`
- React DOM 19.2.4 - Peer dependency for DOM rendering
- Storybook 10.3.3 - Documentation and visual testing framework
- Tailwind CSS 4.2.2 - CSS utility framework in `docs/`
- Moon UI CSS - External Moon Design System CSS classes (composable layer)
- Vite 7.3.1 - Build tool and dev server in `docs/`
- TypeScript 5.9.3 - Compilation to ES2022
- tsx 4.21.0 - TypeScript executor for CLI commands
- @tanstack/react-table 8.21.3 - Headless table library (used in documentation)
## Key Dependencies
- @types/react 19.2.14 - React type definitions
- @types/react-dom 19.2.3 - React DOM type definitions
- @types/node 24.12.0 - Node.js type definitions
- execa 9.6.1 - Process execution for CLI commands
- fs-extra 11.3.4 - Enhanced file system utilities
- @types/fs-extra 11.0.4 - Type definitions for fs-extra
- prompts 2.4.2 - Interactive CLI prompts
- @types/prompts 2.4.9 - Type definitions for prompts
- barrelsby 2.8.1 - Generates barrel files (index.ts) for optimal tree shaking
- Jest 30.3.0 - Test runner
- @testing-library/react 16.3.2 - React testing utilities
- @testing-library/jest-dom 6.9.1 - Jest matchers for DOM
- @testing-library/user-event 14.6.1 - User interaction simulation
- ESLint 9.39.4 - Code linting
- @changesets/cli 2.30.0 - Versioning and changelog management
- chromatic 16.0.0 - Visual regression testing and Storybook deployment
- @chromatic-com/storybook 5.1.1 - Chromatic integration for Storybook
## Configuration
- `.env` file support - For FIGMA_TOKEN (mentioned in README.md)
- Node.js version: 22.19.0 via `.tool-versions`
- NPM workspaces defined in root `package.json` at `packages/` and `docs/`
- `packages/tsconfig.json` - Builds to ES2022, outputs to `dist/`
- `packages/tsconfig.build.json` - Specific build configuration
- `jest.config.js` in `packages/` - jsdom environment, rootDir `src/tests`
- `vite.config.ts` in `docs/` - Vite + React + Tailwind configuration
- `docs/.storybook/main.ts` - Storybook configuration with Chromatic integration
- `packages/.barrelsby.json` - Auto-generates barrel exports for tree shaking
## Platform Requirements
- Node.js 22.19.0
- npm (compatible with Node 22.x)
- TypeScript 5.9.3 (dev dependency)
- Optional: FIGMA_TOKEN for Moon UI CSS customization
- Node 22-alpine (Docker)
- Static Storybook build output deployed via Vercel or Docker
- Docker image published to Docker Hub (heathmont/moon-react-docs)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Component files: PascalCase (e.g., `Button.tsx`, `Accordion.tsx`, `Alert.tsx`)
- Helper files: camelCase (e.g., `mergeClasses.ts`)
- Test files: match component name with `.test.tsx` suffix (e.g., `Button.test.tsx`, `accordion.test.tsx`)
- Type definition files: `index.ts` in directories (e.g., `src/types/index.ts`)
- Asset/icon files: PascalCase (e.g., `ChevronDown.tsx`, `Close.tsx`)
- Component functions: PascalCase (e.g., `Button`, `Input`, `Alert`)
- Helper functions: camelCase (e.g., `mergeClasses`, `useDrawerContext`)
- Context hooks: camelCase with `use` prefix (e.g., `useDrawerContext` in `src/components/Drawer.tsx`)
- Subcomponent functions: PascalCase (e.g., `Header`, `Content`, `Action`, `Close` within composed components)
- State/prop variables: camelCase (e.g., `isOpen`, `isFullWidth`, `initiallyOpen`, `defaultOpen`)
- CSS class strings: kebab-case with `moon-` prefix (e.g., `moon-button`, `moon-alert-soft`, `moon-accordion-lg`)
- Type/constant definitions: PascalCase (e.g., `ButtonSizes`, `AlertVariants`, `DialogContextType`)
- Context objects: PascalCase (e.g., `DrawerContext`, `DialogContext`)
- Component prop types: suffix with `Props` (e.g., `ButtonProps`, `AlertProps`, `InputProps`)
- Specialized prop types: use descriptive names (e.g., `AlertRootProps`, `DrawerTriggerProps`, `ActionProps`)
- Extracted type variants: suffix with `Sizes`, `Variants`, `Contexts` (e.g., `ButtonSizes`, `AlertVariants`, `Contexts`)
- Type constants: uppercase with descriptive naming (e.g., `DEFAULT_DIALOG_CONTEXT`)
- Context type definitions: suffix with `Type` (e.g., `DrawerContextType`, `DialogContextType`)
## Code Style
- No explicit formatter configured (no .prettierrc file)
- Follows ES2022+ standards with strict TypeScript
- JSX components use functional component syntax exclusively
- No use of `React.FC` or `React.FunctionComponent` types
- ESLint installed but no configuration file present (`package.json` lists `eslint` and `eslint-plugin-react-hooks` as devDependencies)
- TypeScript strict mode enabled: `"strict": true` in `tsconfig.json`
- Additional strict options: `forceConsistentCasingInFileNames`, `noFallthroughCasesInSwitch`, `isolatedModules`
## Import Organization
- No path aliases configured; relative paths used throughout (e.g., `../helpers/`, `../types/`, `../components/`)
- Imports consistently use relative path traversal patterns
## Error Handling
- Custom error throwing in context hooks: `throw new Error("Drawer components must be used within <Drawer>")` (see `src/components/Drawer.tsx:16`)
- Direct property access with optional chaining for refs: `drawerRef?.current?.showModal()` and `drawerRef?.current?.close()`
- No try-catch blocks observed in component implementations; validation occurs at component tree level
- Error boundaries not implemented; relies on React's default error propagation
## Logging
- Components rely on React DevTools and browser console for debugging
- No `console.log`, `console.error`, or dedicated logging service observed
## Comments
- File headers: Auto-generated barrel file comment in `src/components/index.ts` (see lines 1-4)
- Minimal inline comments; code is self-documenting through clear naming
- Type annotations and JSDoc considered more important than code comments
- Not systematically used for components
- `displayName` property used instead for runtime debugging (e.g., `Button.displayName = "Button"`, `Alert.displayName = "Alert"`)
- Type exports documented implicitly through export statements
## Function Design
- Component functions typically 20-40 lines when simple (e.g., `Button` ~25 lines)
- Complex components range 80-140 lines (e.g., `Carousel` 140 lines, `Accordion` 129 lines)
- Helper functions kept minimal (e.g., `mergeClasses` ~20 lines)
- Use destructuring in function parameters: `({ className, variant = "fill", size = "md", context = "brand", ...props }: ButtonProps)`
- Spread operator (`...props`) commonly used to forward native HTML attributes
- Default parameters set at destructuring level: `variant = "fill"`, `size = "md"`, `context = "brand"`
- Components return JSX directly: `<button className={...} {...props} />`
- Helper functions return primitive values or strings: `mergeClasses` returns `string`
- Conditional rendering uses ternary operators and && patterns: `variant !== "fill" && \`moon-button-${variant}\``
## Module Design
- Default export of main component: `export default Button`
- Named type exports for size/variant restrictions: `export type ButtonSizes = Extract<Sizes, "xs" | "sm" | "md" | "lg" | "xl">`
- Compound components use `Object.assign` pattern:
- `src/components/index.ts` is auto-generated by `npm run barrels` script (uses barrelsby package)
- Exports all components and their related types
- Exports base types from `src/types/index.ts`
- Comments indicate: "Auto-generated barrel optimized for tree shaking. Run: npm run barrels"
## Component Composition Patterns
- Root component created with Sub-components assembled via `Object.assign`:
- Used for complex UI patterns: Alert, Accordion, Dialog, Drawer, Dropdown, Table, List, Menu, Snackbar
- Enable component nesting: `<Alert><Alert.Content><Alert.Action></Alert.Action></Alert.Content></Alert>`
- React Context used for state management in modal/drawer components
- Context hook pattern for validation: `function useDrawerContext() { const ctx = useContext(DrawerContext); if (!ctx) throw new Error(...) }`
- Portal rendering for modals: `createPortal(<dialog>...</dialog>, document.body)` (see `src/components/Dialog.tsx:29`)
- All styling through className application via `mergeClasses` utility
- CSS class pattern: `moon-{component}` base class plus modifiers
- Modifiers conditionally applied: `size !== "md" && \`moon-button-${size}\``
- Custom className prop always passed last to override: `mergeClasses("moon-button", ..., className)`
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## System Overview
```text
```
## Component Responsibilities
| Component | Responsibility | File |
|-----------|----------------|------|
| Button | Basic clickable button with variant/size/context props | `packages/src/components/Button.tsx` |
| Alert | Compound component (alert + subcomponents) for notifications | `packages/src/components/Alert.tsx` |
| 34+ UI Components | Individual UI elements (Input, Select, Dialog, etc.) | `packages/src/components/*.tsx` |
| mergeClasses | Utility to merge className strings with falsy filtering | `packages/src/helpers/mergeClasses.ts` |
| SVG Icons | Reusable SVG icon components (ChevronDown, Close, User) | `packages/src/assets/icons/*.tsx` |
| Type Exports | Design system type definitions (Sizes, Variants, Contexts) | `packages/src/types/index.ts` |
| Barrel Export | Auto-generated index for tree-shaking optimization | `packages/src/components/index.ts` |
| CLI Tool | Component scaffolding and installation orchestrator | `packages/cli/index.ts` |
| Add Command | Copies selected components and dependencies to user project | `packages/cli/commands/add.ts` |
## Pattern Overview
- **Functional Components**: Pure React functional components with no class-based patterns
- **Compound Components**: Multi-part components like Alert (Alert.Close, Alert.Content, Alert.Meta)
- **Props-Based Theming**: Variant, Size, and Context props mapped to BEM CSS classes
- **CSS Class Composition**: All styling delegated to external Moon UI CSS framework (not inline styles or CSS-in-JS)
- **Dependency Management**: CLI automatically copies selected components with their internal dependencies (types, helpers, icons)
- **Tree-Shaking Optimized**: Barrel file with named exports for each component + types
## Layers
- Purpose: Provide 34+ reusable, composable React components
- Location: `packages/src/components/`
- Contains: `.tsx` files implementing UI components (Button, Alert, Input, Select, etc.)
- Depends on: Type definitions, helper utilities, SVG icons, React
- Used by: Applications importing from npm package or via CLI scaffolding
- Purpose: Provide common types, utilities, and assets used across components
- Location: `packages/src/helpers/`, `packages/src/types/`, `packages/src/assets/`
- Contains: Type definitions (Sizes, Variants, Contexts), class merging utility, SVG icon components
- Depends on: React (for icons)
- Used by: All components in Components Layer
- Purpose: Enable selective component installation and Moon UI CSS integration
- Location: `packages/cli/`, `packages/bin/`
- Contains: Command orchestration, component metadata, dependency resolution
- Depends on: execa (process execution), fs-extra (file operations), prompts (user interaction)
- Used by: npm/yarn package manager during npx invocations
- Purpose: Expose components as npm package with dual entry points
- Location: `packages/dist/` (generated), `packages/src/index.ts`
- Contains: Compiled JS/TS, type definitions, ESM/CommonJS exports
- Depends on: Build output from TypeScript compiler
- Used by: End applications
- Purpose: Showcase components and document usage via interactive stories
- Location: `docs/stories/`, `docs/.storybook/`
- Contains: Storybook stories for each component, theme configuration
- Depends on: Storybook, React, Moon React library
- Used by: Developers, designers, QA teams
## Data Flow
### Primary Request Path (Full Package Import)
### Component Scaffolding Path (CLI Installation)
### Test Execution Path
### Build Output Path
- No centralized state management (Zustand, Redux, etc.)
- All state is prop-driven from parent component
- Internal component state via React hooks only where needed (not widely used in this library)
- Each component is stateless functional component by default
## Key Abstractions
- Purpose: Represents a single reusable UI element
- Examples: `Button.tsx`, `Input.tsx`, `Alert.tsx`, `Dialog.tsx`
- Pattern: Functional component that accepts props, returns JSX, extends native HTML element props
- Purpose: Group related sub-components under a single namespace (e.g., Alert.Close, Alert.Content)
- Examples: `Alert` (with Close, Content, Meta, Action), `Dialog`, `Drawer`
- Pattern: Parent component wrapped with Object.assign() to attach sub-components as properties
- Purpose: Define typed props for component configuration
- Examples: `ButtonProps`, `AlertProps`, `AlertRootProps`
- Pattern: Type intersection combining native HTML element props + design system-specific props
- Purpose: Represent discrete values for design attributes
- Examples: `Sizes` ("xs" | "sm" | "md" | "lg" | "xl" | ...), `Variants` ("fill" | "soft" | "ghost" | "outline"), `Contexts` ("brand" | "neutral" | "positive" | ...)
- Pattern: Union type exported from `types/index.ts`, used to type component props
- Purpose: Provide reusable utility logic across components
- Examples: `mergeClasses()` - filters falsy values from className arrays
- Pattern: Pure function with no side effects, imported and called by components
- Purpose: Provide consistent, reusable SVG icons as React components
- Examples: `ChevronDown`, `Close`, `User`, `ChevronLeft`
- Pattern: Functional component that returns SVG JSX, can be used standalone or embedded in other components
## Entry Points
- Location: `packages/src/index.ts`
- Triggers: `import { Button } from "@moondesignsystem/react"`
- Responsibilities: Re-exports all components and types from barrel index
- Location: `packages/src/components/index.ts`
- Triggers: Imported by `packages/src/index.ts`
- Responsibilities: Auto-generated barrel that exports all components and their types for tree-shaking
- Location: `packages/cli/index.ts` (or `packages/bin/moon-react`)
- Triggers: `npx @moondesignsystem/react --add button` or `moon-react --add-components`
- Responsibilities: Parse arguments, orchestrate Moon UI CSS installation, delegate to add command
- Location: `packages/cli/commands/add.ts`
- Triggers: Called by CLI index after Moon CSS init completes
- Responsibilities: Recursively copy selected components and their internal dependencies to user project
- Location: `docs/.storybook/` (Storybook config)
- Triggers: `npm run dev` (root level or docs workspace)
- Responsibilities: Launch Storybook dev server on port 6006, hot-reload story changes
## Architectural Constraints
- **Threading:** Single-threaded JavaScript event loop (Node.js for CLI, browser for components)
- **Global state:** No shared mutable global state within components themselves; CLI maintains `copied` Set to track copied components per invocation
- **Circular imports:** None detected; clean dependency hierarchy (components → helpers/types/icons, never reverse)
- **Module-level singletons:** Logger object in `packages/cli/helpers.ts` is a singleton-like frozen object (not a true singleton class)
- **Styling coupling:** All components are tightly coupled to Moon UI CSS class naming (BEM-style `moon-{component}-{modifier}`); cannot be styled via CSS-in-JS or inline styles
- **React version:** Peer dependency `react ^19.2.4` required; uses React 19+ JSX transform (no `import React` needed in newer files)
- **TypeScript target:** ES2020 for build (tsconfig.build.json), ES2022 for development (tsconfig.json)
## Anti-Patterns
### Hard-Coded CSS Class Names
### Mandatory Moon UI Dependency
## Error Handling
- Components use React.ComponentProps<"button"> to inherit native button error behavior (e.g., prop validation)
- CLI catches errors during Moon UI installation and logs friendly messages via logger object
- File system operations (fs-extra) wrapped in try-catch in add command
- Invalid component names logged to stderr with emoji indicators (❌ for error, ✅ for success)
- Process exits with code 1 on CLI errors (missing components, failed installation)
## Cross-Cutting Concerns
- Component props validated at TypeScript compile time (strict mode enabled)
- CLI validates requested component names against COMPONENTS_META keys
- Moon UI CLI validates Figma token and file IDs if provided
- No authentication in components (stateless UI elements)
- CLI relies on environment variable `FIGMA_TOKEN` for Moon UI customization (optional)
- npm registry authentication handled by package manager, not this library
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
