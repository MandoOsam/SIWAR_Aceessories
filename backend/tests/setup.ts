import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

/**
 * Minimal `.env` loader for tests (no `dotenv` dependency — AGENTS.md rule 3).
 * Loads `.env.test` first so the test DB is used even if `.env` exists.
 */
function loadEnvFile(file: string): void {
  let raw: string;
  try {
    raw = readFileSync(file, "utf8");
  } catch {
    return;
  }
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

const here = dirname(fileURLToPath(import.meta.url));
loadEnvFile(resolve(here, "../.env.test"));

// Fallback defaults so the suite still boots when `.env.test` is absent.
process.env.NODE_ENV ??= "test";
process.env.PORT ??= "3100";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5433/siwar_test";
process.env.DIRECT_URL ??= "postgresql://test:test@localhost:5433/siwar_test";
process.env.SESSION_SECRET ??= "test-session-secret-at-least-32-characters-long";
process.env.FRONTEND_ORIGIN ??= "http://localhost:5173";
process.env.ADMIN_ORIGIN ??= "http://localhost:5174";
process.env.CLOUDINARY_CLOUD_NAME ??= "test-cloud";
process.env.CLOUDINARY_API_KEY ??= "test-key";
process.env.CLOUDINARY_API_SECRET ??= "test-secret";
