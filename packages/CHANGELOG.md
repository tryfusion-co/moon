# @moondesignsystem/solid

## 3.1.0

### Minor Changes

- Use SSR safe exports for components

## 3.0.0

### Major Changes

- **BREAKING**: Migrated from React to SolidJS. The package has been renamed from `@moondesignsystem/react` to `@moondesignsystem/solid` and the version has been bumped to `3.0.0`.

  **What changed:**

  - **Package rename**: Replace `@moondesignsystem/react` with `@moondesignsystem/solid` in your `package.json`.
  - **Peer dependency**: `react` and `react-dom` peer deps have been removed. The new peer dependency is `solid-js@^1.9.13`.
  - **`class` replaces `className`**: All components now accept `class` instead of `className`, following SolidJS conventions. Update all JSX usages accordingly.
  - **Public API preserved**: Component names, prop names, exported types, and Tailwind class output are identical to the React version. This is a true framework swap, not a redesign.
  - **Drawer/BottomSheet/Dropdown triggers**: Trigger components now use a `display:contents` wrapper `<span>` to attach the open/close handler, instead of React's `cloneElement`. This introduces one additional layout-invisible DOM node per trigger. The visual and layout output is unchanged.
  - **Chip uncontrolled toggle improved**: When `Chip` is used without a controlled `isActive` prop, clicking it now correctly toggles the active state. In the React version this was dead code (clicking never activated the chip when uncontrolled); this is an intentional behavior improvement in the Solid port.
  - **`solid` export condition**: The package exports a `solid` condition (`dist/index.jsx`) containing raw JSX source for SolidStart/Vite consumers using `vite-plugin-solid`. Standard bundlers use the `import` condition (`dist/index.js`, pre-compiled) and require no extra configuration.
  - **CLI bin renamed**: The CLI scaffolding binary is now `moon-solid` (was `moon-react`). Usage: `npx @moondesignsystem/solid --add button`.

## 2.5.21

### Patch Changes

- fix: update packages

## 2.5.20

### Patch Changes

- feat: add funding to the package

## 2.5.19

### Patch Changes

- fix: add missing dist folder

## 2.5.18

### Patch Changes

- fix: update moon-ui to latest
- 3d394a8: feat: add tests for BottomSheet, CircularProgress, Tag and Badge components

## 2.5.0

### Minor Changes

- feat: update all components, prepare to open-source

## 2.4.0

### Minor Changes

- feat: improve BottomSheet, Drawer, Dropdown

## 2.3.0

### Minor Changes

- feat: improve CircularProgress and LinearProgress

## 2.2.0

### Minor Changes

- feat: improve form components

## 2.1.1

### Patch Changes

- fix: add tests to Alert, Snackbar and Tooltip [MDS-2014], [MDS-2016] and [MDS-2018]

## 2.1.0

### Minor Changes

- feat: improve Accordion, Alert, Carousel, List, Snackbar, Tooltip

### Patch Changes

- 1dbb682: feat: add UI tests for Menu and Breadcrumbs
- 6474b8d: feat: add tests for TabList and Pagination
- 606f128: feat: add testing tool

## 2.0.5

### Patch Changes

- 606f128: feat: add testing tool
- fix: add tests - accordion [MDS-2004]

## 2.0.4

### Patch Changes

- fix: BottomSheet styling

## 2.0.3

### Patch Changes

- fix: remove unnecessary Alert.Header

## 2.0.2

### Patch Changes

- fix: update package.json file

## 2.0.1

### Patch Changes

- fix: update README file

## 2.0.0

### Major Changes

- feat: introduce Compound Pattern to components

## 1.4.1

### Patch Changes

- fix: remove React from dependencies

## 1.4.0

### Minor Changes

- feat: rebuild type definitions

## 1.3.1

### Patch Changes

- fix: type build issue

## 1.3.0

### Minor Changes

- feat: add types exportable

## 1.2.0

### Minor Changes

- add controls functionality [MDS-1983]

## 1.1.0

### Minor Changes

- feat: aligin moon-react cli with moon-ui

## 1.0.4

### Patch Changes

- fix: constans build

## 1.0.3

### Patch Changes

- fix: add constantsHelper to cli

## 1.0.2

### Patch Changes

- fix: package files

## 1.0.1

### Patch Changes

- fix: cli commands

## 1.0.0

### Major Changes

- feat: add context to Alert, Snackbar, Badge, Tag, Button, IconButton

## 0.10.0

### Minor Changes

- feat: updated components to new concept

## 0.9.0

### Minor Changes

- feat: update Authenticator, Breadcrumb, Dialog, Drawer, Dropdown, IconButton, Menu, Pagination, TabList, Snackbar, Carousel

## 0.8.0

### Minor Changes

- feat: update BottomSheet, Dialog, Drawer, Dropdown

## 0.7.0

### Minor Changes

- feat: update Badge, CircularProgress, LinearProgress, Loader, Placeholder, Tag

## 0.6.0

### Minor Changes

- feat: update SegmentedControl, Select, Switch, Textarea

## 0.5.0

### Minor Changes

- feat: update Authenticator, Checkbox, Chip, Input, Radio

## 0.4.0

### Minor Changes

- feat: update Alert, Snackbar, Tooltip

## 0.3.0

### Minor Changes

- feat: upgrade Accordion, Avatar, Button, Carousel, List, Table

## 0.2.0

### Minor Changes

- feat: rename Tabs to TabList

## 0.1.0

### Patch Changes

- feat: add monorepo
