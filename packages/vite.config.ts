import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

// Pass 1 of 2: compiled ESM output (babel-preset-solid applied).
// Resolves via the "import" condition in package.json exports.
// Output: dist/*.js  (Solid reactive calls — _tmpl$, createComponent, etc.)
export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    lib: { entry: "./src/index.ts", formats: ["es"], fileName: "index" },
    rollupOptions: {
      external: ["solid-js", "solid-js/web", "solid-js/store"],
      output: {
        format: "es",
        entryFileNames: "[name].js",
        chunkFileNames: "[name]-[hash].js",
        preserveModules: true,
        preserveModulesRoot: "src",
        dir: "dist",
      },
    },
  },
});
