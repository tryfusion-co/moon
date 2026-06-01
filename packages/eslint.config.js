import js from "@eslint/js";
import solid from "eslint-plugin-solid/configs/typescript";
import * as tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    ...solid,
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: "tsconfig.json" },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...solid.rules,
      "solid/no-destructure": "error",
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    },
  },
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "cli/**",
      "bin/**",
      // Unported React components — linted per-phase during Phases 2-4
      "src/components/**/*",
      "!src/components/Button.tsx",
      "!src/components/IconButton.tsx",
      "!src/components/Badge.tsx",
      "!src/components/Tag.tsx",
      "!src/components/Chip.tsx",
      "!src/components/Avatar.tsx",
      "!src/components/Loader.tsx",
      "!src/components/CircularProgress.tsx",
      "!src/components/LinearProgress.tsx",
      "!src/components/Placeholder.tsx",
      "!src/components/Alert.tsx",
      "!src/components/Breadcrumb.tsx",
      "!src/components/Carousel.tsx",
      "!src/components/Checkbox.tsx",
      "!src/components/FormGroup.tsx",
      "!src/components/Input.tsx",
      "!src/components/Radio.tsx",
      "!src/components/SegmentedControl.tsx",
      "!src/components/Switch.tsx",
      "!src/components/Textarea.tsx",
      // CJS scripts use Node globals (__dirname, console, process)
      "scripts/**",
      // Legacy React test files — migrated to @solidjs/testing-library in Phase 07
      "src/tests/Alert.test.tsx",
      "src/tests/Badge.test.tsx",
      "src/tests/BottomSheet.test.tsx",
      "src/tests/Breadcrumb.test.tsx",
      "src/tests/Button.test.tsx",
      "src/tests/CircularProgress.test.tsx",
      "src/tests/Dialog.test.tsx",
      "src/tests/Drawer.test.tsx",
      "src/tests/Dropdown.test.tsx",
      "src/tests/IconButton.test.tsx",
      "src/tests/List.test.tsx",
      "src/tests/Menu.test.tsx",
      "src/tests/Pagination.test.tsx",
      "src/tests/Snackbar.test.tsx",
      "src/tests/Table.test.tsx",
      "src/tests/TabList.test.tsx",
      "src/tests/Tag.test.tsx",
      "src/tests/Tooltip.test.tsx",
      "src/tests/accordion.test.tsx",
      // Vite/Vitest config files are not part of tsconfig.json project
      "vite.config.ts",
      "vitest.config.ts",
    ],
  },
];
