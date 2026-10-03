# 05b — UI Context: Admin Dashboard (`admin/`)

> Context file 05b of the SIWAR 6-file context system. Read `AGENTS.md` first.
> The `admin/` folder starts as a clone of `MandoOsam/Free-Admin-Dashboard` (MIT template) and is modified according to this file.
> Goal: turn the generic template into **SIWAR's own admin dashboard**.
> Items marked `TODO(Mando)` are things I will provide or decide later.
> Companion: `05-ui-context.md` (customer site). Both share the same brand, data shapes and the API contract in `02-architecture.md` (that file wins on conflicts).

---

## 0. Your Role

You are a senior frontend engineer. You are modifying an existing React + TypeScript admin template into a **bilingual (Arabic RTL / English), dark + light, mobile-friendly e-commerce admin dashboard** for **SIWAR**, a stainless steel jewelry brand for women in Egypt (currency EGP).

Work in **phases** (Section 12). After each phase, stop, run `npm run build` and `npm run lint`, and summarize what changed.

---

## 1. Current State of the Template (audit)

**Stack:** Vite 5, React 18, TypeScript, Tailwind 3 (`darkMode: "selector"`), Redux Toolkit (2 slices: `darkMode`, `dashboard` sidebar), React Router 6, Chart.js (`react-chartjs-2`) + Recharts, react-icons, nanoid.
**License:** MIT. Keep `LICENSE` file as is (add my own copyright line below the original). Do not remove it.

**Structure:** `src/pages` (24 pages), `src/components` (≈45), `src/components/chart`, `src/features`, `src/utils/data.ts` (all mock data, 823 lines), `src/store.ts`.

**What is real vs. fake today**

| Area | Reality |
|---|---|
| Data | 100% hard-coded in `utils/data.ts` (phones/tablets store) |
| Forms | Create/Edit pages have inputs but no state, no validation, no submit |
| Tables | Static rows. Search, sort, Rows-per-page, Export buttons do nothing |
| Pagination | Fake: hard-coded 10 pages |
| Auth | Login/Register are visual only. No guard, no tokens, no roles |
| Routing | Hard-coded: `/orders/1`, links to `/products/1`; "Publish" links to a non-existent `/products/add-product` |
| Layout | `<Sidebar />` is rendered inside every page instead of the layout |
| Images | Paths like `/src/assets/x.jpg` inside data and JSX — these **break in production build**. Upload component only shows a dropzone (no preview, no upload) |
| i18n / RTL | None. Header shows a static "EN". CSS uses left/right (`pl-`, `pr-`, `ml-`, `left-3`, `text-left`, `translateX(-100%)`) |
| Theme | Works (class on `<html>`) but colors are only `blackPrimary #030712`, `whiteSecondary #F0F0F0`, plus gray. Every element repeats `dark:... ` pairs |
| Dashboard | Web-analytics widgets (traffic, devices, countries, conversion by source), not e-commerce metrics |
| Branding | React logo, user "Sherwood Gruninger", `<title>Vite + React + TS</title>`, author comment headers in every file |

**Known bugs to fix**
1. `key={nanoid()}` inside `.map()` (new key every render) → use stable ids.
2. Hard-coded `/products/1`, `/orders/1` routes and links.
3. Dead link `/products/add-product`.
4. Typo "Price with dicount".
5. `hover:bg-blackPrimary` on the root of `CreateProduct`.
6. `.ql-*` Quill CSS in `index.css` but Quill is not installed → remove.
7. `h-[100vh]` sidebar → use `h-dvh`.
8. Fixed percentage widths on Landing (`sm:w-[66%]`) → fluid grid.
9. `index.html`: wrong title, `lang`, no `dir`, Vite favicon.
10. Third-party auth buttons (Google/GitHub) and public Register page are wrong for an admin panel → remove.

---

## 2. Target Stack

Keep: Vite, React 18, **TypeScript**, Tailwind 3, Redux Toolkit, React Router 6, Recharts, react-icons.

