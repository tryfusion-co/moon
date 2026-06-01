---
"@moondesignsystem/solid": major
---

Migrate Moon Design System from React to SolidJS. Package renamed @moondesignsystem/react -> @moondesignsystem/solid; peer dependency is now solid-js. Public API (component names, props, exported types, Tailwind class output) preserved. `class` replaces `className`. Drawer/BottomSheet/Dropdown triggers use display:contents wrappers; Chip uncontrolled toggle behavior improved.
