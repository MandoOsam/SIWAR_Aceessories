import { eq, inArray, sql } from "drizzle-orm";

import { env } from "@/config/env.js";
import { db, pool } from "@/db/client.js";
import { categories } from "@/db/schema/categories.js";
import { productImages } from "@/db/schema/productImages.js";
import { products } from "@/db/schema/products.js";
import { users } from "@/db/schema/users.js";
import { seedContent } from "@/db/seedContent.js";
import { logger } from "@/lib/logger.js";
import { hashPassword } from "@/lib/password.js";
import type { L10n } from "@/types/l10n.js";

/**
 * Development seed: creates the owner account and the starter catalogue.
 *
 * Idempotent - safe to run any number of times. Categories and products are
 * upserted by slug, product images are replaced, and the owner password is
 * reset to the value in the environment. It never deletes anything that was
 * created by hand.
 *
 *   npm run db:seed
 */

type CategorySeed = {
  slug: string;
  name: L10n;
  description: L10n;
  imageUrl: string;
};

type ProductSeed = {
  slug: string;
  category: string;
  name: L10n;
  description: L10n;
  price: number;
  oldPrice?: number;
  colors: string[];
  sizes?: string[];
  stock: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  createdAt: string;
};

const PLACEHOLDER = "/assets/placeholder";

const categorySeeds: CategorySeed[] = [
  {
    slug: "necklaces",
    name: { ar: "سلاسل", en: "Necklaces" },
    description: {
      ar: "سلاسل ستانلس ستيل بتفاصيل نظيفة ولمعة هادية.",
      en: "Stainless steel chains with clean lines and a quiet shine.",
    },
    imageUrl: `${PLACEHOLDER}/category-necklaces.svg`,
  },
  {
    slug: "rings",
    name: { ar: "خواتم", en: "Rings" },
    description: {
      ar: "خواتم بتصاميم بسيطة تلبسها كل يوم.",
      en: "Simple designs you can wear every day.",
    },
    imageUrl: `${PLACEHOLDER}/category-rings.svg`,
  },
  {
    slug: "bracelets",
    name: { ar: "انسيال", en: "Bracelets" },
    description: {
      ar: "انسيال بتفاصيل ناعمة ولمعة ثابتة.",
      en: "Soft details and a lasting shine.",
    },
    imageUrl: `${PLACEHOLDER}/category-bracelets.svg`,
  },
  {
    slug: "earrings",
    name: { ar: "حلقان", en: "Earrings" },
    description: {
      ar: "حلقان خفيفة مناسبة لكل يوم.",
      en: "Lightweight earrings for every day.",
    },
    imageUrl: `${PLACEHOLDER}/category-earrings.svg`,
  },
  {
    slug: "sets",
    name: { ar: "سيتات", en: "Sets" },
    description: {
      ar: "سيتات كاملة تناسب المناسبات والسهرات.",
      en: "Complete sets for occasions and evenings.",
    },
    imageUrl: `${PLACEHOLDER}/category-sets.svg`,
  },
];

