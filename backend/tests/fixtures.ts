import { hashPassword } from "@/lib/password.js";
import { db } from "@/db/client.js";
import { categories } from "@/db/schema/categories.js";
import { contentBlocks } from "@/db/schema/contentBlocks.js";
import { coupons } from "@/db/schema/coupons.js";
import { pages } from "@/db/schema/pages.js";
import { productImages } from "@/db/schema/productImages.js";
import { products } from "@/db/schema/products.js";
import type { ProductStatus } from "@/db/schema/products.js";
import { storeSettings, type NewStoreSettings } from "@/db/schema/storeSettings.js";
import type { CouponType } from "@/types/orders.js";
import type { UserRole } from "@/db/schema/users.js";
import type { HeroContent, StoryContent } from "@/types/content.js";
import { insertUser } from "@/modules/auth/repository.js";
import type { L10n } from "@/types/l10n.js";

type UserSeed = {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
  isActive?: boolean;
};

/** Creates a user directly in the test database (bypasses the API on purpose). */
export async function seedUser(seed: UserSeed) {
  const passwordHash = await hashPassword(seed.password);
  const [user] = await insertUser({
    email: seed.email,
    passwordHash,
    name: seed.name ?? "Seeded User",
    role: seed.role ?? "customer",
    isActive: seed.isActive ?? true,
  });
  if (!user) throw new Error("could not seed user");
  return user;
}

type CategorySeed = {
  slug: string;
  name?: L10n;
  description?: L10n;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  parentId?: string | null;
};

export async function seedCategory(seed: CategorySeed) {
  const [category] = await db
    .insert(categories)
    .values({
      slug: seed.slug,
      name: seed.name ?? { ar: `تصنيف ${seed.slug}`, en: seed.slug },
      description: seed.description ?? { ar: `وصف ${seed.slug}`, en: `${seed.slug} description` },
      imageUrl: seed.imageUrl === undefined ? `/assets/placeholder/category-${seed.slug}.svg` : seed.imageUrl,
      sortOrder: seed.sortOrder ?? 0,
      isActive: seed.isActive ?? true,
      parentId: seed.parentId ?? null,
    })
    .returning();
  if (!category) throw new Error("could not seed category");
  return category;
}

type ProductSeed = {
  slug: string;
  categoryId: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  colors?: string[];
  sizes?: string[];
  stock?: number;
  status?: ProductStatus;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  createdAt?: Date;
  name?: L10n;
  images?: { url: string; isPrimary: boolean }[];
};

export async function seedProduct(seed: ProductSeed) {
  const name = seed.name ?? { ar: `منتج ${seed.slug}`, en: seed.slug };
  const [product] = await db
    .insert(products)
    .values({
      slug: seed.slug,
      sku: `SW-${seed.slug.toUpperCase()}`,
      name,
      description: { ar: `وصف ${seed.slug}`, en: `${seed.slug} description` },
      categoryId: seed.categoryId,
      price: seed.price.toFixed(2),
      oldPrice: seed.oldPrice === undefined ? null : seed.oldPrice.toFixed(2),
      discountPercent: seed.discountPercent ?? null,
      colors: seed.colors ?? ["gold"],
      sizes: seed.sizes ?? [],
      stock: seed.stock ?? 10,
      status: seed.status ?? "active",
      isNew: seed.isNew ?? false,
      isBestSeller: seed.isBestSeller ?? false,
      isFeatured: seed.isFeatured ?? false,
      waterResistant: true,
      hypoallergenic: true,
      createdAt: seed.createdAt ?? new Date("2026-01-01T00:00:00.000Z"),
    })
    .returning();
  if (!product) throw new Error("could not seed product");

  const images = seed.images ?? [{ url: `/assets/placeholder/product-gold.svg`, isPrimary: true }];
  await db.insert(productImages).values(
    images.map((image, index) => ({
      productId: product.id,
      url: image.url,
      alt: name,
      isPrimary: image.isPrimary,
      sortOrder: index,
    })),
  );

  return product;
}

