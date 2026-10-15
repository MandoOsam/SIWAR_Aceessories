# 08 — Owner UI Revisions (Storefront Polish)

> Scope file for the 9 UI/UX revisions requested by the owner after F7.
> Companion to `05-ui-context.md` (the storefront spec). Where they conflict, **`05` wins** unless this file marks an explicit "Scope exception".
> Branch: `The last updates in storefront`
> Last updated: 2026-10-14

---

## Why this file exists

F7 closed the storefront. The owner reviewed it and requested 9 polish revisions that touch F1 tokens, the F2 Navbar/Hero, the F5 checkout, and add a new 3D scene. None of them change the API contract (`02-architecture.md`), the DB schema, or the auth model. They are **UI/UX + a11y + performance polish** on already-shipped files.

Because most of these files are F1/F2/F5 artifacts, every revision below is an **owner-approved scope exception** — same pattern as D-041 and D-049. The exception is recorded in the Decisions log per revision.

---

## Revision R1 — Color tokens refresh (medium)

**Goal:** Refresh `tokens.css` so text, icons, borders, and muted surfaces are visibly clearer in both themes, and fix the known WCAG violation (`--accent` on `--bg` = 4.43:1 in light theme).

**Scope:**
- Adjust `--accent`, `--accent-2`, `--text-muted`, `--border`, `--surface-2` in both `:root` and `.dark`.
- **Do not** change `--bg`, `--surface`, `--text` (too risky — used by 50+ components).
- Target: every foreground/background pair in `05-ui-context.md §4.1` must reach **≥ 4.5:1** (normal text) or **≥ 3:1** (large text / UI borders).

**Files touched:**
- `frontend/src/styles/tokens.css`
- `frontend/src/styles/globals.css` (only if a token rename is needed)

**Decisions respected:** D-013 (dark + light, mobile-first), `03-code-standards.md §5` (tokens only, no hard-coded hex), `05-ui-context.md §4.1`.

**Contract impact:** None.

**Risks:**
- Changing `--accent` shifts the primary button, active nav item, price text, and CTA color everywhere. Must be verified visually on: Home hero, Product page, Cart summary, Checkout payment step.
- Contrast audit must be re-run per theme.

**Acceptance criteria:**
- `--accent` light on `--bg` light ≥ 4.5:1.
- All tokens documented in `tokens.css` with the new value.
- No component in `frontend/src/` contains a raw hex outside `tokens.css` (spot-check with `grep`).

---

## Revision R2 — Logo theme-aware + Navbar spacing (light mode clarity)

**Goal:** Logo shows **white in dark theme, black in light theme**. Navbar icons and text get more breathing room so they are clearly readable, especially in light mode.

**Scope:**
- **Step 0 (verification):** open `frontend/public/assets/logo/siwar-logo.svg` and confirm it uses `fill="currentColor"` (or `stroke="currentColor"`). If it hard-codes a fill, **stop and report to the owner** before touching anything.
- Assuming `currentColor`: apply `text-fg` to the SVG (already the default text token → white in dark, near-black in light). No new asset needed.
- If the SVG is **not** `currentColor`: fall back to the two-PNG approach already supported by the F1 `Logo` component (`siwar-logo.png` in dark, `siwar-logo-dark-ink.png` in light) using a theme-aware `src`.
- Navbar spacing: increase the gap between the icon cluster (`search`, `wishlist`, `cart`, `account`, `language`, `theme`) and between the logo and the menu. Ensure the light-theme icon color uses the refreshed `--text` token from R1.

**Files touched:**
- `frontend/src/components/layout/Navbar.tsx`
- `frontend/src/components/ui/Logo.tsx` (or wherever `Logo` lives — verify first)
- `frontend/public/assets/logo/siwar-logo.svg` (only if it needs `currentColor` fix)

**Decisions respected:** O-009 (logo set incomplete — this revision must not assume files that do not exist), `05-ui-context.md §7.1`.

**Contract impact:** None.

**Risks:**
- If the SVG is not `currentColor`, the fix might require editing the SVG — which is **out of scope** without owner approval.
- Spacing change could break the mobile drawer alignment — verify at 360px.

**Acceptance criteria:**
- Logo is visibly white on dark and black on light on every page.
- Navbar elements have ≥ 8px horizontal gap between icons; ≥ 16px between the logo cluster and the menu.
- Mobile drawer still aligns correctly in AR + EN.