Add (allowed, nothing else without asking):
- `i18next` + `react-i18next` — Arabic/English
- `react-hook-form` + `zod` + `@hookform/resolvers` — forms and validation
- `@dnd-kit/core` + `@dnd-kit/sortable` — reorder images/sections
- **RTK Query** (already inside Redux Toolkit) — data layer
- `date-fns` — dates
- `clsx` — class merging

Remove: Chart.js and `react-chartjs-2` (keep Recharts only, one chart library), `nanoid` (after fixing keys), unused assets (phones, tablets, random users, flags), `landing-v2` duplicate.

---

## 3. Brand & Design Tokens (make it SIWAR)

Same identity as the storefront but calmer: **less animation, more clarity**. Sharp/small radius (2–6px), thin borders, generous spacing.

### 3.1 Replace the color system with semantic tokens
Define CSS variables on `:root` (light) and `.dark` (dark), map them in `tailwind.config.js`, then **replace every `dark:bg-blackPrimary bg-whiteSecondary`-style pair with one semantic class**.

| Token (Tailwind name) | Dark | Light | Use |
|---|---|---|---|
| `bg` | `#0B0909` | `#F6F0E8` | page background |
| `surface` | `#151112` | `#FFFFFF` | cards, tables, sidebar |
| `surface-2` | `#1E1819` | `#EFE6DB` | inputs, hover |
| `line` | `#2C2325` | `#DDD0C2` | borders |
| `fg` | `#F3EDE6` | `#1A1213` | text |
| `fg-muted` | `#A89C98` | `#6E605C` | secondary text |
| `accent` | `#C9A66B` | `#8A6A2F` | primary buttons, active nav |
| `accent-2` | `#B76E79` | `#A24F5C` | badges, highlights |
| `success` / `warning` / `danger` / `info` | `#6FBF8E` / `#E0A84C` / `#D36B6B` / `#7AA7D9` | slightly darker | statuses |

`TODO(Mando)`: if the logo needs different accent colors, adjust `accent` / `accent-2` only.

Example refactor:
`dark:bg-blackPrimary bg-whiteSecondary dark:text-whiteSecondary text-blackPrimary` → `bg-surface text-fg`.

### 3.2 Typography
- English: **Inter** (body/UI), **Playfair Display** (logo area and page titles only).
- Arabic: **IBM Plex Sans Arabic** (body/UI), **Amiri** (page titles).
- Load via Google Fonts in `index.html`; set `font-family` per `[lang]`.

### 3.3 Logo & assets
- Logo files will be in `public/assets/logo/` (`siwar-logo.svg` uses `currentColor`; PNG variants exist for dark/light; `favicon.ico`).
- Replace `FaReact` in the header with the SIWAR logo (SVG, height 32px) and the favicon in `index.html`.
- Page `<title>`: `SIWAR | Admin` (translated pattern: `{page} | SIWAR`).

### 3.4 Component style rules
Buttons: primary = `accent` fill with dark text; secondary = outline `line`; danger = `danger`. Inputs: `surface-2`, 1px `line`, focus ring `accent`. Cards: `surface`, 1px `line`, radius 6px. Tables: sticky header, row hover `surface-2`. Status badges: pill, tinted background (`color/15`) with colored text.

---

## 4. Global Requirements

### 4.1 Language & RTL
- Arabic (default) + English, switch in the header (replace the static "EN"). Persist in `localStorage`.
- `i18next` with `src/locales/ar.json` and `en.json`. **No hard-coded strings** in components.
- Set `<html lang dir>` on change.
- **Convert all directional classes to logical ones:** `pl-/pr-` → `ps-/pe-`, `ml-/mr-` → `ms-/me-`, `left-/right-` → `start-/end-`, `text-left/right` → `text-start/end`, `border-l/r` → `border-s/e`, `rounded-l/r` → `rounded-s/e`. Sidebar slides from the inline-start side; icons like chevrons/arrows must flip.
- Numbers/dates/currency via `Intl.NumberFormat` / `date-fns` locale. Currency: **EGP** (`ج.م` in Arabic).
- Product/category/banner/review text fields are **bilingual**: `{ ar, en }`. Forms show two tabs (AR | EN) per text field.

