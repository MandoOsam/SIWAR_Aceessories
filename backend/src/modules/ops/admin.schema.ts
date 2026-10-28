import { z } from "zod";

const l10n = z.object({ ar: z.string().min(1), en: z.string().min(1) });

export const dashboardQuerySchema = z.object({
  range: z.enum(["7d", "30d", "90d"]).optional().default("30d"),
});

export const inventoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  lowStock: z.union([z.boolean(), z.enum(["true", "false"])]).transform((v) => v === true || v === "true").optional(),
});

export const adjustInventorySchema = z
  .object({
    productId: z.uuid(),
    delta: z.number().int(),
    reason: z.string().trim().min(1).max(128),
  })
  .strict();

export const campaignBodySchema = z
  .object({
    name: l10n,
    discountPercent: z.number().int().min(1).max(90),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    isActive: z.boolean().optional().default(true),
    target: z
      .object({
        products: z.array(z.uuid()).optional(),
        categories: z.array(z.uuid()).optional(),
      })
      .optional()
      .default({}),
  })
  .strict();

export const campaignIdParamSchema = z.object({ id: z.uuid() });

export const activityQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  actorId: z.string().optional(),
  action: z.string().optional(),
  entity: z.string().optional(),
});

export type AdjustInventoryInput = z.infer<typeof adjustInventorySchema>;
export type CampaignBody = z.infer<typeof campaignBodySchema>;
export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
export type InventoryQuery = z.infer<typeof inventoryQuerySchema>;
export type ActivityQuery = z.infer<typeof activityQuerySchema>;
