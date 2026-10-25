import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    // The suite talks to one real PostgreSQL database and truncates it between
    // tests, so test files must not run at the same time (one file would wipe
    // the rows another file just inserted).
    fileParallelism: false,
  },
});