const productSeeds: ProductSeed[] = [
  {
    slug: "luna-chain-pendant",
    category: "necklaces",
    name: { ar: "سلسلة لونا بحلقة معلقة", en: "Luna Chain with Pendant" },
    description: {
      ar: "سلسلة رفيعة بحلقة دائرية معلقة، مصنوعة من الستانلس ستيل المقاوم للصدأ.",
      en: "A fine chain with a floating circular pendant, in rust-resistant stainless steel.",
    },
    price: 640,
    oldPrice: 890,
    colors: ["gold", "silver"],
    stock: 24,
    isBestSeller: true,
    isFeatured: true,
    createdAt: "2026-07-14T09:00:00.000Z",
  },
  {
    slug: "noor-layered-necklace",
    category: "necklaces",
    name: { ar: "سلاسل نور المتدرجة", en: "Noor Layered Necklace" },
    description: {
      ar: "ثلاث طبقات رفيعة تمنح إطلالة أعمق، مع مشبك مقاوم للاهتراء.",
      en: "Three fine layers for a deeper look, with a wear-resistant clasp.",
    },
    price: 780,
    colors: ["gold", "rose-gold"],
    stock: 12,
    isNew: true,
    createdAt: "2026-09-02T09:00:00.000Z",
  },
  {
    slug: "sahar-collar",
    category: "necklaces",
    name: { ar: "قلادة صحار", en: "Sahar Collar" },
    description: {
      ar: "قلادة قريبة من الرقبة بخطوط ناعمة ولون ثابت لا يبهت.",
      en: "A close-fitting collar with soft lines and a finish that does not fade.",
    },
    price: 910,
    oldPrice: 1150,
    colors: ["silver"],
    stock: 8,
    isFeatured: true,
    createdAt: "2026-05-21T09:00:00.000Z",
  },
  {
    slug: "signature-ring-band",
    category: "rings",
    name: { ar: "خاتم سيجنتشر", en: "Signature Ring Band" },
    description: {
      ar: "خاتم بسيط بلمسة مطفية، مناسب للارتداء اليومي ولطيف على البشرة الحساسة.",
      en: "A simple matte ring for daily wear, gentle on sensitive skin.",
    },
    price: 420,
    colors: ["gold", "silver", "black"],
    sizes: ["6", "7", "8", "9"],
    stock: 30,
    isBestSeller: true,
    createdAt: "2026-06-08T09:00:00.000Z",
  },
  {
    slug: "layla-stacking-ring",
    category: "rings",
    name: { ar: "خاتم ليلى للتركيب", en: "Layla Stacking Ring" },
    description: {
      ar: "خاتم رفيع يمكن تركيبه مع خاتم آخر لتكوين طبقات.",
      en: "A slim ring you can stack with another to build layers.",
    },
    price: 360,
    colors: ["gold", "rose-gold"],
    sizes: ["6", "7", "8"],
    stock: 0,
    isNew: true,
    createdAt: "2026-09-18T09:00:00.000Z",
  },
  {
    slug: "hoda-signet-ring",
    category: "rings",
    name: { ar: "خاتم هودة", en: "Hoda Signet Ring" },
    description: {
      ar: "خاتم بخطوط واضحة ولمعة هادئة، متوفر بثلاثة ألوان.",
      en: "A ring with clear lines and a calm shine, in three finishes.",
    },
    price: 495,
    oldPrice: 620,
    colors: ["silver", "gold"],
    sizes: ["7", "8", "9"],
    stock: 15,
    createdAt: "2026-04-30T09:00:00.000Z",
  },
  {
    slug: "marina-cuff",
    category: "bracelets",
    name: { ar: "انسيال مارينا", en: "Marina Cuff" },
    description: {
      ar: "انسيال مفتوح بخطوط رفيعة، لا يتأثر بالماء ولا بالاسوداد.",
      en: "An open cuff with fine lines that resists water and tarnish.",
    },
    price: 720,
    oldPrice: 890,
    colors: ["gold"],
    stock: 18,
    isBestSeller: true,
    isFeatured: true,
    createdAt: "2026-07-29T09:00:00.000Z",
  },
  {
    slug: "dana-chain-bracelet",
    category: "bracelets",
    name: { ar: "انسيال دانا السلسلي", en: "Dana Chain Bracelet" },
    description: {
      ar: "انسيال بسلسلة رفيعة تتركب بسهولة ولا تحتاج صيانة.",
      en: "A fine chain bracelet that adjusts easily and needs no maintenance.",
    },
    price: 585,
    colors: ["silver", "rose-gold"],
    stock: 22,
    createdAt: "2026-08-11T09:00:00.000Z",
  },
  {
    slug: "tala-beaded-bracelet",
    category: "bracelets",
    name: { ar: "انسيال تالا بالخرز", en: "Tala Beaded Bracelet" },
    description: {
      ar: "خرز معدني بلون موحد يعطي إطلالة هادئة في كل المناسبات.",
      en: "Uniform metal beads for a calm look on every occasion.",
    },
    price: 470,
    colors: ["gold", "black"],
    stock: 9,
    isNew: true,
    createdAt: "2026-09-25T09:00:00.000Z",
  },
  {
    slug: "yasmine-drop-earrings",
    category: "earrings",
    name: { ar: "حلق ياسمين المتدلية", en: "Yasmine Drop Earrings" },
    description: {
      ar: "حلق متدفق خفيف، يبرز جمال الوجه ولا يسبب ثقلا.",
      en: "Light flowing drops that frame the face without weight.",
    },
    price: 530,
    oldPrice: 690,
    colors: ["gold", "silver"],
    stock: 26,
    isBestSeller: true,
    isFeatured: true,
    createdAt: "2026-06-25T09:00:00.000Z",
  },
  {
    slug: "nour-hoop-earrings",
    category: "earrings",
    name: { ar: "حلق نور الدائري", en: "Nour Hoop Earrings" },
    description: {
      ar: "حلق دائري متوسط الحجم للاستخدام اليومي.",
      en: "Medium hoops made for everyday wear.",
    },
    price: 390,
    colors: ["gold", "rose-gold"],
    stock: 34,
    createdAt: "2026-08-22T09:00:00.000Z",
  },
  {
    slug: "reem-stud-earrings",
    category: "earrings",
    name: { ar: "حلق ريم الصغير", en: "Reem Stud Earrings" },
    description: {
      ar: "حلق صغير بلمسة ذهبية هادئة.",
      en: "Small studs with a calm golden touch.",
    },
    price: 310,
    colors: ["silver"],
    stock: 41,
    isNew: true,
    createdAt: "2026-09-30T09:00:00.000Z",
  },
  {
    slug: "sahar-layla-set",
    category: "sets",
    name: { ar: "سيت صحار وليلا", en: "Sahar and Layla Set" },
    description: {
      ar: "سيت كامل يضم قلادة وخاتما بنفس التصميم المتوازن.",
      en: "A complete set pairing a necklace and a ring in the same balanced design.",
    },
    price: 1050,
    oldPrice: 1320,
    colors: ["gold"],
    stock: 11,
    isFeatured: true,
    createdAt: "2026-07-05T09:00:00.000Z",
  },
  {
    slug: "nada-evening-set",
    category: "sets",
    name: { ar: "سيت ندا للسهرات", en: "Nada Evening Set" },
    description: {
      ar: "سيت مختار للسهرات، بلمعة أهدى وألوان دافئة.",
      en: "A curated evening set with a softer shine and warm tones.",
    },
    price: 1480,
    colors: ["rose-gold", "black"],
    stock: 6,
    createdAt: "2026-09-08T09:00:00.000Z",
  },
];

