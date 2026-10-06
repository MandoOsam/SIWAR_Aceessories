import { describe, expect, it } from "vitest";

import {
  formatDate,
  formatNumber,
  formatPrice,
  isPlaceholder,
  localize,
  toInternationalPhone,
} from "@/utils/format";

/**
 * Formatting and placeholder helpers.
 *
 * Arabic is the default and RTL, so the currency label sits after the amount in Arabic and before
 * it in English (05-ui-context.md §5.1). `numberingSystem: "latn"` keeps prices readable instead of
 * rendering Arabic-Indic digits.
 */
describe("localize", () => {
  it("picks the active language from a bilingual field", () => {
    const value = { ar: "سلاسل", en: "Necklaces" };
    expect(localize(value, "ar")).toBe("سلاسل");
    expect(localize(value, "en")).toBe("Necklaces");
  });
});

describe("formatPrice", () => {
  it("puts ج.م after the amount in Arabic", () => {
    expect(formatPrice(450, "ar")).toBe("450.00 ج.م");
  });

  it("puts EGP before the amount in English", () => {
    expect(formatPrice(450, "en")).toBe("EGP 450.00");
  });

  it("always shows two decimals", () => {
    expect(formatPrice(1000, "en")).toBe("EGP 1,000.00");
    expect(formatPrice(99.5, "en")).toBe("EGP 99.50");
  });

  it("uses Latin digits in Arabic", () => {
    expect(formatPrice(1234, "ar")).not.toMatch(/[\u0660-\u0669]/);
    expect(formatPrice(1234, "ar")).toContain("1,234.00");
  });

  it("keeps zero at two decimals rather than dropping it", () => {
    expect(formatPrice(0, "en")).toBe("EGP 0.00");
  });
});

describe("formatNumber", () => {
  it("groups thousands", () => {
    expect(formatNumber(1500, "en")).toBe("1,500");
  });

  it("keeps Latin digits in Arabic", () => {
    expect(formatNumber(1500, "ar")).toBe("1,500");
  });
});

describe("formatDate", () => {
  it("returns a medium-style date for both locales", () => {
    expect(formatDate("2026-07-27T00:00:00.000Z", "en")).toMatch(/2026/);
    expect(formatDate("2026-07-27T00:00:00.000Z", "ar")).toMatch(/2026/);
  });

  it("does not throw on a valid ISO string", () => {
    expect(() => formatDate("2026-01-01", "ar")).not.toThrow();
  });
});

describe("isPlaceholder", () => {
  it("flags the TODO marker used for owner-supplied values", () => {
    expect(isPlaceholder("TODO(Mando)")).toBe(true);
    expect(isPlaceholder("  TODO(Mando): confirm shipping fee")).toBe(true);
  });

  it("flags missing and empty values", () => {
    expect(isPlaceholder(null)).toBe(true);
    expect(isPlaceholder(undefined)).toBe(true);
    expect(isPlaceholder("")).toBe(true);
    expect(isPlaceholder("   ")).toBe(true);
  });

  it("accepts the real values the owner has now supplied", () => {
    expect(isPlaceholder("https://wa.me/201041921899")).toBe(false);
    expect(isPlaceholder("01041921899")).toBe(false);
    expect(isPlaceholder("https://www.instagram.com/siwar_accessories00/")).toBe(false);
  });
});

describe("toInternationalPhone", () => {
  it("converts the owner's local format to a dialable international number", () => {
    expect(toInternationalPhone("01041921899")).toBe("+201041921899");
  });

  it("passes an already international number through", () => {
    expect(toInternationalPhone("+201041921899")).toBe("+201041921899");
    expect(toInternationalPhone("201041921899")).toBe("+201041921899");
  });

  it("understands the 00 international access prefix", () => {
    expect(toInternationalPhone("00201041921899")).toBe("+201041921899");
  });

  it("ignores spacing and punctuation", () => {
    expect(toInternationalPhone("010 419 218 99")).toBe("+201041921899");
    expect(toInternationalPhone("010-419-218-99")).toBe("+201041921899");
  });

  it("returns an empty string when there are no digits", () => {
    expect(toInternationalPhone("")).toBe("");
    expect(toInternationalPhone("n/a")).toBe("");
  });
});