### 4.2 Theme
Keep the existing dark/light toggle logic, but apply tokens from 3.1, add smooth transition, default to dark.

### 4.3 Responsive (mobile matters)
- Sidebar: drawer on `< lg`, fixed on `≥ lg`; collapsible to icons on desktop.
- Tables become **stacked cards** on `< md` (no horizontal scroll for primary tables).
- Touch targets ≥ 44px; filters in a bottom sheet on mobile.
- Header: logo, search, language, theme, notifications, profile menu (with Logout).

### 4.4 Layout fix
Move `<Sidebar />` into `HomeLayout` (rendered once). Pages must contain only page content: `PageHeader` (title, breadcrumb, actions) + body. Create a `PageHeader` component and reuse it everywhere.

### 4.5 Performance & quality
Lazy-load pages with `React.lazy`, memoize heavy tables, skeleton loaders, empty states, error states, toasts for success/failure, confirm dialog for destructive actions.

---

## 5. Data Layer (important)

Backend is **Node/Express + TypeScript + PostgreSQL (Supabase)** in the `backend/` folder (not built yet). Until it exists, use mock data **behind the same interface**.

- Use **RTK Query**: `src/services/api.ts` with `createApi`. Each endpoint calls a function in `src/services/*Service.ts`. Today those functions return mock data from `src/data/` with fake latency (300–600ms) and in-memory persistence so create/edit/delete actually work during the session. Later, swap to `fetchBaseQuery` with `VITE_API_URL` — components do not change.
- Delete `utils/data.ts` and replace with typed mock files per entity.
- Define all types in `src/types/` (see Section 6). Types match the storefront.
- Server pagination contract: `GET /products?page=1&limit=10&search=&sort=&category=&status=` → `{ data: T[], total, page, limit }`. Table state lives in the **URL** (`useSearchParams`) so refresh/back keep filters.
- Auth: `POST /admin/auth/login` sets an **httpOnly session cookie** (`siwar_admin_sid`); use `credentials: "include"` and send the CSRF header on mutating requests; `GET /admin/auth/me`, `POST /admin/auth/logout`. Mock mode fakes this.

Use these endpoint groups: `auth`, `dashboard`, `products`, `categories`, `orders`, `customers`, `inventory`, `coupons`, `campaigns`, `reviews`, `banners`/`cms`, `pages`, `notifications`, `users`/`roles`, `settings`, `uploads`, `activity`.

---

## 6. Entities (TypeScript types)

All ids are UUID strings, money is a number in EGP, dates are ISO strings. The authoritative contract is in `02-architecture.md`.

```ts
type L10n = { ar: string; en: string };

Product {
  id; slug; name: L10n; description: L10n;
  categoryId; price; oldPrice?; discountPercent?;
  images: { url; alt: L10n; isPrimary; order }[];
  colors: ("gold"|"silver"|"rose-gold"|"black")[];
  sizes?: string[];            // rings only
  sku; stock; lowStockThreshold;
  status: "draft"|"active"|"archived";
  isNew; isBestSeller; isFeatured;
  material: "stainless-steel"; plating?: string; waterResistant?: boolean; hypoallergenic?: boolean;
  seo: { title: L10n; description: L10n };
  createdAt; updatedAt;
}
Category { id; slug; name: L10n; description: L10n; image; parentId?; order; isActive; seo }
Order {
  id; number: "SW-10025"; customer { name; phone; email? };
  address { governorate; city; street; building?; apartment? };
  items { productId; name; variant { color?; size? }; qty; price }[];
  subtotal; shipping; discount; total; couponCode?;
  payment { method: "cod"|"vodafone-cash"|"instapay"; status: "unpaid"|"paid"|"refunded"; proofImage? };
  status: "pending"|"confirmed"|"processing"|"shipped"|"out-for-delivery"|"delivered"|"cancelled"|"returned"|"refunded";
  timeline { status; at; note? }[]; trackingNumber?; courier?; internalNote?; createdAt;
}
Customer { id; name; phone; email?; addresses[]; ordersCount; totalSpent; status; createdAt }
Review { id; productId?; authorName; rating; text: L10n; images?; status: "pending"|"approved"|"hidden"; isSeed: boolean; showOnHome: boolean; createdAt }
Coupon { id; code; type: "percent"|"fixed"; value; minOrder?; maxDiscount?; expiresAt?; usageLimit?; usedCount; isActive }
Campaign { id; name: L10n; discountPercent; productIds|categoryIds; startsAt; endsAt; isActive }
Banner/Section { id; key; title: L10n; subtitle: L10n; cta { label: L10n; link }; image; order; isActive }
StoreSettings { storeName; logo; currency; shipping { defaultFee; freeAbove?; byGovernorate?: Record<string, number> }; paymentMethods { cod; vodafoneCash; instapay } with enabled flags + instructions; trustBadges { shipping; payment; returns; support }: L10n; social; contact }
AdminUser { id; name; email; role: "super-admin"|"manager"|"support"|"content"; isActive; lastLogin }
```

