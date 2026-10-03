# 05 — UI Context: Customer Storefront (`frontend/`)

> Context file 05 of the SIWAR 6-file context system. Read `AGENTS.md` first.
> Scope: **Customer storefront only** (folder `frontend/`). The admin UI is in `05b-ui-context-admin.md`.
> Reference images live in `frontend/public/assets/reference/` (inspiration only). Logo files are in `frontend/public/assets/logo/`.
> Stack, API and code rules come from `02-architecture.md` and `03-code-standards.md`; if this file conflicts with them, those win.
> Items marked `TODO(Mando)` are things I will provide or edit later.

---

## 0. Your Role

You are a senior frontend engineer and UI designer. Build the **SIWAR customer storefront**: a luxury, dark-feminine, highly animated, mobile-first e-commerce site for a **stainless steel jewelry** brand for women.

This is a **new project**. Do not copy any reference design 1:1. Use the references only for patterns, mood and structure.

---

## 1. Brand

| Item | Value |
|---|---|
| Brand name | **SIWAR** (always in Latin letters, in both languages) |
| Products | Stainless steel jewelry for women |
| Categories | Necklaces (سلاسل), Rings (خواتم), Bracelets (انسيال), Earrings (حلقان), Sets (سيتات) |
| Market | Egypt — currency **EGP** |
| Mood | Dark feminine minimalism, romantic, quiet luxury, sensual but elegant |
| Logo | `TODO(Mando)` → `public/assets/logo/` (use it exactly, do not redraw) |

**Trust message (use across the site):** stainless steel = rust-resistant, tarnish-resistant, water-friendly, suitable for sensitive skin. Keep wording factual, no exaggerated medical claims.

---

## 2. Reference Images (`/reference`)

Take **ideas only**, per component:

| Component | Take from | What to take |
|---|---|---|
| Overall mood | Dark Feminine Minimalism / Lune Noire (Behance) | Black backgrounds, mixed serif + italic headlines, clean grid, light-grey product cards, Trending Now |
| Navbar | Brunello Cucinelli | Transparent navbar over hero, centered logo, minimal icons |
| Category tiles | Lumea | Square image tiles with centered labels, slider arrows |
| Overlapping story cards | Lumea | White/dark card overlapping a photo with badge + CTA |
| Product card | Lumea + Lune Noire | Rating, old price struck through, new price, wishlist heart, add-to-cart |
| Product page | Ring product page | Large gallery, price + discount, wishlist/cart buttons, Matching Products |
| Trust badges + Our Story | Lumea | 4 small trust boxes, full-width story banner |
| Big editorial headline | Canva magazine | Only the idea of one large condensed headline on a section |

**Do NOT copy:** press logos (Vogue / Elle / Bazaar / Marie Claire — SIWAR is not featured there), any model photos, any text, any brand names.

---

## 3. Tech Stack

- React 18 + Vite, **TypeScript (strict)**
- Tailwind CSS (with logical properties for RTL: `ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`)
- React Router
- i18next (Arabic + English)
- Framer Motion + GSAP (ScrollTrigger) + Lenis (smooth scroll)
- Three.js via `@react-three/fiber` + `@react-three/drei` (3D)
- Zustand (cart, wishlist, theme, language)
- React Hook Form + Zod (checkout, auth, review forms)
- TanStack Query (server state, caching)
- Lucide icons

Do not add other libraries without asking first.

---

## 4. Design Tokens

All colors as CSS variables, mapped in `tailwind.config.js`. Never hard-code hex values in components.

### 4.1 Colors (initial palette — adjust to the logo once provided)

**Dark mode (default)**

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0B0909` | Page background |
| `--surface` | `#151112` | Cards, sections |
| `--surface-2` | `#1E1819` | Elevated cards, inputs |
| `--border` | `#2C2325` | Lines |
| `--text` | `#F3EDE6` | Main text |
| `--text-muted` | `#A89C98` | Secondary text |
| `--accent` | `#C9A66B` | Antique gold, CTA, highlights |
| `--accent-2` | `#B76E79` | Dusty rose, badges, hearts |
| `--wine` | `#3A141D` | Deep burgundy gradients |
| `--silver` | `#CFCFD4` | Silver highlights |

**Light mode**

| Token | Value |
|---|---|
| `--bg` | `#F6F0E8` |
| `--surface` | `#FFFFFF` |
| `--surface-2` | `#EFE6DB` |
| `--border` | `#DDD0C2` |
| `--text` | `#1A1213` |
| `--text-muted` | `#6E605C` |
| `--accent` | `#8A6A2F` |
| `--accent-2` | `#A24F5C` |

`TODO(Mando)`: if the logo uses specific colors, replace `--accent` / `--accent-2` with them.

### 4.2 Typography

