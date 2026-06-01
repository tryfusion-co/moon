import path from "path";
import tailwindcss from "@tailwindcss/vite";
import solid from "vite-plugin-solid";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [solid(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@moondesignsystem/solid": path.resolve(__dirname, "../packages/src"),
    },
  },
});
