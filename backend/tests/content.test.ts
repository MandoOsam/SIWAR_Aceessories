import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "@/app.js";
import { closeDb, runMigrations, truncateAll } from "./db.js";
import {
  sampleHero,
  sampleStory,
  seedContentBlock,
  seedPage,
  seedSettings,
} from "./fixtures.js";

const app = createApp();

const featured = (title: string, href: string) => ({
  title: { ar: title, en: title },
  subtitle: { ar: `${title} subtitle`, en: `${title} subtitle` },
  imageUrl: `/assets/placeholder/${title.toLowerCase()}.svg`,
  href,
});

async function seedHome(): Promise<void> {
  await seedContentBlock({ key: "hero", data: sampleHero, sortOrder: 10 });
  await seedContentBlock({ key: "story", data: sampleStory, sortOrder: 20 });
}

beforeAll(async () => {
  await runMigrations();
});

afterAll(async () => {
  await closeDb();
});

beforeEach(async () => {
  await truncateAll();
});

describe("GET /api/v1/content/home", () => {
  it("answers 404 when the hero or story block is missing", async () => {
    const res = await request(app).get("/api/v1/content/home");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("composes hero, story and active featured blocks in sort order", async () => {
    await seedHome();
    await seedContentBlock({
      key: "featured:necklaces",
      data: featured("Necklaces", "/category/necklaces"),
      sortOrder: 40,
    });
    await seedContentBlock({
      key: "featured:offers",
      data: featured("Offers", "/shop?discount=true"),
      sortOrder: 30,
    });
    await seedContentBlock({
      key: "featured:hidden",
      data: featured("Hidden", "/hidden"),
      sortOrder: 25,
      isActive: false,
    });
    await seedContentBlock({ key: "banner:1", data: { imageUrl: "/assets/banner.svg" }, sortOrder: 5 });

    const res = await request(app).get("/api/v1/content/home");

    expect(res.status).toBe(200);
    expect(res.body.data.hero).toEqual(sampleHero);
    expect(res.body.data.story).toEqual(sampleStory);
    expect(res.body.data.featuredCollections).toEqual([
      { id: "offers", ...featured("Offers", "/shop?discount=true") },
      { id: "necklaces", ...featured("Necklaces", "/category/necklaces") },
    ]);
  });

  it("fails loudly when stored block data does not match its key", async () => {
    await seedHome();
    await seedContentBlock({
      key: "featured:broken",
      data: { title: { ar: "", en: "" }, subtitle: { ar: "x", en: "x" }, imageUrl: "", href: "" },
      sortOrder: 30,
    });

    const res = await request(app).get("/api/v1/content/home");

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
  });
});

describe("GET /api/v1/content/pages", () => {
  it("lists pages by slug", async () => {
    await seedPage({ slug: "shipping" });
    await seedPage({ slug: "about" });

    const res = await request(app).get("/api/v1/content/pages");

    expect(res.status).toBe(200);
    expect(res.body.data.map((page: { slug: string }) => page.slug)).toEqual(["about", "shipping"]);
  });

  it("returns one page by slug", async () => {
    await seedPage({
      slug: "about",
      title: { ar: "من نحن", en: "About Us" },
      body: { ar: "نص", en: "Body" },
    });

    const res = await request(app).get("/api/v1/content/pages/about");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      slug: "about",
      title: { ar: "من نحن", en: "About Us" },
      body: { ar: "نص", en: "Body" },
    });
  });

  it("returns 200 null for an unknown page so the storefront can show its empty state", async () => {
    const res = await request(app).get("/api/v1/content/pages/missing");

    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });

  it("rejects a slug that is not lowercase words", async () => {
    const res = await request(app).get("/api/v1/content/pages/About-Us");

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/v1/settings/public", () => {
  it("answers 404 before the settings row exists", async () => {
    const res = await request(app).get("/api/v1/settings/public");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns the storefront settings without disabled payment methods or seo", async () => {
    await seedSettings({ seo: { title: { ar: "عنوان", en: "Title" } } });

    const res = await request(app).get("/api/v1/settings/public");

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      storeName: "SIWAR",
      currency: "EGP",
      shipping: { defaultFee: 60, freeAbove: 3000 },
    });
    expect(res.body.data.paymentMethods).toEqual([
      { id: "cod", name: { ar: "الدفع عند الاستلام", en: "Cash on Delivery" }, isEnabled: true },
    ]);
    expect(res.body.data).not.toHaveProperty("seo");
  });
});
