import { hash, verify } from "@node-rs/argon2";

/**
 * Argon2id hashing (02-architecture §5). `@node-rs/argon2` produces the same
 * PHC `$argon2id$...` string format as the native `argon2` package, so hashes
 * are interchangeable; it ships prebuilt binaries (no compiler needed).
 */
const ARGON2_OPTIONS = {
  algorithm: 2, // Argon2id
  memoryCost: 19456, // 19 MiB (OWASP minimum)
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, ARGON2_OPTIONS);
}

export async function verifyPassword(hashString: string, plain: string): Promise<boolean> {
  try {
    return await verify(hashString, plain);
  } catch {
    return false;
  }
}
