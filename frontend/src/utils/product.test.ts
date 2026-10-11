import { describe, expect, it } from "vitest";

import { products } from "@/data/products";
import { buildCartItem, clampQuantity, resolveStockStatus } from "@/utils/product";

/**
 * Pure product-page rules: quantity clamping, stock status bands and the cart-line mapping shared
 * by `ProductActions` and `StickyAddToCart`.
 */
describe("clampQuantity", () => {
  it("clamps into the inclusive range", () => {
    expect(clampQuantity(0, 1, 10)).toBe(1);
    expect(clampQuantity(5, 1, 10)).toBe(5);
    expect(clampQuantity(99, 1, 10)).toBe(10);
  });

  it("truncates floats and falls back to min for non-finite input", () => {
    expect(clampQuantity(3.9, 1, 10)).toBe(3);
    expect(clampQuantity(Number.NaN, 1, 10)).toBe(1);
  });

  it("never returns above min when the ceiling is below it", () => {
    expect(clampQuantity(4, 3, 1)).toBe(3);
  });
});

describe("resolveStockStatus", () => {
  it("bands stock into out / low / in", () => {
    expect(resolveStockStatus(0)).toBe("out-of-stock");
    expect(resolveStockStatus(3)).toBe("low-stock");
    expect(resolveStockStatus(50)).toBe("in-stock");
  });
});

describe("buildCartItem", () => {
  it("maps a product + variant + quantity into a cart line", () => {
    const product = products[0];
    expect(product).toBeDefined();
    if (product === undefined) return;

    const item = buildCartItem(product, { color: "gold", size: "8" }, 2);

    expect(item.productId).toBe(product.id);
    expect(item.slug).toBe(product.slug);
    expect(item.name).toEqual(product.name);
    expect(item.qty).toBe(2);
    expect(item.variant).toEqual({ color: "gold", size: "8" });
    expect(item.maxQty).toBeGreaterThanOrEqual(1);
    expect(item.imageUrl).not.toBe("");
  });
});
