import js from "@eslint/js";
import solid from "eslint-plugin-solid/configs/typescript";
import * as tsParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    ...solid,
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: "tsconfig.json" },
    },
    rules: {
      ...solid.rules,
      "solid/no-destructure": "error",
    },
  },
  { ignores: ["dist/**", "node_modules/**", "cli/**", "bin/**"] },
];