| Role | English | Arabic |
|---|---|---|
| Headings | Playfair Display (also Italic for emphasis words) | Amiri or Noto Naskh Arabic |
| Body / UI | Inter | IBM Plex Sans Arabic |
| Big editorial headline | Condensed uppercase, tight leading (Canva idea) | Same Arabic heading font, heavy weight |

Rules: fluid sizes with `clamp()`, body ≥ 16px on mobile, mix one *italic* word inside headings for the dark-feminine look.

### 4.3 Shape, Spacing, Motion

- Radius: small (2–4px) for cards and buttons — sharp luxury feel. Pill shape only for badges.
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128.
- Container: max 1280px, side padding 16px mobile / 32px desktop.
- Buttons: primary = gold fill, secondary = outline, hover = slow fill-sweep animation.
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)`, durations 0.4–0.9s.

---

## 5. Global Rules

### 5.1 Language & Direction
- Arabic + English, switchable from the navbar. Default: Arabic (RTL).
- `<html dir lang>` updates on switch; layout must mirror correctly (arrows, sliders, menus, progress bars).
- All text lives in `locales/ar.json` and `locales/en.json`. No hard-coded strings.
- Brand name stays **SIWAR** in both languages.
- Numbers and prices formatted per language; currency label `EGP` / `ج.م`.

### 5.2 Theme
- Dark (default) + Light, toggle in the navbar, saved in `localStorage`, respects `prefers-color-scheme` on first visit.
- Smooth theme transition; images and 3D scenes must also look right in light mode.

### 5.3 Mobile-First
- Design at 360px first, then scale up (sm / md / lg / xl).
- Touch targets ≥ 44px. Bottom sheet for filters, drawer for cart and menu on mobile.
- Sticky bottom "Add to cart" bar on product page (mobile).

### 5.4 Animation & 3D (high level)
- Smooth scrolling (Lenis), scroll-triggered reveals, text split / mask reveals on headlines, image parallax, magnetic buttons, custom cursor on desktop only, page transitions, hover micro-interactions on product cards (second image on hover, quick-add).
- **3D:** one signature 3D element in the Hero or a dedicated section (for example a floating ring/pendant model or particles reacting to mouse / scroll). Lazy-loaded, with a static image fallback.
- **Hero background:** an animated background file will be provided → `TODO(Mando)` at `public/assets/hero/`. Build the Hero so the background is a swappable asset (video / animated file), with a dark overlay for text readability and a poster image fallback.
- **Performance guardrails:** respect `prefers-reduced-motion` (disable heavy effects), lazy-load 3D and video, pause animations off-screen, reduce effects on low-end / mobile devices, target Lighthouse performance ≥ 80 on mobile.

### 5.5 Accessibility & SEO
- Semantic HTML, alt text on all images, visible focus states, contrast ≥ 4.5:1 in both themes.
- Per-page title and meta description, Open Graph tags, clean slugs.

---

## 6. Data Layer (important)

Backend is **Node/Express + TypeScript + PostgreSQL (Supabase)** in the `backend/` folder (see `02-architecture.md` for the API contract). Auth uses an **httpOnly session cookie**, so every request uses `credentials: "include"`. For now (until the API exists):

- All data goes through `src/services/api.ts` (one function per endpoint). Components never import mock data directly.
- Mock data in `src/data/` with the same shape the real API will return. Switching to the real API = changing the base URL in `.env` (`VITE_API_URL`).
- Everything content-related must be **editable from the Admin Dashboard**, so never hard-code it: products, images, categories, hero content, banners, brand story, reviews, trust badge values, shipping fee, payment methods, social links.
- Images are always URLs coming from data (uploaded by the admin). Use placeholders in mock data.

Types mirror the API contract in `02-architecture.md` (ids are UUID strings, money is a number in EGP, dates are ISO strings):

```ts
type L10n = { ar: string; en: string };