---

## 7. Sidebar (replace the existing one)

Groups and routes (icons from react-icons, labels from i18n):

1. **Overview** — `/` Dashboard
2. **Catalog** — `/products`, `/categories`, `/inventory`
3. **Sales** — `/orders`, `/customers`, `/reviews`
4. **Marketing** — `/coupons`, `/campaigns`
5. **Website content** — `/content/hero`, `/content/banners`, `/content/story`, `/content/pages`
6. **System** — `/users`, `/settings`, `/activity`
7. Bottom: `/help-desk` (rename "Help"), profile menu, logout.

Remove: "Landing pages" accordion, "Auth" accordion. Show a badge with the number of pending orders and pending reviews. Hide items the current role cannot access (see 8).

---

## 8. Auth & Roles

- Remove `/register` and third-party buttons. Login = email + password, show/hide password, error state, "remember me".
- `ProtectedRoute` wrapper for all routes; redirect to `/login` with return URL. Auto logout on 401.
- Roles: **super-admin** (everything), **manager** (no Settings/Users), **support** (orders, customers, reviews), **content** (content + products). Permission map in one file `src/config/permissions.ts`; use it for sidebar filtering and route guards.
- Only super-admin creates other admin users (Users page = admin staff, not shoppers; shoppers live in Customers).

---

## 9. Pages & Features to Build

### 9.1 Dashboard `/` (replace Landing and Landing V2 with one page)
- Greeting + date range filter (Today / 7 days / 30 days / custom).
- KPI cards: revenue, orders, new customers, average order value (with change % vs previous period).
- Sales chart (area/line) with day/week/month toggle.
- Orders by status (donut/bar), sales by category (bar).
- Top products, recent orders table (5), low-stock list, pending reviews count.
- Quick actions: Add product, Add coupon, Edit hero.
- Remove: traffic, devices, countries, activity by time, conversion by source widgets.

### 9.2 Products `/products`
- Table/cards: image, name (current language), SKU, category, price, stock, status badge, actions.
- Real search, sort, filters (category, status, stock, featured), pagination (10/25/50), bulk select (activate, archive, delete), **Export CSV** working.
- Create/Edit `/products/new`, `/products/:id` (react-hook-form + zod), sections:
  - Basic info (bilingual name + description, category, slug auto-generated, editable)
  - **Images** (see 10)
  - Pricing (price, old price → discount % auto-calculated, both ways)
  - Variants (colors multi-select, sizes only when category = rings)
  - Inventory (SKU, stock, low-stock threshold, status)
  - Product details (material = stainless steel, plating, water-resistant, hypoallergenic toggles) — replaces the template's weight/length/width/height section
  - Flags (New, Best seller, Featured)
  - SEO (bilingual title/description, live preview)
  - Save as draft / Publish, unsaved-changes warning, Delete.

