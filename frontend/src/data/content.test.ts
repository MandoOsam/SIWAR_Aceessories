import { describe, expect, it } from "vitest";

import { storeSettings } from "@/data/content";
import { isPlaceholder, toInternationalPhone } from "@/utils/format";

/**
 * The owner's confirmed contact channels.
 *
 * These were supplied directly by the owner on 2026-10-04 and are asserted exactly, so a later
 * refactor cannot quietly drop, truncate or re-point a real channel. They live in `storeSettings`
 * only — mirroring `GET /settings/public` — and every component reads them from the service layer.
 */
const CONFIRMED = {
  phone: "01041921899",
  whatsapp: "https://wa.me/201041921899",
  instagram: "https://www.instagram.com/siwar_accessories00/",
  tiktok: "https://www.tiktok.com/@siwar.accessories0",
  facebook: "https://www.facebook.com/share/1FrbTF2X3L/?mibextid=wwXIfr",
};

describe("storeSettings contact channels", () => {
  it("holds the owner's confirmed phone number", () => {
    expect(storeSettings.contact.phone).toBe(CONFIRMED.phone);
  });

  it("holds the owner's confirmed WhatsApp link", () => {
    expect(storeSettings.contact.whatsapp).toBe(CONFIRMED.whatsapp);
  });

  it("holds all three confirmed social profile URLs", () => {
    const urls = Object.fromEntries(storeSettings.social.map((item) => [item.platform, item.url]));

    expect(urls.instagram).toBe(CONFIRMED.instagram);
    expect(urls.tiktok).toBe(CONFIRMED.tiktok);
    expect(urls.facebook).toBe(CONFIRMED.facebook);
  });

  it("keeps the WhatsApp target consistent with the published phone number", () => {
    const fromLink = storeSettings.contact.whatsapp?.replace(/^https:\/\/wa\.me\//, "");
    expect(fromLink).toBe(toInternationalPhone(storeSettings.contact.phone).replace("+", ""));
  });

  it("uses absolute https URLs so no channel depends on the current page", () => {
    for (const item of storeSettings.social) {
      expect(item.url.startsWith("https://")).toBe(true);
    }
    expect(storeSettings.contact.whatsapp?.startsWith("https://wa.me/")).toBe(true);
  });

  it("reports no confirmed channel as a placeholder, so none is hidden", () => {
    expect(isPlaceholder(storeSettings.contact.phone)).toBe(false);
    expect(isPlaceholder(storeSettings.contact.whatsapp)).toBe(false);
    expect(storeSettings.social.every((item) => !isPlaceholder(item.url))).toBe(true);
  });

  it("still hides the unsupported email instead of publishing a placeholder", () => {
    // No support email has been supplied by the owner yet, so it must stay a placeholder and the
    // footer must keep filtering it out.
    expect(isPlaceholder(storeSettings.contact.email)).toBe(true);
  });

  it("covers every platform the contract allows", () => {
    expect(storeSettings.social.map((item) => item.platform).sort()).toEqual([
      "facebook",
      "instagram",
      "tiktok",
    ]);
  });
});
