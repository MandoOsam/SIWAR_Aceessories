import { hashPassword } from "@/lib/password.js";
import { db } from "@/db/client.js";
import { categories } from "@/db/schema/categories.js";
import { productImages } from "@/db/schema/productImages.js";
import { products } from "@/db/schema/products.js";
import type { ProductStatus } from "@/db/schema/products.js";
import type { UserRole } from "@/db/schema/users.js";
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
