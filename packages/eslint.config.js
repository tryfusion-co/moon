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
      // CJS scripts use Node globals (__dirname, console, process)
      "scripts/**",
      // Vite/Vitest config files are not part of tsconfig.json project
      "vite.config.ts",
      "vitest.config.ts",
    ],
  },
];