### 9.3 Categories `/categories`
5 default categories: Necklaces (سلاسل), Rings (خواتم), Bracelets (انسيال), Earrings (حلقان), Sets (سيتات). Create/edit/reorder (drag), image, bilingual name/description, active toggle, SEO. Block deleting a category that has products.

### 9.4 Orders `/orders`, `/orders/:id`
- List: filters by status/payment/date, search by number/phone/name, counters per status as tabs.
- Detail: customer, address, items with images, totals, payment info (+ view transfer proof image), **status stepper + change status with optional note** (writes to timeline), tracking number + courier, internal notes, **print invoice** (print-friendly CSS), cancel/return/refund.
- Create order manually (phone/WhatsApp orders): customer, address, product picker with qty, shipping, discount, payment method.
- Replace the template's customer-info copy-paste form.

### 9.5 Customers `/customers`
List with orders count and total spent, detail page with order history, notes. Read-only mostly.

### 9.6 Inventory `/inventory`
Stock list with low/out-of-stock filters, quick inline stock edit, adjustment with reason, history log.

### 9.7 Reviews `/reviews`
- List with stars, product, status, source (real / seed).
- **Create / edit / hide / delete / approve** — I must be able to add and edit reviews myself (bilingual text, author name, rating, product, show on home).
- Seeded reviews are marked "Sample" and never show "Verified purchase".

### 9.8 Coupons `/coupons`
Create/edit: code, type (percent/fixed), value, min order, max discount, expiry, usage limit, active. Show used count. Validate uniqueness.

### 9.9 Campaigns `/campaigns`
Named sales (Ramadan, Black Friday…) with % discount on categories/products and start/end dates.

### 9.10 Website Content (CMS) — everything the storefront shows
- `/content/hero`: headline/subline/CTAs (bilingual), **upload/replace the animated hero background** (video or animated file, with poster image fallback; show file type/size limits), overlay strength slider, live preview.
- `/content/banners`: featured collections, offers banner; reorder, activate.
- `/content/story`: brand story (bilingual rich text — simple editor, no heavy library), banner image.
- `/content/pages`: About, Contact, FAQ, Shipping, Returns, Privacy, Terms (bilingual content).
- Trust badges and social links live in Settings.

### 9.11 Users `/users` (admin staff)
List/create/edit staff with role, active toggle, reset password. Super-admin only.

### 9.12 Settings `/settings` (tabs)
Store info + logo, language/currency, **shipping** (default fee, free above X, per-governorate fees), **payment methods** (enable/disable + instructions, e.g. Vodafone Cash number), trust badge texts, social links, contact info, SEO defaults, maintenance mode.

### 9.13 Notifications `/notifications`
Real list from state: new order, low stock, new review, new customer. Mark as read / all read, unread count in header. (Mock for now.)

### 9.14 Activity `/activity`
Who changed what and when (user, action, entity, time). Mock now.

### 9.15 Profile `/profile`
Name, email, avatar, language, theme, change password (validated).

### 9.16 Help `/help-desk`
Keep the FAQ accordion; replace content with admin how-to (adding a product, uploading images, handling an order).

---

## 10. Image Management (key requirement)

Build `ImageUploader` (replaces `ImageUpload.tsx`):
- Multiple files, drag & drop + click, **instant previews**, upload progress, remove.
- Reorder with drag (dnd-kit), choose **primary** image, bilingual alt text per image.
- Validation: JPG/PNG/WebP, max 5MB (configurable), suggest square ≥ 1000px; show errors.
- Upload target via `services/uploadService.ts`: **Cloudinary with signed uploads**: ask the backend for a signature (`POST /admin/uploads/sign`), then upload directly to Cloudinary (no secret in the browser; env var `VITE_CLOUDINARY_CLOUD_NAME` only). In mock mode use `URL.createObjectURL`.
- Same component reused for: product images, category image, banners, hero poster, review images, logo.
- A separate `VideoUploader`/`FileUploader` variant for the hero background (accepts the animated file type I will provide; `TODO(Mando)`).

---

## 11. Shared Components to Create / Refactor

