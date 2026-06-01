# Technology Stack

**Analysis Date:** 2026-06-01

## Languages

**Primary:**
- TypeScript 5.9.3 - Main implementation language for components, utilities, and CLI
- JSX/TSX - React component syntax used throughout `packages/src/components/` and `docs/stories/`

**Secondary:**
- JavaScript - Configuration files and build scripts (`packages/scripts/generate-barrel.js`, `packages/bin/moon-react`)

## Runtime

**Environment:**
- Node.js 22.19.0 - Specified in `.tool-versions`
- Node.js 22-alpine - Used in Docker container

**Package Manager:**
- npm - Primary package manager with workspaces
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.2.4 - Peer dependency for component library in `packages/package.json`
- React DOM 19.2.4 - Peer dependency for DOM rendering

**Documentation & Storybook:**
- Storybook 10.3.3 - Documentation and visual testing framework
  - @storybook/react-vite - React integration with Vite builder
  - @storybook/addon-docs - Documentation addon
  - @storybook/addon-a11y - Accessibility testing addon
  - @storybook/addon-vitest - Test integration addon
  - @storybook/addon-themes - Theme switching addon
  - @chromatic-com/storybook - Visual regression testing integration

**Styling:**
- Tailwind CSS 4.2.2 - CSS utility framework in `docs/`
  - @tailwindcss/vite 4.2.2 - Vite plugin for Tailwind
- Moon UI CSS - External Moon Design System CSS classes (composable layer)

**Build & Dev:**
- Vite 7.3.1 - Build tool and dev server in `docs/`
- TypeScript 5.9.3 - Compilation to ES2022
- tsx 4.21.0 - TypeScript executor for CLI commands

**Data/Tables:**
- @tanstack/react-table 8.21.3 - Headless table library (used in documentation)

## Key Dependencies

**Critical:**
- @types/react 19.2.14 - React type definitions
- @types/react-dom 19.2.3 - React DOM type definitions
- @types/node 24.12.0 - Node.js type definitions

**CLI & File Operations:**
- execa 9.6.1 - Process execution for CLI commands
- fs-extra 11.3.4 - Enhanced file system utilities
- @types/fs-extra 11.0.4 - Type definitions for fs-extra
- prompts 2.4.2 - Interactive CLI prompts
- @types/prompts 2.4.9 - Type definitions for prompts

**Build & Code Generation:**
- barrelsby 2.8.1 - Generates barrel files (index.ts) for optimal tree shaking
  - Config: `packages/.barrelsby.json` - Configured to export named defaults and types

**Testing:**
- Jest 30.3.0 - Test runner
  - ts-jest 29.4.6 - TypeScript support for Jest
  - jest-environment-jsdom 30.3.0 - Browser environment simulation
- @testing-library/react 16.3.2 - React testing utilities
- @testing-library/jest-dom 6.9.1 - Jest matchers for DOM
- @testing-library/user-event 14.6.1 - User interaction simulation

**Linting:**
- ESLint 9.39.4 - Code linting
  - eslint-plugin-react-hooks 6.1.1 - React Hooks linting
  - eslint-plugin-react-refresh 0.5.2 - React Fast Refresh validation

**Release & Versioning:**
- @changesets/cli 2.30.0 - Versioning and changelog management
  - Config: `.changeset/` directory for tracking unreleased changes

**CI/CD Integration:**
- chromatic 16.0.0 - Visual regression testing and Storybook deployment
- @chromatic-com/storybook 5.1.1 - Chromatic integration for Storybook

## Configuration

**Environment:**
- `.env` file support - For FIGMA_TOKEN (mentioned in README.md)
- Node.js version: 22.19.0 via `.tool-versions`
- NPM workspaces defined in root `package.json` at `packages/` and `docs/`

**Build:**
- `packages/tsconfig.json` - Builds to ES2022, outputs to `dist/`
- `packages/tsconfig.build.json` - Specific build configuration
- `jest.config.js` in `packages/` - jsdom environment, rootDir `src/tests`
- `vite.config.ts` in `docs/` - Vite + React + Tailwind configuration
- `docs/.storybook/main.ts` - Storybook configuration with Chromatic integration

**Code Generation:**
- `packages/.barrelsby.json` - Auto-generates barrel exports for tree shaking
  - Excludes test/spec/stories files
  - Exports components as named defaults and types
  - Run via: `npm run barrels` → `scripts/generate-barrel.js`

## Platform Requirements

**Development:**
- Node.js 22.19.0
- npm (compatible with Node 22.x)
- TypeScript 5.9.3 (dev dependency)
- Optional: FIGMA_TOKEN for Moon UI CSS customization

**Production:**
- Node 22-alpine (Docker)
- Static Storybook build output deployed via Vercel or Docker
- Docker image published to Docker Hub (heathmont/moon-react-docs)

---

*Stack analysis: 2026-06-01*
