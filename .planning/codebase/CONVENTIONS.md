# Coding Conventions

**Analysis Date:** 2026-06-01

## Naming Patterns

**Files:**
- Component files: PascalCase (e.g., `Button.tsx`, `Accordion.tsx`, `Alert.tsx`)
- Helper files: camelCase (e.g., `mergeClasses.ts`)
- Test files: match component name with `.test.tsx` suffix (e.g., `Button.test.tsx`, `accordion.test.tsx`)
- Type definition files: `index.ts` in directories (e.g., `src/types/index.ts`)
- Asset/icon files: PascalCase (e.g., `ChevronDown.tsx`, `Close.tsx`)

**Functions:**
- Component functions: PascalCase (e.g., `Button`, `Input`, `Alert`)
- Helper functions: camelCase (e.g., `mergeClasses`, `useDrawerContext`)
- Context hooks: camelCase with `use` prefix (e.g., `useDrawerContext` in `src/components/Drawer.tsx`)
- Subcomponent functions: PascalCase (e.g., `Header`, `Content`, `Action`, `Close` within composed components)

**Variables:**
- State/prop variables: camelCase (e.g., `isOpen`, `isFullWidth`, `initiallyOpen`, `defaultOpen`)
- CSS class strings: kebab-case with `moon-` prefix (e.g., `moon-button`, `moon-alert-soft`, `moon-accordion-lg`)
- Type/constant definitions: PascalCase (e.g., `ButtonSizes`, `AlertVariants`, `DialogContextType`)
- Context objects: PascalCase (e.g., `DrawerContext`, `DialogContext`)

**Types:**
- Component prop types: suffix with `Props` (e.g., `ButtonProps`, `AlertProps`, `InputProps`)
- Specialized prop types: use descriptive names (e.g., `AlertRootProps`, `DrawerTriggerProps`, `ActionProps`)
- Extracted type variants: suffix with `Sizes`, `Variants`, `Contexts` (e.g., `ButtonSizes`, `AlertVariants`, `Contexts`)
- Type constants: uppercase with descriptive naming (e.g., `DEFAULT_DIALOG_CONTEXT`)
- Context type definitions: suffix with `Type` (e.g., `DrawerContextType`, `DialogContextType`)

## Code Style

**Formatting:**
- No explicit formatter configured (no .prettierrc file)
- Follows ES2022+ standards with strict TypeScript
- JSX components use functional component syntax exclusively
- No use of `React.FC` or `React.FunctionComponent` types

**Linting:**
- ESLint installed but no configuration file present (`package.json` lists `eslint` and `eslint-plugin-react-hooks` as devDependencies)
- TypeScript strict mode enabled: `"strict": true` in `tsconfig.json`
- Additional strict options: `forceConsistentCasingInFileNames`, `noFallthroughCasesInSwitch`, `isolatedModules`

## Import Organization

**Order:**
1. React imports (e.g., `import React from "react"`)
2. React sub-library imports (e.g., `import { createContext, useState } from "react"`)
3. Third-party library imports (e.g., `import { createPortal } from "react-dom"`)
4. Internal asset imports (e.g., `import CloseIcon from "../assets/icons/Close"`)
5. Internal helper imports (e.g., `import mergeClasses from "../helpers/mergeClasses"`)
6. Type imports (e.g., `import type { Sizes, Variants, Contexts } from "../types"`)

**Path Aliases:**
- No path aliases configured; relative paths used throughout (e.g., `../helpers/`, `../types/`, `../components/`)
- Imports consistently use relative path traversal patterns

## Error Handling

**Patterns:**
- Custom error throwing in context hooks: `throw new Error("Drawer components must be used within <Drawer>")` (see `src/components/Drawer.tsx:16`)
- Direct property access with optional chaining for refs: `drawerRef?.current?.showModal()` and `drawerRef?.current?.close()`
- No try-catch blocks observed in component implementations; validation occurs at component tree level
- Error boundaries not implemented; relies on React's default error propagation

## Logging

**Framework:** None - no explicit logging framework used
- Components rely on React DevTools and browser console for debugging
- No `console.log`, `console.error`, or dedicated logging service observed

## Comments

**When to Comment:**
- File headers: Auto-generated barrel file comment in `src/components/index.ts` (see lines 1-4)
- Minimal inline comments; code is self-documenting through clear naming
- Type annotations and JSDoc considered more important than code comments

**JSDoc/TSDoc:**
- Not systematically used for components
- `displayName` property used instead for runtime debugging (e.g., `Button.displayName = "Button"`, `Alert.displayName = "Alert"`)
- Type exports documented implicitly through export statements

## Function Design

**Size:**
- Component functions typically 20-40 lines when simple (e.g., `Button` ~25 lines)
- Complex components range 80-140 lines (e.g., `Carousel` 140 lines, `Accordion` 129 lines)
- Helper functions kept minimal (e.g., `mergeClasses` ~20 lines)

**Parameters:**
- Use destructuring in function parameters: `({ className, variant = "fill", size = "md", context = "brand", ...props }: ButtonProps)`
- Spread operator (`...props`) commonly used to forward native HTML attributes
- Default parameters set at destructuring level: `variant = "fill"`, `size = "md"`, `context = "brand"`

**Return Values:**
- Components return JSX directly: `<button className={...} {...props} />`
- Helper functions return primitive values or strings: `mergeClasses` returns `string`
- Conditional rendering uses ternary operators and && patterns: `variant !== "fill" && \`moon-button-${variant}\``

## Module Design

**Exports:**
- Default export of main component: `export default Button`
- Named type exports for size/variant restrictions: `export type ButtonSizes = Extract<Sizes, "xs" | "sm" | "md" | "lg" | "xl">`
- Compound components use `Object.assign` pattern:
  ```typescript
  const Alert = Object.assign(Root, {
    Close,
    Content,
    Action,
    Meta,
  });
  export default Alert;
  ```

**Barrel Files:**
- `src/components/index.ts` is auto-generated by `npm run barrels` script (uses barrelsby package)
- Exports all components and their related types
- Exports base types from `src/types/index.ts`
- Comments indicate: "Auto-generated barrel optimized for tree shaking. Run: npm run barrels"

## Component Composition Patterns

**Compound Components:**
- Root component created with Sub-components assembled via `Object.assign`:
  ```typescript
  Root.displayName = "Dialog";
  Trigger.displayName = "Dialog.Trigger";
  Content.displayName = "Dialog.Content";
  const Dialog = Object.assign(Root, { Trigger, Content, Close, Header });
  export default Dialog;
  ```
- Used for complex UI patterns: Alert, Accordion, Dialog, Drawer, Dropdown, Table, List, Menu, Snackbar
- Enable component nesting: `<Alert><Alert.Content><Alert.Action></Alert.Action></Alert.Content></Alert>`

**Context Usage:**
- React Context used for state management in modal/drawer components
- Context hook pattern for validation: `function useDrawerContext() { const ctx = useContext(DrawerContext); if (!ctx) throw new Error(...) }`
- Portal rendering for modals: `createPortal(<dialog>...</dialog>, document.body)` (see `src/components/Dialog.tsx:29`)

**Class-Based Styling:**
- All styling through className application via `mergeClasses` utility
- CSS class pattern: `moon-{component}` base class plus modifiers
- Modifiers conditionally applied: `size !== "md" && \`moon-button-${size}\``
- Custom className prop always passed last to override: `mergeClasses("moon-button", ..., className)`

---

*Convention analysis: 2026-06-01*
