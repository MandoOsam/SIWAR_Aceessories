/**
 * Password policy + strength heuristic for the auth forms.
 *
 * Kept as a pure module so the register/reset schemas and the strength meter share one definition
 * (03-code-standards.md §5: no business logic inside JSX). The real rule is enforced server-side
 * (`02-architecture.md` §5); this mirrors it for immediate feedback only.
 */

import type { PasswordStrength } from "@/services/types";

export const PASSWORD_MIN_LENGTH = 8;

export type PasswordChecks = {
  length: boolean;
  letter: boolean;
  number: boolean;
  symbol: boolean;
};

export function checkPassword(password: string): PasswordChecks {
  return {
    length: password.length >= PASSWORD_MIN_LENGTH,
    letter: /[A-Za-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

/** The hard requirement the register/reset schemas enforce: length + a letter + a number. */
export function hasLetterAndNumber(password: string): boolean {
  return /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

/** Number of satisfied checks, 0–4; drives the strength meter width. */
export function passwordScore(password: string): number {
  const checks = checkPassword(password);
  return [checks.length, checks.letter, checks.number, checks.symbol].filter(Boolean).length;
}

/** Score 0–1 weak, 2–3 medium, 4 strong. */
export function getPasswordStrength(password: string): PasswordStrength {
  const score = passwordScore(password);
  if (score <= 1) {
    return "weak";
  }
  if (score <= 3) {
    return "medium";
  }
  return "strong";
}
