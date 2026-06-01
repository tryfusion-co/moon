import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    lib: { entry: "./src/index.ts", formats: ["es"], fileName: "index" },
    rollupOptions: {
      external: ["solid-js", "solid-js/web", "solid-js/store"],
      output: [
        // Compiled ESM output — resolves via "import" condition
        {
          format: "es",
          entryFileNames: "[name].js",
          chunkFileNames: "[name]-[hash].js",
          preserveModules: true,
          preserveModulesRoot: "src",
        },
        // Preserved-JSX output — resolves via "solid" condition
        {
          format: "es",
          entryFileNames: "[name].jsx",
          chunkFileNames: "[name]-[hash].jsx",
          preserveModules: true,
          preserveModulesRoot: "src",
          dir: "dist",
        },
      ],
    },
  },
});