function skuFor(slug: string): string {
  return `SW-${slug.toUpperCase()}`;
}

function toneFor(color: string): string {
  return color === "rose-gold" ? "rose" : color;
}

function imagesFor(seed: ProductSeed): { url: string; alt: L10n; isPrimary: boolean }[] {
  const tones = [...new Set(seed.colors.map(toneFor))];
  const unique = tones.length > 0 ? tones : ["gold"];
  return unique.map((tone, index) => ({
    url: `${PLACEHOLDER}/product-${tone}.svg`,
    alt: seed.name,
    isPrimary: index === 0,
  }));
}

async function seedCategories(): Promise<Map<string, string>> {
  await db
    .insert(categories)
    .values(
      categorySeeds.map((seed, index) => ({
        slug: seed.slug,
        name: seed.name,
        description: seed.description,
        imageUrl: seed.imageUrl,
        sortOrder: index + 1,
        isActive: true,
      })),
    )
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        imageUrl: sql`excluded.image_url`,
        sortOrder: sql`excluded.sort_order`,
        isActive: true,
        updatedAt: new Date(),
      },
    });

  const rows = await db.select({ id: categories.id, slug: categories.slug }).from(categories);
  return new Map(rows.map((row) => [row.slug, row.id]));
}

async function seedProducts(bySlug: Map<string, string>): Promise<void> {
  const values = productSeeds.map((seed) => {
    const categoryId = bySlug.get(seed.category);
    if (categoryId === undefined) {
      throw new Error(`Seed error: category "${seed.category}" was not created`);
    }
    const discountPercent =
      seed.oldPrice !== undefined && seed.oldPrice > seed.price
        ? Math.round(((seed.oldPrice - seed.price) / seed.oldPrice) * 100)
        : null;

    return {
      slug: seed.slug,
      sku: skuFor(seed.slug),
      name: seed.name,
      description: seed.description,
      categoryId,
      price: seed.price.toFixed(2),
      oldPrice: seed.oldPrice === undefined ? null : seed.oldPrice.toFixed(2),
      discountPercent,
      stock: seed.stock,
      status: "active" as const,
      isNew: seed.isNew ?? false,
      isBestSeller: seed.isBestSeller ?? false,
      isFeatured: seed.isFeatured ?? false,
      colors: seed.colors,
      sizes: seed.sizes ?? [],
      material: "stainless-steel",
      waterResistant: true,
      hypoallergenic: true,
      createdAt: new Date(seed.createdAt),
      updatedAt: new Date(),
    };
  });

  await db
    .insert(products)
    .values(values)
    .onConflictDoUpdate({
      target: products.slug,
      set: {
        sku: sql`excluded.sku`,
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        categoryId: sql`excluded.category_id`,
        price: sql`excluded.price`,
        oldPrice: sql`excluded.old_price`,
        discountPercent: sql`excluded.discount_percent`,
        stock: sql`excluded.stock`,
        status: sql`excluded.status`,
        isNew: sql`excluded.is_new`,
        isBestSeller: sql`excluded.is_best_seller`,
        isFeatured: sql`excluded.is_featured`,
        colors: sql`excluded.colors`,
        sizes: sql`excluded.sizes`,
        updatedAt: new Date(),
      },
    });

  const rows = await db
    .select({ id: products.id, slug: products.slug })
    .from(products)
    .where(
      inArray(
        products.slug,
        productSeeds.map((seed) => seed.slug),
      ),
    );
  const idBySlug = new Map(rows.map((row) => [row.slug, row.id]));

  if (rows.length > 0) {
    await db.delete(productImages).where(
      inArray(
        productImages.productId,
        rows.map((row) => row.id),
      ),
    );
  }

  const imageValues = productSeeds.flatMap((seed) => {
    const productId = idBySlug.get(seed.slug);
    if (productId === undefined) return [];
    return imagesFor(seed).map((image, index) => ({
      productId,
      url: image.url,
      alt: image.alt,
      isPrimary: image.isPrimary,
      sortOrder: index,
    }));
  });

  if (imageValues.length > 0) {
    await db.insert(productImages).values(imageValues);
  }
}

