# Moon Solid

Moon is a multi-layered, scalable, customizable, and adaptable Design System.

Moon Solid represents the third layer of the Moon Design System. The package relies on Moon UI CSS classes, which compose the second layer of Moon Design System.

Moon Solid provides simple functional SolidJS components, architected with the Compound Pattern, and two optional installation methods: Package Installation or CLI Scaffolding.

## 📦 Installation

### Full Package Installation

Install the complete component library:

```bash
npm install @moondesignsystem/solid
# or
yarn add @moondesignsystem/solid
# or
pnpm install @moondesignsystem/solid
```

**Peer dependency:** `solid-js@^1.9.13` is required.

```bash
npm install solid-js
```

### Component Installation via CLI

Install selective components using the CLI:

```bash
# Add a single component
npx @moondesignsystem/solid --add button

# Add multiple components
npx @moondesignsystem/solid --add button input
```

Or install all components at once:

```bash
npx @moondesignsystem/solid --add-components
```

You can also use the `moon-solid` bin directly if the package is installed globally or locally:

```bash
moon-solid --add button
```

## Moon UI Integration

[Moon UI](https://ui.moondesignsystem.com/) is a standalone library for generating core and component CSS files from Figma design tokens.

### Configuration

If you need to customize default Moon core and components styling, add a `FIGMA_TOKEN` variable to your `.env` file and include this file in `.gitignore`:

```env
FIGMA_TOKEN=your-figma-token-here
```

### CLI Options for Moon UI

```bash
# Specify your project name for css files generation
npx @moondesignsystem/solid --projectName your-project

# Use custom Figma files
npx @moondesignsystem/solid --coreFileId CORE_FILE_ID --componentsProjectId COMPONENTS_PROJECT_ID

# Configure for non-Tailwind projects (default is 'tailwindcss')
npx @moondesignsystem/solid --target css

# Generate vanilla CSS files with browser CSS reset. Not needed with tailwindcss target
npx @moondesignsystem/ui --target css --preflight
```

## 📝 Component Usage

### When installed via package.json

```typescript
import { Button } from "@moondesignsystem/solid";

const App = () => <Button>Click me</Button>;
```

Note: Moon Solid components use the `class` attribute per SolidJS convention.

```typescript
import { Button } from "@moondesignsystem/solid";

const App = () => <Button class="my-custom-class">Click me</Button>;
```

### When installed locally in your project directory

```typescript
import { Button } from "../local-path-to-moon-components";

const App = () => <Button>Click me</Button>;
```

## `solid` Export Condition

SolidStart and Vite consumers should ensure their bundler resolves the `solid` export condition. This condition points to raw JSX source (`dist/index.jsx`), which lets `vite-plugin-solid` compile the components directly in your build:

```json
// vite.config.ts — SolidStart or Vite projects
{
  "resolve": {
    "conditions": ["solid", "browser", "module", "require", "default"]
  }
}
```

Standard bundlers use the `import` condition (`dist/index.js`, pre-compiled) and require no additional configuration.

## License

MIT

## Versioning

Moon Solid follows [Semantic Versioning](https://semver.org/). View available versions in the [repository tags](https://github.com/moondesignsystem/solid/tags).

- **MAJOR**: Incompatible API changes
- **MINOR**: New backward-compatible functionality
- **PATCH**: Backward-compatible bug fixes
