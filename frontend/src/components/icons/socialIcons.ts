import { Facebook, Instagram } from "lucide-react";
import type { ElementType } from "react";

import type { StoreSettings } from "@/services/types";

import { TikTokIcon } from "./TikTokIcon";

type SocialPlatform = StoreSettings["social"][number]["platform"];

/**
 * One icon per social platform (08-owner-ui-revisions.md §R3.a). Facebook and Instagram come from
 * Lucide; TikTok is the local `TikTokIcon` because Lucide ships no brand mark for it.
 */
export const SOCIAL_ICONS: Record<SocialPlatform, ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  tiktok: TikTokIcon,
};
