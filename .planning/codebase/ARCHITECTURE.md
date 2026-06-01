# Architecture

**Analysis Date:** 2026-06-01

## System Overview

```text
┌──────────────────────────────────────────────────────────────┐
│              React Component Library (NPM Package)            │
│         @moondesignsystem/react (v2.5.21)                    │
├──────────────────────────────────────────────────────────────┤
│  Components Layer                                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 34 UI Components (Button, Alert, Accordion, etc.)      │  │
│  │ `packages/src/components/*.tsx`                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                           ↓                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Shared Infrastructure Layer                            │  │
│  │ ┌─────────────────┬──────────────┬──────────────────┐ │  │
│  │ │ Types           │ Helpers      │ Icons (SVGs)     │ │  │
│  │ │ packages/src/   │ packages/src/│ packages/src/    │ │  │
│  │ │ types/index.ts  │ helpers/     │ assets/icons/    │ │  │
│  │ └─────────────────┴──────────────┴──────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                           ↓                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Moon UI CSS Framework (External Dependency)            │  │
│  │ Provides BEM-style Moon Design System classes          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│              Distribution & Installation Layer               │
├──────────────────────────────────────────────────────────────┤
│  NPM Package Export      │  CLI Scaffolding                  │
│  (Full lib import)       │  (Selective components)          │
│                          │                                   │
│  packages/dist/          │  packages/cli/ + bin/            │
│  packages/src/index.ts   │  Component scaffolding tool      │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│              Documentation & Development                     │
├──────────────────────────────────────────────────────────────┤
│  Storybook (docs/)       │  Jest Tests (packages/src/tests/)│
│  docs/stories/           │  Unit tests for components       │
│  Component showcases     │  React Testing Library           │
└──────────────────────────────────────────────────────────────┘
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

**Overall:** Composable Component Library with Utility-First Styling

**Key Characteristics:**
- **Functional Components**: Pure React functional components with no class-based patterns
- **Compound Components**: Multi-part components like Alert (Alert.Close, Alert.Content, Alert.Meta)
- **Props-Based Theming**: Variant, Size, and Context props mapped to BEM CSS classes
- **CSS Class Composition**: All styling delegated to external Moon UI CSS framework (not inline styles or CSS-in-JS)
- **Dependency Management**: CLI automatically copies selected components with their internal dependencies (types, helpers, icons)
- **Tree-Shaking Optimized**: Barrel file with named exports for each component + types

## Layers

**Components Layer:**
- Purpose: Provide 34+ reusable, composable React components
- Location: `packages/src/components/`
- Contains: `.tsx` files implementing UI components (Button, Alert, Input, Select, etc.)
- Depends on: Type definitions, helper utilities, SVG icons, React
- Used by: Applications importing from npm package or via CLI scaffolding

**Shared Infrastructure Layer:**
- Purpose: Provide common types, utilities, and assets used across components
- Location: `packages/src/helpers/`, `packages/src/types/`, `packages/src/assets/`
- Contains: Type definitions (Sizes, Variants, Contexts), class merging utility, SVG icon components
- Depends on: React (for icons)
- Used by: All components in Components Layer

**CLI & Installation Layer:**
- Purpose: Enable selective component installation and Moon UI CSS integration
- Location: `packages/cli/`, `packages/bin/`
- Contains: Command orchestration, component metadata, dependency resolution
- Depends on: execa (process execution), fs-extra (file operations), prompts (user interaction)
- Used by: npm/yarn package manager during npx invocations

**Distribution & Export Layer:**
- Purpose: Expose components as npm package with dual entry points
- Location: `packages/dist/` (generated), `packages/src/index.ts`
- Contains: Compiled JS/TS, type definitions, ESM/CommonJS exports
- Depends on: Build output from TypeScript compiler
- Used by: End applications

**Documentation Layer:**
- Purpose: Showcase components and document usage via interactive stories
- Location: `docs/stories/`, `docs/.storybook/`
- Contains: Storybook stories for each component, theme configuration
- Depends on: Storybook, React, Moon React library
- Used by: Developers, designers, QA teams

## Data Flow

### Primary Request Path (Full Package Import)

1. **User imports component** → Application imports `Button` from `@moondesignsystem/react` (`packages/dist/index.js`)
2. **Barrel re-exports** → `packages/src/components/index.ts` exports `Button` default and type exports
3. **Component mounts** → `Button.tsx` mounts, receives props (variant, size, context, className)
4. **Class composition** → `mergeClasses()` merges base class `moon-button` with variant/size/context classes
5. **Renders native HTML** → `<button>` element with merged className strings
6. **Styling applied** → Moon UI CSS framework styles the button via class selectors

### Component Scaffolding Path (CLI Installation)

1. **User runs CLI** → `npx @moondesignsystem/react --add button input`
2. **CLI parses args** → `packages/cli/index.ts` identifies requested components
3. **Prompts for Moon CSS** → `initMoonCss()` asks user if they want to install @moondesignsystem/ui
4. **Runs moon-ui installer** → Executes `npx @moondesignsystem/ui` to generate CSS files
5. **Copies components** → `packages/cli/commands/add.ts` recursively copies components + dependencies
6. **Dependency resolution** → For each component, copies its internal deps (types, helpers, icons) using metadata
7. **Files written to project** → `src/components/Button.tsx`, `src/helpers/mergeClasses.ts`, `src/types/index.ts`, etc.

### Test Execution Path

1. **Jest runs** → `npm run test` reads `packages/jest.config.js`
2. **Test setup** → Loads `src/tests/setupTests.ts` which imports `@testing-library/jest-dom`
3. **Test discovery** → Finds all `.test.tsx` files in `src/tests/`
4. **Component rendering** → Test imports component (e.g., `Button`) and renders via React Testing Library
5. **DOM assertions** → Verifies rendered HTML, class names, event handlers via `@testing-library/react` API

### Build Output Path

1. **Build triggered** → `npm run build` (root) or `npm run build` (packages/) runs TypeScript compiler
2. **TypeScript compilation** → `tsc --project tsconfig.build.json` compiles `src/**/*` to `dist/`
3. **Barrel generation (pre-build)** → `npm run barrels` regenerates `src/components/index.ts` from `.tsx` files
4. **Type definitions** → Declaration files (`.d.ts`) generated alongside JS output
5. **Distribution ready** → `dist/` contains compiled JS, source maps, and type definitions for npm publishing

**State Management:**
- No centralized state management (Zustand, Redux, etc.)
- All state is prop-driven from parent component
- Internal component state via React hooks only where needed (not widely used in this library)
- Each component is stateless functional component by default

## Key Abstractions

**Component (Generic UI Element):**
- Purpose: Represents a single reusable UI element
- Examples: `Button.tsx`, `Input.tsx`, `Alert.tsx`, `Dialog.tsx`
- Pattern: Functional component that accepts props, returns JSX, extends native HTML element props

**Compound Component (Multi-Part Composition):**
- Purpose: Group related sub-components under a single namespace (e.g., Alert.Close, Alert.Content)
- Examples: `Alert` (with Close, Content, Meta, Action), `Dialog`, `Drawer`
- Pattern: Parent component wrapped with Object.assign() to attach sub-components as properties

**Props Interface (Props Definition):**
- Purpose: Define typed props for component configuration
- Examples: `ButtonProps`, `AlertProps`, `AlertRootProps`
- Pattern: Type intersection combining native HTML element props + design system-specific props

**Design Token (Type Enum):**
- Purpose: Represent discrete values for design attributes
- Examples: `Sizes` ("xs" | "sm" | "md" | "lg" | "xl" | ...), `Variants` ("fill" | "soft" | "ghost" | "outline"), `Contexts` ("brand" | "neutral" | "positive" | ...)
- Pattern: Union type exported from `types/index.ts`, used to type component props

**Utility Helper (Function):**
- Purpose: Provide reusable utility logic across components
- Examples: `mergeClasses()` - filters falsy values from className arrays
- Pattern: Pure function with no side effects, imported and called by components

**Icon Component (SVG Asset):**
- Purpose: Provide consistent, reusable SVG icons as React components
- Examples: `ChevronDown`, `Close`, `User`, `ChevronLeft`
- Pattern: Functional component that returns SVG JSX, can be used standalone or embedded in other components

## Entry Points

**NPM Package (Full Export):**
- Location: `packages/src/index.ts`
- Triggers: `import { Button } from "@moondesignsystem/react"`
- Responsibilities: Re-exports all components and types from barrel index

**NPM Package Barrel (Component Index):**
- Location: `packages/src/components/index.ts`
- Triggers: Imported by `packages/src/index.ts`
- Responsibilities: Auto-generated barrel that exports all components and their types for tree-shaking

**CLI Entry Point:**
- Location: `packages/cli/index.ts` (or `packages/bin/moon-react`)
- Triggers: `npx @moondesignsystem/react --add button` or `moon-react --add-components`
- Responsibilities: Parse arguments, orchestrate Moon UI CSS installation, delegate to add command

**Add Command:**
- Location: `packages/cli/commands/add.ts`
- Triggers: Called by CLI index after Moon CSS init completes
- Responsibilities: Recursively copy selected components and their internal dependencies to user project

**Development Server:**
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

**What happens:** Every component hard-codes Moon UI BEM class names like `moon-button`, `moon-button-lg`, `moon-alert-fill`

**Why it's wrong:** If Moon UI CSS class naming changes, all components break and must be manually updated. No abstraction between component styling intent and CSS framework specifics.

**Do this instead:** Consider extracting class name generation into a utility function (e.g., `getButtonClasses()`) that centralizes BEM class construction. This would allow changes to Moon CSS class naming with a single update point rather than 34+ component files.

### Mandatory Moon UI Dependency

**What happens:** Components export classes from `packages/src/types/` that are always copied even if not needed. Users cannot use components without installing Moon UI CSS.

**Why it's wrong:** Reduces flexibility. Users who want to import Button but style it themselves cannot do so without also receiving Moon UI CSS files. CLI scaffolding ties component selection tightly to CSS installation.

**Do this instead:** Separate component scaffolding from CSS installation. Allow `--add button` without forcing `--add-components` for Moon UI. Document styling approach to support CSS-in-JS or Tailwind without Moon CSS.

## Error Handling

**Strategy:** Minimal error handling at component level; errors bubble up to application. CLI has explicit error messaging.

**Patterns:**
- Components use React.ComponentProps<"button"> to inherit native button error behavior (e.g., prop validation)
- CLI catches errors during Moon UI installation and logs friendly messages via logger object
- File system operations (fs-extra) wrapped in try-catch in add command
- Invalid component names logged to stderr with emoji indicators (❌ for error, ✅ for success)
- Process exits with code 1 on CLI errors (missing components, failed installation)

## Cross-Cutting Concerns

**Logging:** CLI uses singleton logger object (`packages/cli/helpers.ts`) with methods for different message types. Components have no logging.

**Validation:** 
- Component props validated at TypeScript compile time (strict mode enabled)
- CLI validates requested component names against COMPONENTS_META keys
- Moon UI CLI validates Figma token and file IDs if provided

**Authentication:** 
- No authentication in components (stateless UI elements)
- CLI relies on environment variable `FIGMA_TOKEN` for Moon UI customization (optional)
- npm registry authentication handled by package manager, not this library

---

*Architecture analysis: 2026-06-01*