interface Product {
  id: string; slug: string;
  name: L10n; description: L10n;
  category: { id: string; slug: "necklaces" | "rings" | "bracelets" | "earrings" | "sets"; name: L10n };
  price: number; oldPrice?: number; discountPercent?: number;
  images: { url: string; alt: L10n; isPrimary: boolean }[];
  colors: ("gold" | "silver" | "rose-gold" | "black")[];
  sizes?: string[];            // rings only
  stock: number; isNew: boolean; isBestSeller: boolean; isFeatured: boolean;
  rating: number; reviewsCount: number;
  material: "stainless-steel";
  createdAt: string;
}
```

---

## 7. Pages & Layouts

Build every page below. Mobile layout first, then desktop.

### 7.1 Navbar (global)
- Transparent over the Hero, turns solid (blurred glass) on scroll; hides on scroll down, shows on scroll up.
- Elements: Logo (center on desktop, start on mobile), Search, Categories (mega menu on desktop / drawer on mobile), Wishlist, Cart (with count badge), Language switch, Theme toggle, Account.
- Search opens a full-screen overlay with suggestions and recent searches.

### 7.2 Home `/`
Sections in this order:

1. **Hero** — animated background + 3D element, big mixed serif/italic headline, subline, 2 CTAs (Shop Now / Explore Collections), scroll indicator.
2. **Trust strip** — stainless steel benefits (rust-resistant, tarnish-resistant, sensitive-skin friendly, water-friendly).
3. **Shop by Category** — 5 tiles (Necklaces, Rings, Bracelets, Earrings, Sets), horizontal slider on mobile.
4. **New Arrivals** — product slider.
5. **Featured Collections** — 2 large image panels with italic headlines (Lumea idea).
6. **Best Sellers** — product grid / slider.
7. **Offers / Limited-Time** — countdown + discounted products.
8. **Our Story** — full-width banner with parallax image + "Learn more" (see Section 9).
9. **Recommended for You** — product slider.
10. **Recently Viewed** — shown only if the user viewed products.
11. **Testimonials / Reviews** — see Section 10.
12. **Trust badges** — Shipping, Secure payment, Returns, Support (values from settings).
13. **Newsletter** — email signup.
14. **Footer** — logo, short about, links (Shop, About, Contact, FAQ, Shipping, Returns, Privacy, Terms), payment methods, social icons, copyright.

> Do **not** add a "Featured in Vogue / Elle" press bar.

### 7.3 Shop `/shop`
- Product grid (2 columns mobile, 3 tablet, 4 desktop), search, sort, pagination (or "Load more").
- **Filters:** Category, Price range, Rating, Availability, Color, Size (rings only), Discount, New products.
- **Sort:** Newest, Best selling, Price low→high, Price high→low, Top rated.
- Mobile: filters in a bottom sheet with Apply / Clear. Show active filters as removable chips.
- Do **not** add a Brand filter (single brand).

### 7.4 Category `/category/:slug`
Slugs: `necklaces`, `rings`, `bracelets`, `earrings`, `sets`.
Category banner (image + description), same filters / sort / pagination as Shop.

### 7.5 Product `/products/:slug`
- Gallery (thumbnails + zoom + swipe on mobile), name, rating, price, old price, discount badge.
- Description, **Material block** (stainless steel, rust-resistant, tarnish-resistant, sensitive-skin friendly).
- Variants: color, size (rings), quantity, stock status.
- Actions: Add to Cart, Buy Now, Wishlist, Share.
- Shipping info + return policy accordion.
- Reviews (summary + list), Matching Products (Ring page reference), Related Products, Recently Viewed.

### 7.6 Search `/search?q=`
Autocomplete suggestions, recent + popular searches, results grid with filters/sort, friendly "no results" state with suggestions.

### 7.7 Cart `/cart` (also a slide-in drawer)
Items (image, name, variant, quantity, remove), save for later, coupon field, subtotal, shipping, discount, total, Continue Shopping, Checkout.

### 7.8 Checkout `/checkout`
Guest checkout allowed. Steps with progress bar:
1. Customer info (name, phone, email)
2. Shipping address (governorate, city, address, building, apartment)
3. Delivery (Standard / Express — fees from settings)
4. Payment (enabled methods from settings): **Cash on Delivery**, **InstaPay transfer**, **Vodafone Cash**. For the two transfer methods show the account/number + instructions and let the customer upload a screenshot of the transfer (optional). No online card payment in v1.
5. Review order → Place Order

### 7.9 Order Success `/order/success/:id`
Order number, total, estimated delivery, Track Order, Continue Shopping, subtle celebration animation.

### 7.10 Track Order `/track-order`
Input order number + phone → timeline: Confirmed → Processing → Shipped → Delivered.

### 7.11 Auth
`/login`, `/register`, `/forgot-password`, `/reset-password`.

### 7.12 Account `/account`
Profile, Orders (`/account/orders`), Order details (`/account/orders/:id` with invoice, cancel, return, review product), Wishlist (`/wishlist`), Addresses (add / edit / delete / set default), Notifications, Password, Logout.

### 7.13 Static pages
`/about`, `/contact`, `/faq`, `/shipping`, `/returns`, `/privacy`, `/terms`. Content comes from data (editable later).

### 7.14 404 / Empty states
Styled 404, empty cart, empty wishlist, no results.

---

## 8. Core Components

`Navbar`, `MobileDrawer`, `SearchOverlay`, `Hero` (with `HeroBackground` + `Hero3D`), `SectionHeading`, `CategoryTile`, `ProductCard`, `ProductSlider`, `ProductGallery`, `PriceTag`, `RatingStars`, `Badge`, `Button`, `QuantityStepper`, `FilterPanel` / `FilterSheet`, `SortSelect`, `Pagination`, `CartDrawer`, `CheckoutStepper`, `OrderTimeline`, `ReviewCard`, `ReviewForm`, `TrustBadges`, `Newsletter`, `Footer`, `ThemeToggle`, `LanguageSwitch`, `Skeleton`, `Toast`, `Accordion`, `Modal`.

ProductCard states: default, hover (second image + quick add), wishlisted, out of stock, discount badge, "New" badge.

---

## 9. Brand Story (suggested copy — editable from admin)

**English**

> SIWAR began with a simple idea: jewelry should feel as strong as the woman wearing it.
> We design stainless steel pieces that keep their shine through every day — resistant to rust and tarnish, gentle on sensitive skin, made to be worn in the morning and still look perfect at night.
> Each piece balances quiet elegance with a little darkness: clean lines, warm gold tones, and details you only notice up close.
> No compromise between beauty and durability. Just pieces you never have to take off.

**Arabic**

> بدأت SIWAR بفكرة بسيطة: الإكسسوار لازم يكون قوي زي الست الي بتلبسه.
> بنصمم قطع ستانلس ستيل بتحافظ على لمعتها كل يوم، مقاومة للصدأ والاسوداد، ولطيفة على البشرة الحساسة، تلبسها الصبح وتفضل شكلها مثالي بالليل.
> كل قطعة بتجمع بين الأناقة الهادية ولمسة غموض: خطوط نضيفة، ودرجات دهبي دافية، وتفاصيل بتلاحظها لما تقرب.
> مفيش تنازل بين الجمال والجودة. قطع عمرك ما هتحتاجي تقلعيها.

Headline options for the Hero (pick one, keep editable):
- EN: "Worn Every Day. *Never Fades.*" / AR: "تلبسيها كل يوم. وعمرها ما تبهت."
- EN: "Dark Elegance, *Made to Last.*" / AR: "أناقة غامضة، *مصنوعة لتدوم.*"

---

## 10. Reviews

- Seed **8 sample reviews** (mixed AR/EN, ratings 4–5, with first name + governorate, short text about quality, shine, sensitive skin, packaging, delivery) as mock data.
- Reviews are fully **managed from the admin dashboard** (add / edit / hide / delete) and can be linked to a product or shown on the homepage.
- Do **not** show a "Verified purchase" badge on seeded reviews. Only reviews created from real orders get that badge.
- `TODO(Mando)`: replace the seeded reviews with real customer reviews before launch.
- Customers can submit a review (rating, text, optional images) → goes to "pending" until the admin approves.

---

## 11. Folder Structure

```
src/
  assets/
  components/        # reusable UI
  sections/          # home page sections
  pages/
  layouts/
  three/             # 3D scenes
  hooks/
  store/             # zustand stores
  services/          # api.ts
  data/              # mock data
  locales/           # ar.json, en.json
  styles/            # tokens.css, globals.css
  utils/