async function seedOwner(): Promise<void> {
  if (env.OWNER_EMAIL === undefined || env.OWNER_PASSWORD === undefined) {
    throw new Error(
      "Seed error: set OWNER_EMAIL and OWNER_PASSWORD in .env (and optionally OWNER_NAME)",
    );
  }
  const passwordHash = await hashPassword(env.OWNER_PASSWORD);
  await db
    .insert(users)
    .values({
      email: env.OWNER_EMAIL,
      name: env.OWNER_NAME ?? "Owner",
      passwordHash,
      role: "super_admin",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        name: env.OWNER_NAME ?? "Owner",
        passwordHash,
        role: "super_admin",
        isActive: true,
        updatedAt: new Date(),
      },
    });
}

async function main(): Promise<void> {
  const bySlug = await seedCategories();
  await seedProducts(bySlug);
  await seedOwner();
  const content = await seedContent();

  const [{ count: productCount = 0 } = { count: 0 }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products);
  const [{ count: categoryCount = 0 } = { count: 0 }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(categories)
    .where(eq(categories.isActive, true));

  logger.info(
    `Seed complete: ${String(categoryCount)} categories, ${String(productCount)} products, owner ${String(env.OWNER_EMAIL)}`,
  );
  logger.info(
    `Content: ${String(content.blocks)} blocks inserted, ${String(content.pages)} pages inserted, settings ${content.settings ? "created" : "kept"}`,
  );
}

main()
  .catch((error: unknown) => {
    logger.error({ err: error }, "Seed failed");
    process.exitCode = 1;
  })
  .finally(() => {
    void pool.end();
  });
