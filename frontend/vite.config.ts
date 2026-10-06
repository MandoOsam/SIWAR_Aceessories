import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Vite config, shared with Vitest.
 *
 * `@/` is an alias for `src/` so imports stay short and independent of file depth.
 *
 * The `test` block lives here rather than in a separate `vitest.config.ts` on purpose: Vitest picks
 * `vitest.config.ts` *instead of* this file, which would silently drop the `@` alias and the React
 * plugin that every test relies on.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
  test: {
    // Service layer, formatters and preference helpers are pure logic: no DOM is required, so the
    // project does not need jsdom or happy-dom.
    environment: "node",
    include: ["src/**/*.test.ts"],
    // `*.test.tsx` is deliberately not included: component tests would need a DOM environment and
    // testing-library, which are not part of F1.
    globals: false,
  },
});