public/assets/
  logo/              # TODO(Mando)
  hero/              # TODO(Mando) animated background
  reference/         # inspiration only
```

---

## 12. Rules for the AI Agent

1. Use the references for inspiration only; never copy text, brand names, or images.
2. Do not add libraries outside Section 3 without asking.
3. No hard-coded colors, strings, or content; use tokens, locale files, and the data layer.
4. Build with logical properties so RTL and LTR both work.
5. Keep components small and reusable; one component per file.
6. Work page by page, in this order: tokens + layout → Navbar/Footer → Home → Shop/Category → Product → Cart/Checkout → Account/Static. Stop after each stage and summarize what was done.
7. Do not modify files unrelated to the current task.
8. Test every page at 360px, 768px, and 1280px, in dark and light, in Arabic and English.
9. Respect `prefers-reduced-motion` and keep heavy effects lazy-loaded.
10. If something is unclear, ask before assuming.
11. Follow `04-ai-workflow-rules.md`: one phase at a time, update `06-progress-tracker.md` at the end of each phase.

---

## 13. Checklist

- [ ] Tokens, fonts, dark/light themes
- [ ] i18n (AR/EN) + RTL/LTR switching
- [ ] Navbar (transparent → solid), search overlay, mobile drawer
- [ ] Hero with swappable animated background + 3D element
- [ ] All Home sections
- [ ] Shop + Category with filters, sort, pagination
- [ ] Product page + sticky mobile add-to-cart
- [ ] Cart drawer + Cart page
- [ ] Checkout (5 steps, guest allowed)
- [ ] Order success + Track order
- [ ] Auth pages
- [ ] Account area (orders, wishlist, addresses, ...)
- [ ] Static pages + 404 + empty states
- [ ] Reviews (display + submit)
- [ ] Data layer ready to switch from mock to API
- [ ] Performance + accessibility pass
- [ ] Logo and hero background added `TODO(Mando)`