---

## Revision R3 — Social icons + WhatsApp CTA + Payment method icons

**Goal:** Three icon-related improvements grouped because they share the same asset/i18n layer.

### R3.a — Social icons (Footer + Contact page)
- Replace the current social icons (Facebook, Instagram, TikTok) with **larger, clearer** ones.
- Recommended size: 24px (up from 20px). Ensure they are `aria-label`ed and reach 44px touch target via padding.
- Use inline SVG (Lucide does not ship a TikTok icon; add it as a small local SVG component) — **no new npm dependency**.

### R3.b — WhatsApp CTA
- Add a **floating WhatsApp button** on the **Home page and Contact page** (owner-specified).
- Color: WhatsApp green (`#25D366`) — this is one of the only places a raw brand color is allowed (the WhatsApp brand color is fixed). Document it as a named exception in `tokens.css` (`--brand-whatsapp`).
- Icon: WhatsApp glyph (inline SVG, no new dep).
- **Animation:** subtle pulse ring + gentle bounce on mount. Must respect `prefers-reduced-motion` (no animation when reduced).
- Number: `01041921899` — read from `data/content.ts` as `storeSettings.social.whatsapp` with `TODO(Mando)` marker (Admin-editable later).

### R3.c — Payment method icons (Checkout + Footer)
- Add recognizable icons for **Vodafone Cash** and **InstaPay** in:
  - `components/checkout/PaymentStep.tsx` (next to each payment method label).
  - `Footer` (as payment badges).
- Numbers (owner-provided):
  - Vodafone Cash: `01041921899`
  - InstaPay: `01278259732`
- **Where the numbers live:** add to `frontend/src/data/content.ts` inside `storeSettings.paymentMethods`, as `TODO(Mando)` placeholder data (same pattern as the rest of the mock). The `PaymentStep` already reads from `storeSettings.paymentMethods` (F5.2) — no plumbing change needed.
- Icons: inline SVG components in `frontend/src/components/icons/` (do **not** add an icon library).

**Files touched:**
- `frontend/src/components/layout/Footer.tsx`
- `frontend/src/pages/ContactPage.tsx`
- `frontend/src/pages/HomePage.tsx` (mount the floating WhatsApp button)
- `frontend/src/components/checkout/PaymentStep.tsx`
- `frontend/src/components/icons/` (new folder — 4 small SVGs: WhatsApp, Vodafone Cash, InstaPay, TikTok)
- `frontend/src/data/content.ts`
- `frontend/src/styles/tokens.css` (add `--brand-whatsapp`)

**Decisions respected:** D-007 (payments = COD/InstaPay/Vodafone Cash), D-012 (no new libs without asking), `05-ui-context.md §7.8`.

**Contract impact:** None. `storeSettings.paymentMethods` shape already exists.

**Risks:**
- The floating WhatsApp button on Home must not overlap the mobile sticky `AddToCart` bar (product page only — Home is safe, but verify).
- If `PaymentStep` currently renders instructions as plain text, adding icons must not break the existing i18n keys.

**Acceptance criteria:**
- WhatsApp button visible on Home + Contact, opens `https://wa.me/201041921899` in a new tab.
- Pulse animation visible, disabled under `prefers-reduced-motion`.
- Vodafone Cash + InstaPay icons visible in checkout payment step + footer, with their numbers.
- No new npm dependency.

---

## Revision R4 — Home CTA icon sizing

**Goal:** The "Shop Now" button icon (and its neighbor) is too small; make both visibly larger without breaking the button layout.

**Scope:**
- Locate the Home hero CTA block (`sections/home/Hero*` or the button component used).
- Increase icon size from the current value (likely `h-4 w-4` / 16px) to `h-5 w-5` (20px) or `h-6 w-6` (24px) — pick one and apply to **both** the primary and the secondary CTA.
- Verify the button's padding/height still matches the design system (`05-ui-context.md §4.3`).

**Files touched:**
- `frontend/src/sections/home/Hero.tsx` (or `HeroActions.tsx` — verify filename first)
- `frontend/src/components/ui/Button.tsx` (only if the icon size is set there)

**Decisions respected:** `05-ui-context.md §4.3` (button rules).

**Contract impact:** None.

