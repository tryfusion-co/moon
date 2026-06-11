# Moon Solid

Moon is a multi-layered, scalable, customizable, and adaptable Design System.

Moon Solid represents the third layer of the Moon Design System. The package relies on Moon UI CSS classes, which compose the second layer of Moon Design System.

Moon Solid provides simple functional SolidJS components, architected with the Compound Pattern, and two optional installation methods: Package Installation or CLI Scaffolding.

## 📦 Installation

> **Registry:** `@tryfusion-co/moon-solid` is published to **GitHub Packages**, not the public npm registry. GitHub Packages requires an auth token even for public packages — see [Configure GitHub Packages registry](#configure-github-packages-registry) below before running `npm install`.

### Configure GitHub Packages registry

Add this `.npmrc` to your project root (or `~/.npmrc` for all your projects):

```ini
@tryfusion-co:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then set `GITHUB_TOKEN` to:

- **Locally:** a [classic Personal Access Token](https://github.com/settings/tokens/new?scopes=read:packages&description=GitHub%20Packages%20read) with the `read:packages` scope.
- **In CI:** the built-in `secrets.GITHUB_TOKEN` (no setup needed for repos under `tryfusion-co/*`).

Verify the token is wired:

```bash
npm view @tryfusion-co/moon-solid --registry=https://npm.pkg.github.com
```

### Full Package Installation

Install the complete component library:

```bash
npm install @tryfusion-co/moon-solid
# or
yarn add @tryfusion-co/moon-solid
# or
pnpm install @tryfusion-co/moon-solid
```

**Peer dependency:** `solid-js@^1.9.13` is required.

```bash
npm install solid-js
```

### Component Installation via CLI

Install selective components using the CLI:

```bash
# Add a single component
npx moon-solid --add button

# Add multiple components
npx moon-solid --add button input
```

Or install all components at once:

```bash
npx moon-solid --add-components
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
npx moon-solid --projectName your-project

# Use custom Figma files
npx moon-solid --coreFileId CORE_FILE_ID --componentsProjectId COMPONENTS_PROJECT_ID

# Configure for non-Tailwind projects (default is 'tailwindcss')
npx moon-solid --target css

# Generate vanilla CSS files with browser CSS reset. Not needed with tailwindcss target
npx @moondesignsystem/ui --target css --preflight
```

## 📝 Component Usage

### When installed via package.json

```typescript
import { Button } from "@tryfusion-co/moon-solid";

const App = () => <Button>Click me</Button>;
```

Note: Moon Solid components use the `class` attribute per SolidJS convention.

```typescript
import { Button } from "@tryfusion-co/moon-solid";

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