`PageHeader`, `DataTable` (generic: columns, sorting, selection, mobile-card mode, skeleton, empty), `Pagination` (real, URL-driven), `FilterBar` / `FilterSheet`, `StatusBadge`, `ConfirmDialog`, `Modal`, `Drawer`, `Toast`, `Tabs`, `LangTabs` (AR|EN fields), `FormField` (label, error), `Input`, `Textarea`, `Select`, `Toggle`, `MultiSelect`, `DateRangePicker` (simple), `StatCard`, `ChartCard`, `Skeleton`, `EmptyState`, `ImageUploader`, `RichTextLite`, `ThemeToggle`, `LanguageSwitch`, `ProfileMenu`, `ProtectedRoute`, `RoleGate`.

Refactor existing: merge `SimpleInput`/`TextAreaInput`/`SelectInput`/`InputWithLabel` into the form components; delete `ThirdPartyAuthButton`, `RegisterComponent`, `Landing*`, the six unused chart variants (keep a single `ChartCard` + Recharts), `SingleStats`/`SingleStatsV2`/`TotalSavings`/`Activities*`/`ConversionRateBySource`.

Keep the good ideas: compound component pattern (`Welcome.Title`), custom typed hooks (`useAppDispatch`/`useAppSelector`), slice-per-feature.

---

## 12. Phases (do in order, stop after each)

1. **Foundation & rebrand** — tokens, fonts, logo, favicon, `index.html`, delete unused assets/libs, fix asset paths (import from `src/assets` or use `public/`), remove bugs 1–10, move Sidebar to layout, `PageHeader`.
2. **i18n + RTL** — i18next, locale files, logical-class conversion, language switch, theme polish. Test every existing screen in AR and EN.
3. **Data layer + Auth** — types, RTK Query, mock services, login, `ProtectedRoute`, roles/permissions.
4. **Core commerce** — Dashboard, Products (+ImageUploader), Categories, Orders, Customers, Inventory.
5. **Marketing & Reviews** — Coupons, Campaigns, Reviews management.
6. **CMS & Settings** — Hero (+background upload), banners, story, static pages, settings, users/roles.
7. **Polish** — notifications, activity log, help, profile, export, skeletons/empty states, accessibility, performance, README.

---

## 13. Rules for the AI Agent

1. Modify the existing project; do not start a new one. Keep Git history clean: one commit per phase with a clear message.
2. TypeScript strict; no `any`; no new libraries outside Section 2.
3. No hard-coded colors, strings, or mock data inside components.
4. Logical Tailwind classes only (RTL-safe).
5. Keep the MIT `LICENSE`. Replace "Developer: Aleksandar Kuzmanovic" file headers with a short header for each file: role, props, output (no personal name needed).
6. Test at 360 / 768 / 1280px, dark and light, Arabic and English.
7. If anything is unclear or a decision is missing, ask before assuming.
9. Follow `04-ai-workflow-rules.md`: one phase at a time, update `06-progress-tracker.md` at the end of each phase.
8. Rewrite `README.md` for SIWAR Admin (how to run, env vars, folder structure, how to switch from mock to real API).

---

## 14. Checklist

- [ ] Tokens, fonts, logo, favicon, title
- [ ] No React/template branding left; unused assets and libs removed
- [ ] Sidebar in layout once; new navigation; role-based hiding
- [ ] AR/EN + RTL on every screen; dark/light
- [ ] Mock services behind RTK Query; URL-driven tables
- [ ] Login + protected routes + roles
- [ ] Dashboard with e-commerce KPIs
- [ ] Products CRUD with variants, bilingual fields, ImageUploader
- [ ] Categories, Orders (timeline, invoice), Customers, Inventory
- [ ] Reviews CRUD (add/edit/hide), Coupons, Campaigns
- [ ] CMS: hero + background upload, banners, story, pages
- [ ] Settings (shipping, payment, trust badges), Users, Notifications, Activity, Profile
- [ ] CSV export, skeletons, empty states, toasts, confirm dialogs
- [ ] `npm run build` and `npm run lint` pass
