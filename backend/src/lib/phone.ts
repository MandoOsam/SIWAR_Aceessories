export const EGYPT_MOBILE = /^01[0125][0-9]{8}$/;

/** Keeps only digits so `+20 101 234 5678`, `0101-234-5678` and `01012345678` all match. */
export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}