**Risks:** None significant — verify button height does not exceed the design token.

**Acceptance criteria:**
- Both CTA icons are visibly larger.
- Button heights unchanged.
- Works at 360 / 768 / 1280px in AR + EN.

---

## Revision R5 — New 3D scene (modern, Gen-Z) in a second section

**Goal:** Keep the existing Hero 3D scene. Add a **new** 3D scene in a **different section** that feels modern/trendy and appeals to Gen-Z — without breaking Lighthouse (already below target).

**Scope:**
- **Pick the section:** owner has not specified which section. **The owner must confirm the target section before implementation** (see Open Question O-R5 below).
- Recommended: a new dedicated section between `BestSellers` and `OurStory`, or integrated into `Offers` countdown (a floating 3D number? a rotating ring? a low-poly pendant?).
- **Performance guardrails (mandatory):**
  - `React.lazy` the new scene.
  - Load only when the section enters the viewport (`IntersectionObserver`).
  - Static image fallback if WebGL unavailable (same pattern as the F2 hero hotfix).
  - Respect `prefers-reduced-motion`.
  - Target added weight: **≤ 150 KB gzip** for the new chunk.
- **Do not touch** the existing `Hero3DScene` (825 KB / 222 KB gzip is already flagged — R5 must not make it worse).

**Files touched (expected, to be confirmed):**
- `frontend/src/three/<NewScene>.tsx` (new)
- `frontend/src/sections/home/<TargetSection>.tsx`
- `frontend/src/locales/{ar,en}.json` (heading/caption keys if the section is new)

**Decisions respected:** D-018 (storefront first — no backend dependency), `05-ui-context.md §5.4` (performance guardrails, prefers-reduced-motion), `06` Known Issues (Hero3D chunk size).

**Contract impact:** None.

**Risks:**
- **HIGH:** adding a second 3D scene can push Lighthouse Performance further down. The verification step in R6 must run Lighthouse on Home and report the number. If Performance drops below the current baseline, R5 must be revised before merge.
- If the new scene reuses `@react-three/drei` helpers, bundle size can grow fast. Prefer raw geometry if possible.

**Acceptance criteria:**
- New 3D section renders in isolation.
- Chunk ≤ 150 KB gzip.
- Static fallback renders when WebGL is off.
- Animation disabled under `prefers-reduced-motion`.
- Lighthouse Home Performance is **not worse** than the pre-R5 baseline.

**Open Question O-R5 (blocker for R5):** Which section hosts the new 3D scene? Owner must answer before R5 starts.

---

## Revision R6 — Final verification (no new code)

**Goal:** End-to-end verification of R1–R5 and sign-off.

**Scope:**
- Run `npm run build`, `npm run lint`, `npm test` in `frontend/`.
- Verify i18n key parity AR/EN (should remain equal counts).
- Lighthouse mobile on `/` and `/contact` (before/after comparison).
- Manual test at 360 / 768 / 1280px, dark + light, AR + EN.
- Confirm no new npm dependency was added.
- Confirm `Hero3DScene` bundle size did not grow.
- Update `06-progress-tracker.md`: mark R1–R5 done, add the R6 verification report.

**Files touched:** `context/06-progress-tracker.md` only.

**Decisions respected:** `04-ai-workflow-rules.md §9` (end-of-phase protocol).

---

## Open Questions (owner)

| ID | Question | Blocks |
|---|---|---|
| O-R5 | Which section hosts the new 3D scene? | R5 |
| O-R6 | Any objection to documenting `--brand-whatsapp: #25D366` as a named token exception? | R3 |
| O-R7 | Keep `01041921899` for WhatsApp only, or also add it as the Contact phone number on `/contact`? | R3 |

---

## Decisions log additions (to be appended by the agent, not now)

The implementing agent will append one decision per revision to `06-progress-tracker.md` §4 following the standard format (`D-0NN | date | summary | source`).

---

## Checklist

- [ ] R1 — Color tokens refreshed, contrast ≥ 4.5:1
- [ ] R2 — Logo theme-aware, Navbar spacing fixed
- [ ] R3 — Social icons bigger, WhatsApp CTA, payment icons + numbers
- [ ] R4 — Home CTA icons larger
- [ ] R5 — New 3D scene (section TBD by owner)
- [ ] R6 — Verification + tracker updated