export const sampleHero: HeroContent = {
  headline: { ar: "تلبسيها كل يوم.", en: "Worn every day." },
  headlineAccent: { ar: "وعمرها ما تبهت.", en: "Never fades." },
  subline: { ar: "ستانلس ستيل.", en: "Stainless steel." },
  primaryCta: { label: { ar: "تسوقي", en: "Shop Now" }, href: "/shop" },
  secondaryCta: { label: { ar: "المجموعات", en: "Collections" }, href: "/shop" },
  posterUrl: "/assets/placeholder/hero-poster.svg",
};

export const sampleStory: StoryContent = {
  title: { ar: "قصة SIWAR", en: "The SIWAR Story" },
  body: { ar: "بدأت بفكرة بسيطة.", en: "It began with a simple idea." },
  imageUrl: "/assets/placeholder/story.svg",
  ctaLabel: { ar: "اعرفي المزيد", en: "Learn more" },
  ctaHref: "/about",
};

type ContentBlockSeed = {
  key: string;
  data?: Record<string, unknown>;
  sortOrder?: number;
  isActive?: boolean;
};

export async function seedContentBlock(seed: ContentBlockSeed) {
  const [block] = await db
    .insert(contentBlocks)
    .values({
      key: seed.key,
      data: seed.data ?? {},
      sortOrder: seed.sortOrder ?? 0,
      isActive: seed.isActive ?? true,
    })
    .returning();
  if (!block) throw new Error("could not seed content block");
  return block;
}

type PageSeed = { slug: string; title?: L10n; body?: L10n };

export async function seedPage(seed: PageSeed) {
  const [page] = await db
    .insert(pages)
    .values({
      slug: seed.slug,
      title: seed.title ?? { ar: `صفحة ${seed.slug}`, en: seed.slug },
      body: seed.body ?? { ar: `نص ${seed.slug}`, en: `${seed.slug} body` },
    })
    .returning();
  if (!page) throw new Error("could not seed page");
  return page;
}

/** Inserts the settings singleton; pass overrides to exercise a specific field. */
export async function seedSettings(overrides: Partial<NewStoreSettings> = {}) {
  const [row] = await db
    .insert(storeSettings)
    .values({
      shipping: { defaultFee: 60, expressFee: 120, freeAbove: 3000 },
      paymentMethods: [
        { id: "cod", name: { ar: "الدفع عند الاستلام", en: "Cash on Delivery" }, isEnabled: true },
        {
          id: "instapay",
          name: { ar: "إنستاباي", en: "InstaPay" },
          isEnabled: false,
          instructions: { ar: "حوّلي المبلغ.", en: "Transfer the amount." },
          accountValue: "01278259732",
        },
      ],
      trustBadges: {
        shipping: { ar: "شحن لكل المحافظات", en: "Shipping nationwide" },
        payment: { ar: "دفع عند الاستلام", en: "Cash on delivery" },
        returns: { ar: "استبدال 14 يوم", en: "14-day returns" },
        support: { ar: "دعم واتساب", en: "WhatsApp support" },
      },
      social: [{ platform: "instagram", url: "https://www.instagram.com/siwar_accessories00/" }],
      contact: { phone: "01041921899", whatsapp: "https://wa.me/201041921899" },
      ...overrides,
    })
    .returning();
  if (!row) throw new Error("could not seed store settings");
  return row;
}

type CouponSeed = {
  code: string;
  type?: CouponType;
  value?: number;
  minOrder?: number;
  maxDiscount?: number | null;
  freeShipping?: boolean;
  expiresAt?: Date | null;
  usageLimit?: number | null;
  usedCount?: number;
  isActive?: boolean;
};

/** Inserts a coupon directly so checkout/coupon tests control every rule. */
export async function seedCoupon(seed: CouponSeed) {
  const [coupon] = await db
    .insert(coupons)
    .values({
      code: seed.code.toUpperCase(),
      type: seed.type ?? "percent",
      value: (seed.value ?? 10).toFixed(2),
      minOrder: (seed.minOrder ?? 0).toFixed(2),
      maxDiscount: seed.maxDiscount === undefined || seed.maxDiscount === null
        ? null
        : seed.maxDiscount.toFixed(2),
      freeShipping: seed.freeShipping ?? false,
      expiresAt: seed.expiresAt ?? null,
      usageLimit: seed.usageLimit ?? null,
      usedCount: seed.usedCount ?? 0,
      isActive: seed.isActive ?? true,
    })
    .returning();
  if (!coupon) throw new Error("could not seed coupon");
  return coupon;
}

