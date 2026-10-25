/** Rounds an EGP amount to two decimals (the API exposes numbers, DB stores numeric). */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Fixed two-decimal string for `numeric(10,2)` columns. */
export function money(value: number): string {
  return roundMoney(value).toFixed(2);
}

/** Adds whole days to a date, used for the estimated-delivery date. */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
