import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin({ hot: false })],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/tests/setupTests.ts"],
  },
  resolve: { conditions: ["development", "browser"] },
  ssr: { resolve: { conditions: ["browser"] } },
});
