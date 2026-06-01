import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin({ hot: false })],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/tests/setupTests.ts"],
    // Phase 01 gate: only the toolchain test runs here.
    // Legacy React test files (src/tests/*.test.tsx except toolchain) will be
    // migrated to @solidjs/testing-library in Phase 07.
    include: ["src/tests/toolchain.test.tsx"],
  },
  resolve: { conditions: ["development", "browser"] },
  ssr: { resolve: { conditions: ["browser"] } },
});
