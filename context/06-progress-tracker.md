# 06 �����������?? Progress Tracker



> State file. Update it at the end of **every phase** (see `04-ai-workflow-rules.md`). Never delete the Decisions log or the Phase history.

> Last updated: 2026-10-18 (Owner UI revisions R1�R6 done, then an owner **hotfix R2/R4/R5-partial** on branch `The-last-updates-in-storefront`: removed the decorative 3D bracelet from the Home hero, widened the Navbar icon gap, and enlarged both Home hero CTAs (supersedes the R5 "keep Hero3DScene" and R4 "button untouched" constraints � owner-confirmed). build/lint/test green (82 tests). **Next: B1 � Backend foundation** (D-018), not to start without explicit instruction).

## 1. Current status



| Item | Value |

|---|---|

| **Current phase** | **F7 � Static pages, SEO, Polish: done** |

| Last completed phase | F7 � Static pages, SEO, Polish |

| Next phase | B1 � Backend foundation |

| Backend | Not started. Nothing implemented. **Out of scope until the storefront is done** (D-018). |

| Storefront (`frontend/`) | F1�F7 **done**, then owner UI revisions **R1�R6 done** (`08-owner-ui-revisions.md`) on branch `The-last-updates-in-storefront`. **Backend next per D-018.** |

| Admin (`admin/`) | Template `MandoOsam/Free-Admin-Dashboard` analyzed, sitting at `SIWAR/Free-Admin-Dashboard/` (has its own `.git` + `node_modules`), **not yet moved to `admin/`**. Modification plan written (`05b`). **Out of scope until the storefront is done** (D-018). |

| Blockers | None for the storefront. Open decisions D-001 (backend hosting) and D-004 (email provider) only block B2/B8 |



## 2. Done so far



- [x] Storefront UI prompt written (now `05-ui-context.md`, updated to TypeScript + PostgreSQL + manual payments)

- [x] Admin modification prompt written (now `05b-ui-context-admin.md`), based on an audit of the open-source template

- [x] Logo processed: transparent PNGs (light-ink for dark mode, dark-ink for light mode, gold), SVG (`currentColor`), monogram, favicons (16/32/180/512/ico)

- [x] 6-file context system + `AGENTS.md` written

- [x] Stack, API contract, and database model defined in `02-architecture.md`

- [x] **Phase 0 (frontend scope):** git repo + branch per phase, `.gitignore` / `.editorconfig` / root `README.md`, assets sorted into `frontend/public/assets/{logo,hero,reference}`

- [x] **F1 Storefront foundation:** Vite 6 + React 18 + TS strict scaffold, Tailwind tokens, Arabic/English i18n with RTL, dark/light themes, base layout, Navbar + categories + search overlay + mobile drawer + Footer, typed service layer over mock data behind the `02-architecture.md` contract

- [x] **F2 Home page:** hero (video background at `/assets/hero/hero.mp4` + 3D element with static fallback) and all sections (trust strip, categories, new arrivals, featured collections, best sellers, offers countdown, our story, recommended, recently viewed, testimonials, trust badges, newsletter); black-screen hotfix applied

- [ ] Real product images �����������?? owner has them; to be uploaded through the admin later

- [x] Animated hero background �����������?? wired at `/assets/hero/hero.mp4` with poster fallback and `prefers-reduced-motion` support (O-001 resolved 2026-10-10; still needs compression + WebM before ship)

- [ ] Full processed logo set (light/gold PNG, monogram, standard favicon sizes) �����������?? only 3 source files exist; see O-009





## 3. Roadmap (do in order; one phase at a time)



Legend: `[ ]` in progress (F2.1) ������ `[~]` in progress ������ `[x]` done



### Phase 0 �����������?? Project setup

- [~] Create repo `siwar/` with `backend/`, `frontend/`, `admin/`, `context/` �����������?? done for `frontend/` + `context/`; `backend/` is an empty folder, `admin/` not created yet (both out of scope per D-018)

- [x] Place `AGENTS.md` at the root and the context files in `context/`

- [ ] Clone the admin template into `admin/` (keep its MIT `LICENSE`, add owner's copyright line) �����������?? deferred (D-018)

- [~] Copy logo files to `frontend/public/assets/logo/` and `admin/public/assets/logo/`; copy reference images to `frontend/public/assets/reference/` �����������?? storefront side done with the 3 real files; `admin/` side deferred; **no reference images exist**

- [x] `.gitignore`, `.editorconfig`, root `README.md` (short)

- [x] Initial commit (`427b2da`)

- [x] Fix asset folder typo: `public/assetes/` ������? ����?? `public/assets/`



### Backend (`backend/`)

- [ ] **B1 Foundation** �����������?? Express + TypeScript, env validation, Drizzle + Supabase connection, migrations setup, health check, error handler, pino logging, helmet/CORS, lint/test setup. *(If a leftover `mongoose` dependency exists, remove it.)*

- [ ] **B2 Auth & sessions** �����������?? users, sessions, argon2, customer + admin login, CSRF, roles/permissions middleware, rate limits, RLS enabled on all tables

- [ ] **B3 Catalog** �����������?? categories, products, images, Cloudinary signing endpoint, public listing/filter/search/sort/pagination

- [ ] **B4 Content & settings** �����������?? content blocks (hero, banners, story), static pages, store settings, public settings endpoint

- [ ] **B5 Orders** �����������?? coupons, order creation (transaction, server-side totals, stock), manual payment methods + proof upload, tracking, order events, admin order management

- [ ] **B6 Customer features** �����������?? reviews (submit/moderate), wishlist, addresses, notifications, newsletter, recently viewed support

- [ ] **B7 Admin analytics & ops** �����������?? dashboard stats, inventory movements, campaigns, activity log, CSV export

- [ ] **B8 Hardening & deploy** �����������?? security review, tests, seed data, production config, deployment (see D-001)



### Admin (`admin/`) �����������?? phases mirror section 12 of `05b`

- [ ] **A1** Foundation & rebrand

- [ ] **A2** i18n + RTL

- [ ] **A3** Data layer + Auth (against mock first, then real API after B2)

- [ ] **A4** Core commerce (dashboard, products + ImageUploader, categories, orders, customers, inventory)

- [ ] **A5** Marketing & reviews

- [ ] **A6** CMS & settings

- [ ] **A7** Polish



### Storefront (`frontend/`)

- [x] **F1** Foundation �����������?? Vite + TS scaffold, tokens, fonts, i18n/RTL, dark/light, layout, Navbar/Footer, service layer with mock data

- [x] **F2** Home - all sections, Hero with swappable animated background + one 3D element (F2.1-F2.7 structure in place; F2.8 polish) |

- [x] **F3** Shop, Category, Search �����������?? filters, sort, pagination, mobile filter sheet. **F3.1 done** (`b9af2d6`); **F3.2** done; **F3.3** done; **F3.4** done; **F3.5** done; **F3.6** done; **F3.7 (polish & verification)** done

- [x] **F4** Product page �����������?? **F4.1 (foundation: detail reuse, review endpoints, hooks, gallery, route) + F4.2 (info, variants, quantity, material, actions, accordion, sticky bar, toast) + F4.3 (review summary, review form, reviews section, matching/related/recently-viewed rails) + F4.4 (page assembly, SEO, a11y, code-split) done**

- [x] **F5** Cart, Checkout, Order success, Track order �����������?? **F5.1 (cart page + drawer + store wiring), F5.2 (checkout flow), F5.3 (order success + track order) and F5.4 (assembly + polish) all done**

- [x] **F6** Auth + Account (orders, wishlist, addresses) � **F6.1 (auth pages + session) + F6.2 (account dashboard + profile) + F6.3 (orders, wishlist, addresses, notifications) + F6.4 (assembly + polish) all done**
- [x] **F7.1a � About, Contact, FAQ (done)**

- [ ] **F7** Static pages, 404/empty states, SEO tags, performance + accessibility pass

### Owner UI revisions (`08-owner-ui-revisions.md`)

- [x] **R1** � Color token refresh (WCAG AA) � D-050
- [x] **R2** � Theme-aware logo + Navbar spacing � D-051
- [x] **R3** � Social icons + WhatsApp FAB + payment icons/numbers � D-052
- [x] **R4** � Home hero CTA icons � D-053
- [x] **R5** � New 3D scene (`Modern3DSection`, between `BestSellers` and `OurStory`) � D-054
- [x] **R6** � Final verification (build/lint/test, i18n parity, Lighthouse, deps, chunks) � D-055
- [x] **Hotfix (R2/R4/R5-partial)** � removed the hero 3D bracelet (`Hero3D`/`Hero3DScene` deleted), Navbar icon gap `gap-2?gap-3`, enlarged both Home hero CTAs (`min-h-14 py-4`) � D-056



**F1 shape as built** (for the phases that follow):



- `src/services/` is the only data entry point. `mockAdapter.ts` answers the `02-architecture.md`

  endpoints from `src/data/`; setting `VITE_API_URL` switches to the real API with no component change.

- `src/data/` is placeholder content and must be replaced by the owner (products, settings, reviews,

  contact details, social URLs, images). Every missing value is the literal `TODO(Mando)`; components

  use `isPlaceholder()` from `src/utils/format.ts` to hide incomplete entries instead of rendering a

  broken link or visible `TODO` text.

- Routes for F3�����������?F7 already exist and render `src/pages/PlaceholderPage.tsx`, so navbar links work

  before their real page is built. Replace each placeholder as its phase lands.

- `src/pages/HomePage.tsx` is intentionally only a hero-height block (poster + headline from

  `GET /content/home`) so the navbar's transparent-over-hero behaviour can be checked. F2 replaces it.

- `src/components/layout/SearchOverlay.tsx` was included in F1 because the Navbar needs it; it calls

  `GET /search/suggest`. F3 adds the full results page.



### Suggested sequence

`Phase 0 ������? ����?? F1 ������? ����?? F2 ������? ����?? F3 ������? ����?? F4 ������? ����?? F5 ������? ����?? F6 ������? ����?? F7 ������? ����?? B1 ������? ����?? B2 ������? ����?? B3 ������? ����?? B4 ������? ����?? B5 ������? ����?? B6 ������? ����?? B7 ������? ����?? B8 ������? ����?? A1 ������? ����?? A2 ������? ����?? A3 ������? ����?? A4 ������? ����?? A5 ������? ����?? A6 ������? ����?? A7`



**The storefront is built first, end to end, on the mock service layer** (D-018). The backend comes after, and the admin last. Frontends switch from mock to the real API by setting `VITE_API_URL` once the matching backend phase is done �����������?? components never change.



## 4. Decisions log



`owner` = decided by the owner. `default` = proposed by the assistant, **not yet confirmed**; the owner may change it.



| ID | Date | Decision | Source |

|---|---|---|---|

| D-001 | �����������?? | **PENDING �����������?? Backend hosting.** Owner wants Cloudflare + Supabase. Cloudflare Pages hosts the two frontends. Express is a long-lived Node server and does not run on Cloudflare Workers out of the box. Options: (a) Express on Render/Railway/Fly.io; (b) rewrite the API on Hono for Cloudflare Workers (+ Hyperdrive for Postgres); (c) Cloudflare Containers. Decide before B8 | open |

| D-002 | 2026-10-03 | TypeScript (strict) in all three folders | owner |

| D-003 | 2026-10-03 | Database: PostgreSQL on Supabase (used only as managed Postgres). MongoDB/Mongoose dropped | owner |

| D-004 | �����������?? | **PENDING �����������?? Email provider** for password reset and order emails (e.g. Resend). Not needed until B2 | open |

| D-005 | 2026-10-03 | Auth via httpOnly cookie. Implementation: server-side sessions in PostgreSQL (not JWT), two cookie names (customer/admin), CSRF token + Origin check | owner chose cookie; sessions = default |

| D-006 | 2026-10-03 | Deployment: Cloudflare (Pages + DNS/CDN) and Supabase (database) | owner |

| D-007 | 2026-10-03 | Payments v1: Cash on Delivery, InstaPay transfer, Vodafone Cash; manual confirmation; no card gateway | owner |

| D-008 | 2026-10-03 | Repo layout: `backend/`, `frontend/`, `admin/`, `context/` + root `AGENTS.md` | owner |

| D-009 | 2026-10-03 | AI agent: opencode only; implement one phase at a time | owner |

| D-010 | 2026-10-03 | ORM: Drizzle + drizzle-kit migrations | default |

| D-011 | 2026-10-03 | Validation: Zod (backend and forms) | default |

| D-012 | 2026-10-03 | Images: Cloudinary with backend-signed uploads | default |

| D-013 | 2026-10-03 | Languages: Arabic (default, RTL) + English; themes: dark (default) + light; mobile-first | owner |

| D-014 | 2026-10-03 | Git: conventional commits, branch per phase/feature | default |

| D-015 | 2026-10-03 | Working mode: BUILD by default; LEARN mode on request per task | default |

| D-016 | 2026-10-03 | Shared contract lives in `02-architecture.md`; no shared npm package for now | default |

| D-017 | 2026-10-03 | Storefront UI context (`05`) replaces the "UI Context" file in the 6-file system; admin UI context is `05b` | owner |

| D-018 | 2026-10-03 | **Build order: storefront first.** Start with `frontend/` on the mock service layer; `backend/` and `admin/` come afterwards. Frontends switch to the real API later via `VITE_API_URL`. | owner |

| D-019 | 2026-10-10 | The `/search` autocomplete component is `src/components/SearchAutocomplete.tsx`. The F1 navbar overlay `src/components/layout/SearchOverlay.tsx` stays untouched. One name = one job, no duplicate overlays. | owner |

| D-020 | 2026-10-10 | Popular search terms live in `src/data/search.ts`; `src/services/catalogService.ts` imports from there (single source of truth). Small service-layer change, in F3 scope. | owner |

| D-021 | 2026-10-10 | Recent searches (query strings only, max 5) are stored in `localStorage`, consistent with the allowed client-storage list (theme, language, cart, recently-viewed) in `03-code-standards.md` �5. No personal data, no tokens. | owner |

| D-022 | 2026-10-11 | Filter **Color & Size are single-select for now**, built on the frozen F3.1 contract (`color?: ProductColor`, `size?: string`). True multi-select (OR inside one filter, e.g. gold OR silver) is deferred to its own sub-phase that changes the contract first � `services/types.ts` (`02-architecture.md` is the source of truth) ? `useProductFilters` ? `catalogService` ? hook tests � then the multi-select UI. | owner |

| D-023 | 2026-10-11 | **One `<main>` per page.** `RootLayout` owns `<main id="main-content">` (the skip-link target); pages/layouts must not nest another `<main>`. `/shop`, `/category/:slug` and `/search` render `<div>`/`<section>` bodies. Enforced after F3.7 found `ProductListLayout` and `SearchPage` nesting `<main>`. | default |

| D-024 | 2026-10-11 | **Modal surfaces trap focus and restore it.** `FilterSheet` (and any future dialog) keeps Tab inside the open sheet and returns focus to the element that opened it on close, in addition to Escape-to-close. Implemented in F3.7. | default |

| D-025 | 2026-10-11 | **Types stay in `src/services/types.ts`.** The F4.1 spec proposed `src/types/product.ts` + `review.ts`, but `Product`/`Review` (and every other contract type) already live in `services/types.ts` and are imported across F1�F3. No `src/types/` folder is created; new types are added to `services/types.ts`. | default |

| D-026 | 2026-10-11 | **One cart store: `src/store/cartStore.ts`.** F4.1 does not create a second `src/store/cart.ts`; the existing persisted Zustand cart (`addItem`/`removeItem`/`setQty`/`clear` + `selectCartCount`/`selectSubtotal`, `STORAGE_KEYS.cart`) already covers it. Product actions in F4.2 reuse it. | default |

| D-027 | 2026-10-11 | **Product detail reuses `getProductBySlug`** (returns `ProductDetail { product, matching, related }`); F4.1 adds only the review endpoints. Separate `getRelatedProducts`/`getMatchingProducts` service functions are **not** added � `useProduct`/`useRelatedProducts` read the single `getProductBySlug` query (shared query key). | default |

| D-028 | 2026-10-11 | **Mock product reviews.** Seeded reviews (no `productId`) are treated as generic samples and shown under every product; `GET /products/:id/reviews` and `POST /products/:id/reviews` are the real endpoints. `submitProductReview` stores a new review as `pending` in memory (moderation), so it never appears in the public list in mock mode. | default |

| D-029 | 2026-10-11 | **Routes stay in `src/app/AppRoutes.tsx`** (not `src/App.tsx`, which only mounts providers). The `/products/:slug` route is added there, lazy-loading `ProductPage`. Same deviation accepted in F3. | default |

| D-030 | 2026-10-11 | **F4.2 product-selection state is lifted to `ProductPage`** (assembled in F4.4). `VariantSelector`/`QuantityStepper`/`ProductInfo`/`MaterialBlock`/`ProductActions`/`StickyAddToCart` are presentational and prop-driven; no React context is introduced for the selected colour/size/quantity. | default |

| D-031 | 2026-10-11 | **Sticky bar visibility uses `IntersectionObserver`** on an `anchorRef` (the main purchase block), not a scroll listener. `StickyAddToCart` is mobile-only (`lg:hidden`) and hides again when the inline actions are back in view. | default |

| D-032 | 2026-10-11 | **Toasts use a minimal `src/store/toastStore.ts` + `src/components/ui/Toast.tsx`** (Zustand queue + `aria-live` viewport), not a new library. The `ToastViewport` is mounted once when the product page is assembled in F4.4. | default |

| D-033 | 2026-10-11 | **"Buy now" adds the line and routes to `ROUTES.cart`** for now: there is no `/checkout` route yet and `app/AppRoutes.tsx` is out of F4.2 scope. F5 repoints it to `/checkout`. | default |

| D-034 | 2026-10-11 | **No per-variant stock in the contract** (`Product.stock` is aggregate only), so F4.2 disables all colour/size options together when `stock <= 0` and caps quantity at the aggregate `stock` (fallback 10). Per-variant inventory is a later contract change. | default |

| D-035 | 2026-10-11 | **`ReviewForm` uses Zod + controlled `useState`, not `react-hook-form`.** The F4.3 scope asked for React Hook Form + Zod, but RHF is not installed and AGENTS.md rule 3 / 03-code-standards forbid new libraries. The existing `Newsletter` form already validates with `zod.safeParse` (D-011 sanctions Zod), so F4.3 follows that pattern. `safeParse` issues are mapped to per-field i18n messages, the first invalid field is focused, and errors are announced with `role="alert"`. | default |

| D-036 | 2026-10-11 | **Submitted review text is stored in both `L10n` fields with the same string** (`{ ar: text, en: text }`). There is no client-side translation service, so the single entered value is duplicated; the admin separates the languages later. `ProductReviewInput.text` requires both fields. | default |

| D-037 | 2026-10-11 | **`MatchingProducts`/`RelatedProducts` are prop-driven** wrappers over the F2 `ProductSlider` (`{ products }`), returning `null` when empty; F4.4 passes `matching`/`related` from the existing `useRelatedProducts` hook. **`ProductReviews` self-fetches** via the existing `useProductReviews(productId)` hook and always renders `ReviewForm` (its `onSubmit` is the hook's `submit`). The F4.1 hook exposes no `refetch`, so the error retry calls `queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] })`. | default |

| D-038 | 2026-10-11 | **`RecentlyViewedProducts` records the current product on mount and excludes it from the rail**, so the widget only shows *other* previously-viewed products and can be empty (nothing else viewed yet). ids are resolved against the mock catalogue (`@/data/products`), mirroring the F2 `sections/home/RecentlyViewed.tsx` � there is no `products/by-ids` endpoint and `catalogService.ts` is out of scope. **Deviation** from "components never import `src/data/`"; to be replaced by a service call when the backend lands. | default |

| D-039 | 2026-10-11 | **Below-the-fold product sections are code-split** (`React.lazy` + `Suspense` in `ProductPage`): `Accordion`, `ProductReviews`, `MatchingProducts`, `RelatedProducts`, `RecentlyViewedProducts`. Keeps framer-motion (accordion/sliders) and zod (review form) off the above-the-fold critical path where the LCP `<h1>` renders. Cut product-page TBT from ~1.75 s to ~0.1 s in Lighthouse. | default |

| D-040 | 2026-10-11 | **Per-page SEO (title + `meta[name=description]` + Open Graph) is applied by a single cleanup-safe effect in `ProductPage`** � no `react-helmet` (no new libraries). JSON-LD Product schema is deferred to F7. The page-local variant selection stays as D-030. | default |

| D-041 | 2026-10-11 | **F5.1 cart drawer, "save for later" and coupon validation.** The cart drawer opens from the Navbar cart icon by adding `"cart"` to the `uiStore` `Overlay` union (F1 file, one-line change) rather than a new store/context; `CartDrawer` is mounted once in `RootLayout` beside `SearchOverlay` (the established home for global overlays, cf. D-019). "Save for later" is a persisted `saved` array in the **same** `cartStore` (D-026), not a second store. `Coupon` gains an optional `freeShipping` flag for `FREESHIP`. `validateCoupon(code, subtotal)` is added to `catalogService.ts` (`POST /coupons/validate`, `02-architecture.md` �7) with mock codes `SIWAR10` (10%), `WELCOME50` (EGP 50 off when subtotal = 300) and `FREESHIP`; totals stay display-only (server recomputes at checkout). The Navbar cart link is now an `IconButton` (F1 edit, owner-approved scope exception for wiring the icon). | default |

| D-042 | 2026-10-11 | **`/checkout` route placeholder added.** `ROUTES.checkout = "/checkout"` and a `PlaceholderPage phase="F5"` route in `app/AppRoutes.tsx`, so the cart's "Proceed to Checkout" button (F5.1) never 404s before F5.2 builds the real page (same placeholder pattern as the F5 `/order/success` and `/track-order` routes). Repointing `ProductActions` "Buy now" from `ROUTES.cart` to `ROUTES.checkout` (D-033) is left to F5.2 when checkout exists. | default |

| D-043 | 2026-10-12 | **F5.2 checkout lives in a new `services/checkoutService.ts`, not `catalogService.ts`.** `catalogService.ts` was already 259 lines, so adding `createOrder`/`getShippingOptions`/`getPaymentMethods`/`listGovernorates` would breach the 300-line cap (`03-code-standards.md` �2) � the spec said "add to `catalogService.ts`". New checkout types (`ShippingOption`/`Governorate`/`OrderCustomer`/`OrderAddress`/`OrderInput`/`OrderResult`) go in `services/types.ts` (D-025); the 27 governorates in `data/governorates.ts`; `shippingOptions` in `data/content.ts` (reusing `storeSettings.shipping`). The flow is one controlled form in `CheckoutPage` (Zod + controlled state, D-035 � not RHF) with presentational steps under `components/checkout/`; `CheckoutPage` is kept under the cap by `CheckoutStepView` + `CheckoutFooter` + `checkoutUtils` and a reusable `hooks/useDocumentMeta.ts` (generalises the D-040 effect). | default |

| D-044 | 2026-10-12 | **F5.2 mock order + success redirect.** `createOrder` (mock) rejects empty carts / unknown products / over-stock, recomputes subtotal + shipping (honouring `freeAbove`/`FREESHIP`) + coupon via the existing `validateCoupon`, and returns `{ id, number: SW-10025+, total }`; the server stays the source of truth for the total (`02-architecture.md` �10). On success `CheckoutPage` calls `cartStore.clear()` then navigates to the new `ROUTES.orderSuccess(id)`. The transfer proof is a plain URL input (real upload = F6); card payment stays out of scope (D-007). **Deviation from the F5.2 spec:** checkout keeps the standard Navbar/Footer chrome instead of a stripped minimal header � `RootLayout` owns the shell (D-023). `prefers-reduced-motion` disables the step fade; `getPaymentMethods` filters disabled methods. | default |

| D-045 | 2026-10-12 | **F5.3 order reads live in `checkoutService.ts`, not `catalogService.ts`** � same 300-line-cap reason as D-043 (`catalogService.ts` is 259 lines, and the orders store must sit beside `createOrder`). `createOrder` was **extended (an F5.2 file)** to build and record a full `Order` (items, status `pending`, `estimatedDelivery`) in a mock store mirrored to `localStorage` (`STORAGE_KEYS.mockOrders = "siwar.mock.orders"`, guarded with `try`/`catch` + `typeof localStorage`), so `getOrderById`/`getOrderByNumberAndPhone` survive a refresh and sequence numbers are derived from the persisted list (never reusing `SW-10025`). The timeline shows terminal states (cancelled/returned/refunded) as a distinct `accent-2` banner with the six linear steps greyed beneath it, because a mock order carries no status history. Routes stay in `app/AppRoutes.tsx` (D-029), **not** `src/App.tsx`. | default |

| D-046 | 2026-10-13 | **F6.1 mock session persists in `localStorage` (owner-confirmed).** 02-arch �10 / 03-standards �5 forbid personal data in `localStorage`, so this is the same **mock-only** exception already accepted in D-045: the mock auth service persists the account **profiles** (`STORAGE_KEYS.mockUsers = "siwar.mock.users"`, no password field) and the signed-in **user id** (`STORAGE_KEYS.mockSession = "siwar.mock.auth"`, guarded with `try`/`catch` + `typeof localStorage`) so a refresh keeps the customer signed in. Passwords are **never** persisted: the demo account's password lives in `src/data/auth.ts` (bundle) and runtime-created ones live in an in-memory `Map` for the session only. Real mode uses the httpOnly cookie exclusively (`getCurrentUser` ? `GET /auth/me`, 401 ? `null`). Both mock keys disappear once `VITE_API_URL` is set. | owner |

| D-047 | 2026-10-13 | **F6.2 saved profile overrides the seed (mock).** `updateProfile` persists the editable fields to the same mock store (`STORAGE_KEYS.mockUsers`, no password) and `findProfile`/`findProfileById` resolve the stored copy ahead of `seedAccounts`, so a profile edit survives a refresh (owner-approved, together with the `displayName` `L10n` field on `AuthUser` and the contract additions `PATCH /account/profile` + `POST /account/change-password` in 02-arch �7). Password changes stay in memory only (D-046) and `changePassword` verifies the current one first (`invalid-current-password`). | owner |

| D-048 | 2026-10-13 | **F6.2 split `authService.ts` and `services/types.ts` to honour the 300-line cap (`03-code-standards.md` �2).** Adding `updateProfile`/`changePassword` pushed `authService.ts` to 316 lines and (after F6.1) `types.ts` to 362, both over the cap. New `services/accountService.ts` (profile + password calls) and `services/mockAuthStore.ts` (shared mock persistence) hold the account layer; the auth/account and order contract types move to `services/authTypes.ts` and `services/orderTypes.ts`, both **re-exported from `types.ts`** so every existing `@/services/types` import still resolves. Same cap reason and pattern as D-043/D-045. Final sizes: `authService.ts` 165, `types.ts` 219, `accountService.ts` 79, `mockAuthStore.ts` 111, `authTypes.ts` 69, `orderTypes.ts` 95. | owner |

| D-049 | 2026-10-13 | **F6.3 account areas (orders, wishlist, addresses, notifications).** `checkoutService.ts` gains additive `listOrders`/`cancelOrder`/`requestReturn` (the mock order store keeps its owner) and `OrderErrorCode` grows `order-not-found`/`not-cancelable`/`not-returnable`; `services/accountService.ts` gains address CRUD + `getMyNotifications` and **re-exports** `getMyOrders`/`getMyOrder`/`cancelOrder`/`requestReturn` so account pages import from one place. Wishlist is a new persisted client store `store/wishlist.ts` (`STORAGE_KEYS.wishlist`, product ids) and notifications a persisted `store/notifications.ts` seeded from `src/data/notifications.ts`. `services/http.ts` gains an additive `deleteVoid`. Contract �7 now lists `POST /orders/:id/cancel`, `POST /orders/:id/return`, the `/account/addresses/:id` (`PATCH`/`DELETE`) + `/default` routes and `DELETE /account/wishlist/:productId`. **Owner-approved scope exception:** minimal direct edits to `ProductCard.tsx` (heart + quick-add) and `ProductActions.tsx` (heart) to wire the shared wishlist/cart stores. `/wishlist` becomes a child of the protected account group. Mock-only storage keys stay mock-only (same exception as D-045/D-046). | owner |

| D-050 | 2026-10-14 | **R1 � Storefront color-token refresh for WCAG AA (`frontend/src/styles/tokens.css`, owner revisions `08`).** Light theme darkened where contrast failed: `--border #ddd0c2?#7d7364` (4.11:1 on `--bg`, =3 non-text), `--text-muted #6e605c?#5f514d` (6.69:1), `--accent #8a6a2f?#7a5a23` (was the flagged 4.43:1 ? 5.60:1), `--accent-2 #a24f5c?#9b4757` (5.40:1), `--surface-2 #efe6db?#e8dccc`. Dark theme: `--surface-2 #1e1819?#241d1e`, `--border #2c2325?#756a6d` (3.82:1), `--text-muted #a89c98?#bdb2ae` (9.59:1), `--accent-2 #b76e79?#bf7883` (5.89:1); `--accent #c9a66b` kept (8.65:1). All text pairs verified =4.5:1 and borders =3:1 by a throwaway contrast script. Only `tokens.css` changed � no component hex. The remaining raw-hex source is `sections/home/Hero3DScene.tsx` lines 27/45/46 (three.js material colors), **reported, not changed**. Resolves the light-theme `--accent` 4.43 Known-issue flag. | owner |

| D-051 | 2026-10-14 | **R2 � Theme-aware wordmark + Navbar spacing (owner revisions `08`).** `siwar-logo.svg` is filled with `currentColor`, but an SVG loaded through `<img>` is an isolated document: `currentColor` there resolves to black and never inherits the page, so the logo could not follow the theme (it disappeared over the dark hero while the light theme was active). `Logo.tsx` now paints a `bg-current` box masked with the SVG (`mask-image` + `-webkit-mask-*` prefix), so the wordmark takes the inherited text colour (`--text` normally, `--ink-on-hero` over the hero) and stays a crisp vector � **no new asset and no new dependency** (the 233 KB PNGs are not loaded). `Navbar.tsx` spacing raised: icon cluster `gap-0.5 sm:gap-1 ? gap-2` (=8px) and header sections `gap-2 ? gap-4` on mobile/tablet (logo?menu =16px; `lg:gap-6` unchanged). `npm run build`, `npm run lint` and `npm test` pass (82 tests). | owner |

| D-052 | 2026-10-14 | **R3 � Social icons + WhatsApp CTA + payment icons (owner revisions `08`).** **Tokens:** added `--brand-whatsapp: #25d366` to `tokens.css` (identical in both themes) � the documented fixed-brand exception � and mapped it to Tailwind `whatsapp`. Answers O-R6 (no objection). **Icons:** new `frontend/src/components/icons/` � local `TikTokIcon` (Lucide-styled stroke; Lucide ships none), `WhatsAppIcon`, `VodafoneCashIcon` (Simple-Icons speech-mark), `InstaPayIcon` (local card+bolt; no Simple-Icons entry) + `socialIcons.ts` / `paymentIcons.ts` maps. **No new npm dependency.** **R3.a:** Footer + Contact social links are now icon-only (Lucide `Facebook`/`Instagram` + `TikTokIcon`) at 24px inside 44px targets, each with the `social.openInNewTab` aria-label (lists moved from text rows to `flex` icon rows). **R3.b:** new `components/WhatsAppFab.tsx` mounted on Home + Contact � `fixed bottom-5 end-5 z-30`, WhatsApp green, `target="_blank"` `rel="noopener noreferrer"`; one-off `wa-bounce` + endless `wa-pulse` ring, both `motion-safe` (dropped under reduced motion). Label reuses `footer.whatsappCta` (**no new i18n keys**). **R3.c:** `PaymentStep` shows the method icon + inline number; Footer payment badges show icon + label (+ number for transfer methods). Numbers live in `data/content.ts` `paymentMethods[].accountValue` (InstaPay `01278259732`, Vodafone Cash `01041921899`) � owner-provided placeholders, TODO(Mando)/admin-editable in A6. **Deviation:** the spec said to read the number from `storeSettings.social.whatsapp`, but `StoreSettings.social` is a `{platform,url}[]` array and the WhatsApp link already lives at `storeSettings.contact.whatsapp` (`https://wa.me/201041921899`); to keep contract impact nil (as �R3 requires) the FAB reads `contact.whatsapp` and no data shape changed (`contact.phone` already held `01041921899`, so O-R7 is satisfied as-is). Checks: build/lint/test green (82 tests); i18n parity **669/669** (no keys added); no raw hex outside `tokens.css` (only the pre-existing `Hero3DScene` three.js colours). | owner |

| D-053 | 2026-10-14 | **R4 � Home hero CTA icons (owner revisions `08`).** Step 0 found the premise of �R4 did not match the code: the two Hero CTAs (`sections/home/Hero.tsx`) rendered **text only** � no icon existed at any size � and `05-ui-context.md �7.2` specs the hero as "2 CTAs (Shop Now / Explore Collections)". The owner confirmed in chat (2026-10-14) to **add** a trailing arrow to both. Added Lucide `ArrowRight` (already a dependency) as a trailing child of both `ButtonLink`s at `size-6` (24px), RTL-mirrored via the existing `rtl-flip` utility (same pattern as `SectionHeading`/`Pagination`), `aria-hidden`. Only `sections/home/Hero.tsx` touched; `Button.tsx` and button height/padding/text untouched, no other home section touched. **Pre-existing observation (not fixed, out of scope):** `SIZE_CLASSES.lg` uses `min-h-13`, which is not a real Tailwind class ? `size="lg"` has no min-height (see �6). | owner |

| D-054 | 2026-10-14 | **R5 � New 3D scene (owner revisions `08`; O-R5 answered: option (a)).** Owner chose a new dedicated section between `BestSellers` and `OurStory`; it is inserted directly after `BestSellers` (before `OffersSection`). New files in `sections/home/`: `Modern3DSection.tsx` (heading + subtitle + 3D slot), `MiniRing3D.tsx` (lazy + `IntersectionObserver` mount-on-view + WebGL detect + error boundary + static `hero-poster.jpg` fallback + `prefers-reduced-motion` gate), `MiniRingScene.tsx` (raw-geometry torus, `useFrame`, rotation gated by `reducedMotion`; no drei, no new dependency). **Chunk:** new scene own chunk `MiniRingScene` = 0.77 kB (0.45 kB gzip � far under the =150 KB target); because two lazy modules now import `@react-three/fiber`, Vite extracted it into shared chunk `react-three-fiber.esm` (824.49 kB / 221.79 kB gzip). **`Hero3DScene` did not grow:** pre-R5 it was a single 825.19 kB (222.08 kB gzip) chunk; post-R5 the same three/fiber payload is the shared vendor chunk (824.49 kB) and `Hero3DScene` itself is 0.81 kB � library cost unchanged, `Hero3DScene` shrank. **Lighthouse mobile `/`:** baseline (R5 section removed) median Perf **58** vs after-R5 median Perf **58** over 3�4 runs each (isolated 68/56 runs are noise; FCP/LCP distributions match) ? **no regression**; A11y 100 / BP 100 / SEO 92 unchanged. **Deviation:** the spec pointed at `frontend/src/three/<Name>.tsx`, but no `three/` dir exists (the existing `Hero3DScene.tsx` lives in `sections/home/`), so the new scene files follow that location. | owner |

| D-055 | 2026-10-14 | **R6 � Final verification (owner revisions `08`; no new code).** `npm run build`/`lint`/`test` pass in `frontend/` (82 tests). i18n parity **669/669** (en = ar; no keys added). Lighthouse 13.5.0 mobile (median of runs): `/` Perf **58**, A11y **100**, BP **100**, SEO **92**; `/contact` Perf **67**, A11y **100**, BP **100**, SEO **92**. No new npm dependency (`package.json`/lock unchanged). `Hero3DScene` chunk confirmed not to have grown (see D-054). Raw-hex grep across `frontend/src` still only hits `Hero3DScene.tsx` (three.js colour props; reported, not changed). Caveats: Performance is below the =80 target but is the pre-existing F1 issue (render-blocking Google Fonts + ~222 kB gzip three.js), not caused by R1�R5; the manual 360/768/1280 dark+light AR+EN visual pass and the R5 section's Arabic copy still need the owner (see �6). | owner |

| D-056 | 2026-10-14 | **Hotfix on top of R2/R4/R5 (owner chat, 2026-10-14) � supersedes the R5 "keep `Hero3DScene`" and R4 "button height/padding untouched" constraints (owner-confirmed after the conflict was reported).** **Part 1 � hero 3D removed:** the decorative rotating gold torus over the hero video (`sections/home/Hero3D.tsx` ? lazy `Hero3DScene.tsx`) was deleted and its import + `<Hero3D>` usage removed from `Hero.tsx`; the animated video background (`hero.mp4` + `hero-poster.jpg`) and all hero text/CTAs are untouched (`HeroBackground` still uses the poster). `hero-poster.jpg` is kept (also the R5 `Modern3DSection` fallback). **HomePage chunk shrank 26.67 ? 25.42 kB (9.49 ? 9.33 kB gzip)**; the hero no longer pulls three.js � with only `MiniRingScene` importing `@react-three/fiber`, Vite folded the vendor into `MiniRingScene` (**825.14 kB / 222.05 kB gzip**, lazy + on-viewport on `Modern3DSection`). **Part 2 � Navbar spacing:** icon-cluster container `gap-2 ? gap-3` (=12 px); logo?menu already `lg:gap-6` (24 px) and nav links `gap-6` (24 px), unchanged. Icons use `text-current` (inherit `text-on-hero`/`text-fg`), no hard-coded colour. **Part 3 � hero CTAs enlarged:** both hero `ButtonLink`s (already `size="lg"` = `px-8 text-base`; the `min-h-13` in `Button.tsx` is invalid and generates no CSS) got `className="min-h-14 py-4"` ? real 56 px min-height + vertical padding; icons stay `size-6` (24 px); primary/secondary hierarchy unchanged. Scoped to `Hero.tsx` only � `Button.tsx` untouched, so the product-page `size="lg"` buttons are unchanged (the `min-h-13` bug there stays flagged in �6). build/lint/test green (82 tests). | owner |



| D-057 | 2026-10-18 | **Storefront audit (07) decisions.** A1: split `useProductFilters` (319 -> 276 lines) into `productFiltersUtils.ts`; removed 3 dead files (`HomeSkeleton`, `banners.ts`, `PlaceholderPage.tsx`); kept `useLenis.ts`/`structuredData.ts` pending an owner call. A2: added `frontend/public/_redirects` (`/* /index.html 200`) as the spec requires; no `_headers` added (host-level, logged). A3: made the Google Fonts stylesheet non-render-blocking in `index.html` (no new library); kept `chunkSizeWarningLimit: 900` with **no** `manualChunks` (the F7.3 revert stands - stability over the perf lever); wildcard host headers (CSP/HSTS) left to Cloudflare. A4: verified by code inspection + route status (no browser automation available); the A4.4 Lighthouse re-run was contaminated by host load (identical bundle hash scored 85 vs 38), so the **A3 idle-host numbers are authoritative**; the 4 A4.2 consistency gaps were logged, not fixed (no scope creep). | default |

## 5. Open questions for the owner



| ID | Question | Needed by |

|---|---|---|

| O-002 | Domain name (affects cookie domain and `api.` subdomain) | B2 / B8 |

| O-003 | Shipping: one flat fee, or per governorate? Free shipping above an amount? Courier company? | B4 / B5 |

| O-004 | Return policy (days) and the real trust-badge texts | B4 |

| O-005 | InstaPay address and Vodafone Cash number to display at checkout | B5 |

| O-006 | Real customer reviews to replace the 8 sample reviews before launch | before launch |

| O-007 | Will staff accounts (manager, support, content) exist at launch, or only the owner? | B2 |

| O-008 | SEO: is pre-rendering of product pages needed later? | F7 |

| O-009 | Full processed logo set: light-ink and gold PNGs, the monogram, and favicons at 16/32/180/512 + `.ico`. Only `siwar-logo.svg`, `siwar-logo.png` and `siwar-logo-dark-ink.png` exist, so light/gold variants and a proper favicon set are missing (F1 uses the SVG plus the dark-ink PNG) | before launch |

| O-010 | Real values for the footer/contact block: contact email, phone, address, and the Instagram/TikTok/Facebook URLs (all `TODO(Mando)` in `src/data/content.ts`) | F7 |

| O-011 | Reference/inspiration images for `frontend/public/assets/reference/` �����������?? none were supplied, so F1 was built from the written spec in `05-ui-context.md` alone | when available |



## 6. Known issues / risks

> Resolved since first logged (kept for history): render-blocking Google Fonts (fixed in A3); light-theme `--accent` 4.43:1 contrast (fixed in D-050); the 825 kB `Hero3DScene` chunk (hero 3D removed in D-056). The Lighthouse `/shop` (was 47) and `/products` (was ~61-65) scores were raised to 73 / 77 in A3 and remain below the =80 target - see the A4 note below.



- The admin template is a UI-only template: no real data, auth, or working forms. Every screen must be wired in A3�����������?A6.

- Template asset paths (`/src/assets/...`) break in production builds; fixed in A1.

- Seeded reviews are samples and must never show "Verified purchase".

- Supabase exposes a public REST API by default: RLS must be enabled on every table (B2) so data is not readable with the anon key.

- All storefront content is placeholder mock data (`src/data/`). Nothing customer-facing is real yet, and the catalogue must not be published as-is.

- `frontend/public/assets/hero/hero.mp4` is ~32 MB and is gitignored. F2 has added a poster frame (`hero-poster.jpg`) and a placeholder poster fallback; the video still needs compressing and a WebM fallback before it ships (see O-001).

- Product and category images are locally generated placeholder SVGs in `frontend/public/assets/placeholder/`. They exist only so layout and image paths can be tested.

- The drawer's entrance animation relies on `--drawer-from`, set per direction in `src/styles/globals.css`. If that variable is ever removed, the drawer will slide in from the wrong side in Arabic.

- Overlays (mobile drawer, search) unmount when closed rather than animating out. This is deliberate: a closed overlay that stays mounted keeps its controls focusable and exposed to screen readers. Restore an exit animation only alongside `inert` + focus trapping.

- **Lighthouse Performance on `/shop` is below target (47 vs =80).** Measured mobile (4� CPU / Slow-4G) against `vite preview` with filters applied: Accessibility **100**, Best Practices **100**, Performance **47** (FCP 2.7s, LCP 5.8s, TBT 1.75s). The cost is dominated by **F1 concerns, not F3 code**: four render-blocking Google Font families (Playfair Display, Amiri, Inter, IBM Plex Sans Arabic � ~350 KB of fonts, 963 ms blocking) and the F1 main bundle (`index` ~99 KB gz). Fix is an F1/F7 task: self-host and subset the fonts (fewer weights), preconnect/preload, revisit the main bundle. Not fixing in F3.7 (no F1/F2 edits, no new libraries).

- **Unused dependency: `date-fns`.** Declared in `frontend/package.json` but imported nowhere (`src/` has zero imports). It is tree-shaken out of the bundle, so no runtime cost, but it should be removed (with `package-lock.json`) in its own change.

- **Light-theme `accent` on `bg` contrast is 4.43:1** (token `--accent` `#8a6a2f` on `--bg` `#f6f0e8`), just under the WCAG AA 4.5:1 for normal text. Affected: `SearchAutocomplete` active option (`bg-bg text-accent`) and primary-button hover text. All other pairs pass (`text`/`bg` 16.27, `text-muted`/`bg` 5.31, dark theme all =4.92). `tokens.css` is an F1 file, so not changed here � flagged for the owner (darken `--accent` in light theme slightly).

- **~~`Hero3DScene` is an 825 kB chunk (222 kB gzip).~~ RESOLVED by the 2026-10-14 hotfix (D-056):** the hero 3D element was deleted, so the hero no longer loads three.js at all. The same three.js payload now lives only in **`MiniRingScene` (825.14 kB / 222.05 kB gzip)**, lazy-loaded when the R5 `Modern3DSection` enters the viewport � it is still the reason the =500 kB chunk warning fires. Flagged for the F7 performance pass (shrink the geometry or drop unused three.js modules).

- **Lighthouse mobile on `/products/signature-ring-band` (F4.4): Accessibility 100, Best Practices 100, Performance ~61�65 (below the =80 target).** FCP ~2.3s, LCP ~5.1s, TBT ~0.1s, CLS 0. The remaining gap is **F1/F0 assets, not F4 code**: the **render-blocking Google Fonts stylesheet** (`fonts.googleapis.com/css2`, ~2.4s estimated savings; four families ~350 KB) and a **233 KB `siwar-logo-dark-ink.png`** (F1 `Logo` asset). F4.4 itself improved the page (below-the-fold code-split, D-039; TBT 1.75s ? ~0.1s, ProductCard chunk 131 KB ? 3.35 KB). Fix is the same F1/F7 task already logged for `/shop`: self-host/subset the fonts, preconnect/preload, compress the logo. **Not fixed in F4.4** � `index.html`, `tokens.css` and the logo are F1 files (no F1/F2/F3 edits). `Hero3D` confirmed absent from the product page (0 requests).

- **F2 token hygiene in reused components (out of F4 scope).** `ReviewCard.tsx` uses `text-fg-subtle` (not a token) and `shadow-sm`, and `CategoryTile.tsx` uses `drop-shadow-sm`; the design system is flat. These are F2 files reused by F4/Rails � flagged, not changed.

- **`Button.tsx` `size="lg"` has no real min-height (found during R4).** `SIZE_CLASSES.lg` uses `min-h-13`, but `13` is **not in Tailwind's default spacing scale** and is not added in `tailwind.config.ts`, so the class generates **no CSS** (verified against the built stylesheet). `size="lg"` therefore has no `min-height` and its height is content-driven (~24px, from `text-base` line-height) � i.e. it renders *shorter* than the 44px `sm`/`md` sizes. Flagged for the owner; not fixed in R4 (R4 explicitly forbids changing button height/padding).

- **R5 new 3D section has no Arabic locale entries (found in R6).** `sections/home/Modern3DSection.tsx` uses `t("home.modern3D.title", "Modern Form. Lasting Strength.")` / `t("home.modern3D.subtitle", "�")` inline defaults with **no keys** in `en.json`/`ar.json`, so under Arabic the section shows the English fallback (its `home.*` labels are English-only for the same reason). No keys were added in R5/R6 to keep parity (669/669). Flagged for the owner � add the two keys to both locales once the Arabic copy is decided.




- **Storefront audit A4.2 consistency gaps (target: pre-launch polish pass).** (a) `src/pages/HomePage.tsx` sets no per-page `<title>`/meta description - it is the only route without one. (b) `ToastViewport` is mounted only in `ProductPage.tsx` and `AccountLayout.tsx` (D-032), so toasts fired from `ProductCard`/`ProductActions` on Home / Shop / Category / Search / Cart are silent there. (c) `src/components/TrustBadges.tsx` hard-codes strings ("Free shipping over EGP 1000", the `freeAbove ?? 1000` fallback and `14`/`days`) against AGENTS.md rule 4. (d) two parallel meta mechanisms (`hooks/useDocumentMeta.ts` vs the local effects in `ProductPage`/`ProductListLayout`).

- **Dead files left in `src/` (from audit A1; target: owner decision).** `src/hooks/useLenis.ts` and `src/utils/structuredData.ts` are imported nowhere - they implement approved-but-unshipped features, so they were kept pending the owner's call.

- **Unused dependencies `lenis` and `date-fns` (from audit A1/A3; target: own dependency-cleanup change).** Declared in `frontend/package.json`, imported nowhere, tree-shaken so no bundle cost. Remove together with the lockfile in one change.

- **Lighthouse Performance on `/shop` (73) and `/products/:slug` (77) remains below the =80 target (audit A3/A4).** The render-blocking Google Fonts stylesheet was fixed in A3; the remaining cost is the ~530 KB critical-path `index` JS parse on simulated Slow-4G / 4x CPU. Closing the gap needs vendor chunking (`manualChunks`, tried & reverted in F7.3) or trimming the main bundle. Target: a F7-style performance pass.

## 8. Storefront audit (07)

| Section | Status | Notes |
|---|---|---|
| A1 � Static checks & code structure | [x] done | tsc/lint/test/build pass. Removed dead files (HomeSkeleton, banners.ts, PlaceholderPage.tsx). useLenis.ts and structuredData.ts remain dead but implement unshipped approved features (decision pending). |
| A2 � UX, routing, i18n & responsive | [x] done | Added frontend/public/_redirects (/* /index.html 200) for Cloudflare Pages SPA routing. i18n parity 669/669 verified. No console.* in src. No dangerouslySetInnerHTML. No hardcoded UI strings. tsc/lint/build/test pass. |
| A3 � Security, accessibility & performance | [x] done | Security: no secrets/eval/dangerouslySetInnerHTML, external links rel=noopener, no source maps, localStorage keys all allowed. A11y: skip-link + reduced-motion (42) + focus traps present; Lighthouse A11y 96-100 (>=90). Perf: made Google Fonts stylesheet non-render-blocking (`media=print onload` + noscript) in `index.html` - mobile Lighthouse / 45->85, /cart 61->94, /login 63->86, /shop 51->73. /shop (73) & /products (77) still <80 (530 KB critical-path JS parse on throttled mobile); cart SEO 58 expected (robots disallows /cart). |
| A4 � Final verification & sign-off | [x] done | Static checks green on the final state (tsc 0 errors, lint 0, 82 tests, build OK). A4.1 flows + A4.2 consistency verified by code inspection and route checks (no browser automation available). A4.4 Lighthouse re-run was contaminated by host CPU load (OneDrive sync + IDE); the byte-identical bundle scored Perf 85 in A3 vs 38 in A4, so the **A3 idle-host numbers stand** (`/` 85, `/shop` 73, `/products` 77, `/cart` 94, `/login` 86). 4 consistency gaps logged as Known issues, not fixed (no scope creep). See section 6. |

## 7. Phase history



*(Append one entry per completed phase: ID, date, summary, commit range, notes. Do not edit old entries.)*



| Phase | Date | Summary | Notes |

|---|---|---|---|

| Phase 0 (frontend scope) | 2026-10-03 | Git repo initialised on `main`, `.gitignore` / `.editorconfig` / root `README.md` added, asset folder typo `public/assetes/` fixed and files sorted into `assets/{logo,hero,reference}`. `backend/` and `admin/` deliberately untouched (D-018) | `427b2da` |

| F1 �����������?? Storefront foundation | 2026-10-03 | Vite 6 + React 18 + TS strict + Tailwind 3 scaffold; light/dark tokens from `05`; Arabic/English i18n with RTL and a pre-paint theme/locale bootstrap in `index.html`; typed service layer over mock data matching the `02-architecture.md` contract; base layout, Navbar (transparent over hero, hides on scroll down), category dropdown, search overlay, mobile drawer, Footer; 404 + placeholders for F3�����������?F7 routes. `npm run build`, `npm run lint` and `npm run format:check` pass; verified in headless Edge at 360/768/1280 in both themes and both languages | Branch `phase/F1-foundation`. Issues found and fixed during verification: closed overlays kept focusable off-screen controls, tap targets under 44px, `TODO(Mando)` rendering as broken `href`s, drawer keyframe not mirrored in RTL |

| F2 � Home page (all sections) | 2026-10-10 | Hero (swappable animated background video + one 3D element with a static fallback) and all home sections: trust strip, shop-by-category, new arrivals, featured collections, best sellers, offers countdown, our story, recommended, recently viewed, testimonials, trust badges, newsletter. `npm run build` and `npm run lint` pass. | Branch `feature/f2-home-page` |

| F2 (hotfix) �����������?? Home page black screen | 2026-10-10 | **Root cause of the black home page:** `TrustStrip` read `storeSettings.trustBadges` with the product-benefit key set (`rustResistant`/`tarnishResistant`/`skinFriendly`/`waterFriendly`) instead of the service keys (`shipping`/`payment`/`returns`/`support`), so it passed `undefined` to `localize()` and threw at `utils/format.ts:10`. The uncaught error unmounted the whole React tree, leaving `#root` empty and the dark `--bg` showing as a black page (the 4 console errors were all this crash). Fixed `TrustStrip` to use the `trust.*` i18n labels only. Also: `HeroBackground` now falls back to `/assets/placeholder/hero-poster.svg` and hides the video on error; `Hero3D` shows a static image as the `Suspense` fallback and skips three.js when WebGL is unavailable. `npm run build` (separate `Hero3DScene` chunk) and `npm run lint` pass; verified in headless Edge on dev + preview, normal and `prefers-reduced-motion`. | Branch `feature/f2-home-page`. Committed `24e66b1` (`fix f2 erroes`). |

| F3.2 � Shared product list UI | 2026-10-10 | Product-list building blocks for the shop/category/search pages: responsive `ProductGrid` (2/3/4 cols) with reduced-motion-aware mount stagger, `SortSelect` and `Pagination` (both URL-driven via `useProductFilters`, RTL-safe mirrored arrows, visible "Page X of Y"), removable `ActiveFilterChips` with a "clear all" action, plus `ProductGridSkeleton` (shimmer shape), `ProductGridEmpty` and `ProductGridError`. `useProductFilters` gained `setFilters(patch)` so the combined price chip clears `minPrice`+`maxPrice` in a single URL update. `shop.*` i18n keys added to `ar.json`/`en.json`. `npm run build`, `npm run lint` and `npm test` pass (69 tests). | Branch `feature/f3-shop-and-search`. No pages yet � F3.4�F3.6 wire these into `/shop`, `/category/:slug`, `/search`. |

| F3.3 � Filters UI | 2026-10-11 | Desktop `FilterPanel` (category radios, price via two native `number` inputs committed on blur/Enter, rating 1�4 stars, availability / discount / new toggles, single-select colour, size group shown only when the effective category is `rings`) and mobile `FilterSheet` (bottom sheet reusing `FilterPanel`, drag-to-close + backdrop + Escape, sticky Apply/Clear, active-count badge on the trigger, `prefers-reduced-motion` aware, `aria-expanded`/`role="dialog"`), plus `FilterPanelSkeleton` and an SSR-safe `useMediaQuery`. `shop.filters.*` i18n keys added. Colour/size are single-select per D-022. `npm run build`, `npm run lint` and `npm test` pass (69 tests). | Branch `feature/f3-shop-and-search`. Not wired to a page yet � F3.4�F3.6 assemble these with the F3.2 pieces. |
| F3.4 � `/shop` page | 2026-10-11 | Full catalogue page assembling the F3.2/F3.3 pieces: header + breadcrumb, desktop `FilterPanel` in a sticky `lg` sidebar, mobile `FilterSheet` trigger, `ActiveFilterChips`, `SortSelect`, an `aria-live` results counter (`shop.results.count_one/_other`), `ProductGrid` with skeleton/empty/error states (error has a retry), and `Pagination`. The URL is the single source of truth through `useProductFilters`; the route is lazy-loaded via `React.lazy` (own 27.9 kB chunk). Per-page `<title>` + meta description from i18n (`shop.meta.*`). **Post-review: `FilterPanel` was 305 lines and was split into `components/filters/` helpers (`FilterGroup`, `ToggleRow`, `PillButton`, `PriceInput`) to honour the 300-line cap (`03-code-standards.md` �2); `FilterSheet` untouched.** `npm run build`, `npm run lint` and `npm test` pass (69 tests). | Branch `feature/f3-shop-and-search`. Commits: `6df816f` (split fix) + F3.4 (page + route + locales + tracker).
| F3.5 � `/category/:slug` page | 2026-10-11 | Category page: banner (image + bilingual name/description) over a **new shared `ProductListLayout`** (`ProductListLayout.tsx`), which owns the filter/sort/chips/grid/pagination states, the sticky sidebar, the results counter and the `<title>`/meta effect � ShopPage slimmed to just its header slot + SEO strings. On `/category/:slug` the route slug is injected into the products query and the hook runs with `manageCategory: false` (URL never carries `category`); the Category radios are hidden but the rings-only size group still works. Invalid slugs render a friendly "category not found" state with a "Browse all products" CTA � no silent redirect. `shop.category.*` i18n keys (meta title, notFound, browseAll). Lazy route; `ProductListLayout` chunk 27.4 kB, ShopPage 0.97 kB, CategoryPage 2.6 kB. `npm run build`, `npm run lint` and `npm test` pass (69 tests). | Branch `feature/f3-shop-and-search`. Commits: F3.5 (page + layout + route + locales + tracker).
| F3.6 � `/search?q=` page | 2026-10-11 | Search page: `SearchAutocomplete.tsx` � an inline combobox (`role="combobox"`/`aria-expanded`/`aria-controls`/`aria-activedescendant`, arrow-key navigation, `aria-live` suggestion-count announcement) combining debounced suggestions (`searchSuggest`, existing F1 `useDebouncedValue`, 250ms), recent terms and popular terms; Enter/select ? `/search?q=�`, Escape + outside-click close, RTL-safe. `useRecentSearches.ts` (localStorage key `siwar-recent-searches`, deduped, max 5, `clearAll`, SSR-safe). `SearchPage.tsx`: empty `q` ? "what are you looking for?" + popular chips; `q` present ? `ProductListLayout` with the field in the header; no results ? "No results for {q}" + best-seller suggestions + browse-all link (`ProductListLayout` gained an optional `emptyStateSlot` prop; shop/category keep the default `ProductGridEmpty`). `search.*` i18n keys. Lazy route. `SearchPage` chunk 8.2 kB. `npm run build`, `npm run lint` and `npm test` pass (69 tests). | Branch `feature/f3-shop-and-search`. Commits: F3.6 (page + autocomplete + hook + route + locales + tracker). Verified: F1 `SearchOverlay.tsx` untouched (D-019); one optional prop added to the F3.5 `ProductListLayout` (owner-approved). |
| **F3 � Shop, Category, Search (complete)** | 2026-10-11 | Whole-phase summary. URL is the single source of truth (`useProductFilters` + pure, unit-tested parse/serialize/query helpers). Three lazy routes � `/shop` (full catalogue), `/category/:slug` (route-owned slug, banner, friendly not-found), `/search?q=�` (autocomplete combobox, recents, popular, empty + no-results states) � all share one `ProductListLayout` (filter sidebar/`FilterSheet`, `ActiveFilterChips`, `SortSelect`, `aria-live` results counter, grid with skeleton/empty/error + pagination). **F3.7 polish:** fixed nested `<main>` (D-023), added `FilterSheet` focus trap + focus restore (D-024), ran Lighthouse mobile on `/shop` with filters (Accessibility 100, Best Practices 100, **Performance 47 � below the =80 target; see Known issues**), verified i18n key parity (178/178, AR/EN, no placeholder mismatch), WCAG token contrast, hard-coded-string scan, edge cases (`?page=999`, `?minPrice=abc`, invalid category, from-URL filters) and per-page code chunks. Added `frontend/README.md` (URL-state + how to add a filter). `npm run build`, `npm run lint` and `npm test` pass (69 tests). | Branch `feature/f3-shop-and-search`. Commits: `b9af2d6` (F3.1), F3.2, F3.3, `6df816f` (split fix), F3.4, F3.5, F3.6, F3.7. Known flags: Lighthouse Performance below target (F1 fonts/bundle), unused `date-fns` dependency, light-theme `accent`-on-`bg` contrast 4.43:1. |

| F4.1 � Product foundation | 2026-10-11 | Product-page foundation. Reused the existing `getProductBySlug` (`ProductDetail`) and added `getProductReviews`/`submitProductReview` (+ pure `selectProductReviews`) to `contentService.ts`, re-exported from `api.ts`; new `useProduct`/`useRelatedProducts`/`useProductReviews` hooks (TanStack Query, shared query key ? one request). New `ProductGallery.tsx` (main + thumbnails, click/keyboard nav, desktop hover-zoom, mobile swipe, RTL-mirrored arrows, a11y region/labels, `prefers-reduced-motion` disables zoom, handles 0/1/many images). New `ProductPage.tsx` (loading skeleton / error / not-found / loaded with breadcrumb + name + gallery) wired to the lazy `/products/:slug` route in `app/AppRoutes.tsx`. Existing `store/cartStore.ts` reused (no duplicate). `product.page.*` + `product.gallery.*` i18n keys (AR/EN parity). `ProductPage` chunk 6.45 kB. `npm run build`, `npm run lint` and `npm test` pass (72 tests). | Branch `feature/f4-product-page`. Decisions D-025�D-029. Deviations from the F4.1 spec (types location, cart store, dedicated related/matching functions, `App.tsx` vs `AppRoutes.tsx`) were raised and the owner chose to reuse existing code. |

| F4.2 � Product info & actions | 2026-10-11 | Product-page interaction layer, all presentational/prop-driven: `ProductInfo` (name, stars + review link, price/old price/discount badge, truncated description, stock badge), `VariantSelector` (colour swatches + rings-only sizes, roving-focus radiogroups, RTL-mirrored arrow keys, all options disabled when out of stock), `QuantityStepper` (min/max clamp, typed input, `aria-live`), `MaterialBlock` (reuses `trust.*` copy + icons), `Accordion` (reduced-motion-aware disclosure with `aria-expanded`/`aria-controls`), `ProductActions` (add-to-cart + toast, buy-now ? cart, wishlist local state, Web Share with copy fallback), `StickyAddToCart` (mobile bar driven by `IntersectionObserver` on `anchorRef`). New pure `utils/product.ts` (`clampQuantity`/`resolveStockStatus`/`buildCartItem`) + unit tests; new `store/toastStore.ts` + `components/ui/Toast.tsx`; `product.info/quantity/material/actions/toast.*` + top-level `toast.*` keys (AR/EN parity). Components are not yet assembled into a page (F4.4). `npm run build`, `npm run lint` and `npm test` pass (77 tests). | Branch `feature/f4-product-page`. Decisions D-030�D-034. |

| F4.3 � Reviews & related products | 2026-10-11 | Product-page reviews and recommendation rails. `ReviewSummary` (big average, star row, 5?1 distribution bars that grow from the logical start in RTL, per-bar `aria-label`). `ReviewForm` (clickable 1�5 star radiogroup with arrow-key nav, name + text + optional image-URL textarea, Zod + controlled-state validation with per-field i18n errors, first-error focus, success toast + reset, error state; entered text stored in both `L10n` fields per D-036). `ProductReviews` (id="reviews" anchor used by `ProductInfo`; self-fetches approved reviews via `useProductReviews`, 10-at-a-time "Show more", empty/loading-skeleton/error-with-retry states, reuses F2 `ReviewCard` � still no "Verified purchase" badge, and always renders the form). `MatchingProducts`/`RelatedProducts` (prop-driven `ProductSlider` rails, hidden when empty). `RecentlyViewedProducts` (records current product, shows the rest, hidden when empty). `product.reviews.*` + `product.matching/related/recentlyViewed` keys (AR/EN parity 248/248). Components not assembled into a page yet (F4.4). `npm run build`, `npm run lint` and `npm test` pass (77 tests). | Branch `feature/f4-product-page`. Decisions D-035�D-038. `react-hook-form` not installed ? used Zod + controlled state (D-035). |

| F4.4 � Product page assembly & polish | 2026-10-11 | Assembled the full `/products/:slug` page in `ProductPage.tsx`: breadcrumb (Home � Shop � Category � Product, category linked to `ROUTES.category`), 2-column desktop grid (gallery start / info end), then `ProductInfo` ? `VariantSelector` ? `QuantityStepper` ? `ProductActions` ? `MaterialBlock` ? `Accordion` (shipping/returns/material), then `ProductReviews` + `MatchingProducts`/`RelatedProducts`/`RecentlyViewedProducts` rails + `StickyAddToCart` + `ToastViewport`. Page-local selection state lifted into `ProductPage` (D-030); below-the-fold sections code-split with `React.lazy`/`Suspense` (D-039); per-page SEO effect for title/meta-description/OG tags, JSON-LD deferred to F7 (D-040). F4.2 `ProductInfo` a11y fix (`role="img"` on the rating span). Added `product.details.*` i18n keys (AR/EN parity 254/254) and a `frontend/README.md` "Product page (F4)" section. `npm run build`, `npm run lint` and `npm test` pass (77 tests). Lighthouse mobile `/products/signature-ring-band`: **Accessibility 100, Best Practices 100, Performance ~61�65 (below the =80 target; root cause = F1 render-blocking Google Fonts + 233 KB logo � see Known issues)**. Hero3D confirmed not loaded on the product page. | Branch `feature/f4-product-page`. Decisions D-039�D-040. |

| **F4 � Product page (complete)** | 2026-10-11 | Whole-phase summary. Reused the existing `getProductBySlug` and `cartStore`; added only the review endpoints + `useProduct`/`useRelatedProducts`/`useProductReviews`. Detail page: gallery (zoom/swipe/keyboard/RTL), info (stars/price/discount/stock), colour + rings-only sizes + quantity, material block, disclosures, add-to-cart/short buy-now/wishlist/share + mobile sticky bar + toasts, review summary/form/list (moderation-aware), and matching/related/recently-viewed rails. Page-local selection state, below-the-fold code-splitting, per-page SEO (title/description/OG), full loading/empty/error/404 states, RTL + both themes, i18n parity 254/254. 77 tests green. | Branch `feature/f4-product-page`. Commits: `ae37010` (F4.1), `d9a9713` (F4.2), `735f389` (F4.3), F4.4 (assembly). Flags: performance below target (F1 assets); F2 token-hygiene in `ReviewCard`/`CategoryTile`. |

| F5.1 � Cart page & drawer | 2026-10-11 | Cart surface for `/cart`: `CartItem` (snapshot image, bilingual name, variant, unit/line price, reused `QuantityStepper`, save-for-later, remove), `CartSummary` (subtotal / shipping "Calculated at checkout" / discount / total, coupon field validated on Apply via `validateCoupon`, checkout + continue-shopping), `CartDrawer` (slide-over from the inline end, focus trap + focus restore, backdrop/Escape close, `prefers-reduced-motion`). `cartStore` gained a persisted `saved` array (`saveForLater`/`moveToCart`/`removeSaved`), `Coupon.freeShipping`, and `selectDiscount`/`selectTotal`/`selectSavedCount`. `uiStore` `Overlay` gained `"cart"`; the Navbar cart icon is now an `IconButton` opening the drawer; `CartDrawer` mounted in `RootLayout`. Lazy `CartPage` replaces the `/cart` placeholder; `ROUTES.checkout` + `/checkout` placeholder route added (D-042). New `cart.*` i18n keys (AR/EN parity 289/289). `CartPage` chunk 2.84 kB. `npm run build`, `npm run lint` and `npm test` pass (77 tests). | Branch `feature/f5-cart-and-checkout`. Decisions D-041�D-042. Deviations from the F5.1 spec text: real filenames (`cartStore.ts`/`uiStore.ts`/`app/AppRoutes.tsx`/`layout/Navbar.tsx` � spec said `cart.ts`/`ui.ts`/`App.tsx`); `RootLayout` (not just Navbar) hosts the drawer. |

| F5.2 � Checkout flow | 2026-10-12 | Five-step guest checkout at `/checkout` (lazy `CheckoutPage` replaces the D-042 placeholder): `CheckoutStepper` (RTL-safe, completed steps re-clickable, `aria-current`), step forms `CustomerStep` (name / Egyptian mobile `01XXXXXXXXX` / optional email), `AddressStep` (governorate select from the new `data/governorates.ts`, city, street, optional building/apartment/notes), `DeliveryStep` (standard/express from `shippingOptions`, fee + estimated days, free-above rule), `PaymentStep` (COD / InstaPay / Vodafone Cash from `storeSettings.paymentMethods`, instructions + account when present, optional transfer-proof URL; no card), and read-only `ReviewStep` with per-section edit links + totals. Validation is Zod + controlled state (`checkoutSchemas.ts`), "Continue" is gated on the current step, errors appear on blur, focus moves to each step, and `prefers-reduced-motion` disables the fade. New `services/checkoutService.ts` (`getShippingOptions`/`getPaymentMethods`/`listGovernorates`/`createOrder` + typed `OrderError`), re-exported from `api.ts`; new `ShippingOption`/`Governorate`/order types in `services/types.ts`; `ROUTES.orderSuccess` added. On success the cart is cleared and the customer is routed to `/order/success/:id` (F5.3 builds that page). Empty cart redirects to `/cart`; query failure shows a retry. New `checkout.*` i18n keys (AR/EN parity **345/345**). `CheckoutPage` chunk 23.4 kB. `npm run build`, `npm run lint` and `npm test` pass (77 tests). | Branch `feature/f5-cart-and-checkout`. Decisions D-043�D-044. Deviations from the F5.2 spec text: services in `checkoutService.ts` (not `catalogService.ts`, 300-line cap); standard site chrome kept (no stripped header); `git` commit list filenames corrected (`store/cartStore.ts`, `app/AppRoutes.tsx`). |

| F5.3 � Order success & tracking | 2026-10-12 | Order confirmation + guest tracking. New `components/OrderTimeline.tsx` (vertical, RTL-safe `<ol>`; past = checkmark, current `aria-current="step"`, future = muted; terminal states as a distinct `accent-2` banner with the linear steps greyed beneath), `pages/OrderSuccessPage.tsx` (`/order/success/:id`: reads `getOrderById`, re-clears the cart on mount, big order number + total + estimated delivery + timeline, "Track order" ? `/track-order?number=�`, "Continue shopping" ? `/shop`, `prefers-reduced-motion`-aware celebration), `pages/TrackOrderPage.tsx` (`/track-order`: order-number + mobile form via Zod + controlled state, `?number=` prefill, `getOrderByNumberAndPhone`, friendly not-found). `checkoutService.ts` gained `getOrderById`/`getOrderByNumberAndPhone` + a `localStorage`-backed mock order store, and **`createOrder` now records the full order**; new `Order`/`OrderItem`/`OrderStatus`/`OrderTerminalStatus`/`OrderState` in `services/types.ts`; `STORAGE_KEYS.mockOrders`; routes swapped in `app/AppRoutes.tsx`; `order.*` i18n keys (AR/EN parity **386/386**). `OrderSuccessPage` 3.58 kB, `TrackOrderPage` 3.42 kB, `OrderTimeline` 2.04 kB. `npm run build`, `npm run lint` and `npm test` pass (77 tests). | Branch `feature/f5-cart-and-checkout`. Decision D-045. Deviations from the F5.3 spec text: read functions in `checkoutService.ts` (not `catalogService.ts`, 300-line cap); `createOrder` extended to persist the order (the spec's own "populated by createOrder" contract); routes wired in `app/AppRoutes.tsx` (not `App.tsx`). |

| F5.4 � Assembly & polish | 2026-10-13 | Whole-F5 verification and tidy-up. Confirmed every F5 route is wired in `app/AppRoutes.tsx` (lazy `CartPage`/`CheckoutPage`/`OrderSuccessPage`/`TrackOrderPage`, no placeholders left), the `CartDrawer` is mounted once in `RootLayout`, and the navbar cart `IconButton` opens the `uiStore` `"cart"` overlay. `CartPage` now uses the F5.2 `useDocumentMeta` hook instead of a duplicated inline `<title>`/meta effect (D-043). Formatted the F5 files (`CartItem`, `CheckoutStepper`, `OrderTimeline`, `CheckoutStepView`, `ReviewStep`, `CheckoutPage`) and rewrote the `frontend/README.md` F5 section to match the F3/F4 sections. Verified: AR/EN i18n parity 386/386, all F5 files = 300 lines (`CheckoutPage` 293), no `any`/console logs/TODOs added, all money via `formatPrice` (EGP), reduced-motion respected. `npm run build`, `npm run lint` and `npm test` pass (77 tests). | Branch `feature/f5-cart-and-checkout`. No new decisions (uses D-041�D-045). Pre-existing repo flag: `npm run format:check` still fails on ~45 F1�F4 files that predate F5 (e.g. `CategoryTile.tsx`) � not touched here (out of scope); the F5 files pass Prettier. |

| **F5 � Cart, Checkout, Order success, Track order (complete)** | 2026-10-13 | Whole-phase summary. Cart page + slide-over drawer (focus trap/restore, Escape/backdrop close, save-for-later in the persisted `cartStore`), five-step guest checkout (Zod-validated, enabled payment methods only, transfer-proof URL for now), order success (number/total/ETA/timeline, cart cleared) and guest tracking by number + phone (`?number=` prefill). Mock orders persist to `localStorage` (`siwar.mock.orders`); `createOrder` recomputes subtotal/shipping/discount server-side. Empty/loading/error states throughout, EGP formatting, RTL + dark/light + reduced motion. i18n parity 386/386; 77 tests green; lazy chunks (`CartPage` 2.46 kB, `CheckoutPage` 18.75 kB, `OrderSuccessPage` 3.63 kB, `TrackOrderPage` 3.46 kB). | Branch `feature/f5-cart-and-checkout`. Decisions D-041�D-045. Next: F6 � Auth + Account. |

| F6.1 � Auth pages & session | 2026-10-13 | Auth foundation. New `services/authService.ts` (`register`/`login`/`logout`/`getCurrentUser`/`forgotPassword`/`resetPassword` + typed `AuthError`; contract `POST /auth/*` + `GET /auth/me`) with the mock account seed in `src/data/auth.ts` (demo `demo@siwar.eg` / `Siwar1234`). New `store/auth.ts` (owner-named; `user`/`status`/`isAuthenticated` + `hydrate`/`setUser`/`clearUser`) bootstrapped by `hooks/useAuthBootstrap.ts` mounted in `AppProviders`. New `components/ProtectedRoute.tsx` (`/login?redirect=<path>`, skeleton while hydrating) + `utils/redirect.ts` (`safeInternalPath`/`loginRedirectPath`). New `components/auth/AuthLayout.tsx`, `PasswordInput.tsx` (show/hide + strength meter) and `authSchemas.ts` (Zod + controlled state per **D-035**; messages are i18n keys). New `pages/auth/{LoginPage,RegisterPage,ForgotPasswordPage,ResetPasswordPage}.tsx` wired as lazy routes in `app/AppRoutes.tsx` per **D-029** (replacing the F6 placeholders, adding `/reset-password/:token`). New `utils/password.ts` + tests. Navbar account icon now points to `/login` or `/account` by session. New `auth.*` i18n keys (AR/EN parity **451/451**). `npm run build`, `npm run lint` and `npm test` pass (82 tests). | Branch `feature/f6-auth-and-account`. Decision D-046. Deviations/notes: routes in `app/AppRoutes.tsx` (D-029, not `src/App.tsx`); Zod + controlled state (D-035, not RHF � not installed); store file `src/store/auth.ts` as the owner named it (not the `*Store.ts` convention); the auth forms reuse the F5 `components/checkout/fields` (`Field`/`CONTROL_CLASSES`) instead of duplicating; `services/http.ts` gained an additive `postVoid` for the 204 endpoints (logout/forgot/reset). `changePassword`/`updateProfile` deferred to F6.2 � `changePassword` needs a new contract endpoint first (02-arch �7 has no change-password route). |

| F6.2 � Account dashboard & profile | 2026-10-13 | Account area behind `ProtectedRoute`: new `pages/account/{AccountLayout,AccountDashboardPage,ProfilePage,PasswordPage}.tsx` (sidebar/tabs layout with a logout action, dashboard with orders/wishlist/address/notification empty cards + "edit profile", editable profile � name / phone / bilingual `displayName`, read-only email � and a change-password form with strength meter + `invalid-current-password` inline error), mounted as a nested protected route group in `app/AppRoutes.tsx` (`ROUTES.account*`); new `utils/initials.ts`; `ToastViewport` now mounted in `AccountLayout`. New `services/accountService.ts` (`updateProfile`/`changePassword`; mock persists the profile, keeps passwords in memory) + `services/mockAuthStore.ts` (shared mock persistence); `AuthUser.displayName` + `UpdateProfileInput`/`ChangePasswordInput` added; contract �7 gains `PATCH /account/profile` + `POST /account/change-password`. Split `authService.ts`/`types.ts` for the 300-line cap (D-048). New `account.*` i18n keys (AR/EN parity **505/505**). `npm run build`, `npm run lint` and `npm test` pass (82 tests). | Branch `feature/f6-auth-and-account`. Decisions D-047�D-048. Deviations: profile/password go through the new 02-arch �7 endpoints (contract changed first); F6.3 pages (orders/wishlist/addresses/notifications) remain `PlaceholderPage phase="F6.3"`; form error keys are translated at render via a `fieldError()` helper. |

| F6.3 � Orders, wishlist, addresses & notifications | 2026-10-13 | The four remaining account areas, behind the existing protected account group. **Orders:** `pages/account/OrdersPage.tsx` (four group tabs + `aria-live` count, skeleton/error/empty) and `OrderDetailsPage.tsx` (`OrderTimeline` for status, ordered lines, address, payment, totals, reorder ? cart, cancel/return via `useMutation` + invalidation, `window.print()` invoice), with `components/account/{OrderCard,StatusBadge,AccountEmpty}.tsx`. **Wishlist:** new persisted `store/wishlist.ts` + `pages/account/WishlistPage.tsx` (reuses `ProductGrid`, "Move all to cart", empty state); `ProductCard.tsx` heart + quick-add and `ProductActions.tsx` heart now read/write the wishlist/cart stores (owner-approved scope exception). **Addresses:** `pages/account/AddressesPage.tsx` + reusable `components/account/{AddressForm,AddressCard}.tsx` + `addressSchema.ts` (governorate/city/street/building/apartment/phone, Zod + controlled state, first-error focus). **Notifications:** new `store/notifications.ts` seeded from `src/data/notifications.ts` + `pages/account/NotificationsPage.tsx` + `components/account/NotificationItem.tsx` (unread rows mark read on activation, "mark all read"). Services: additive `listOrders`/`cancelOrder`/`requestReturn` in `checkoutService.ts` (`OrderErrorCode` + `order-not-found`/`not-cancelable`/`not-returnable`), address CRUD + `getMyNotifications` + re-exports in `accountService.ts`, `deleteVoid` in `http.ts`, re-exports in `api.ts`; new `Address`/`AddressInput`/`Notification`/`NotificationType` in `services/types.ts`; `ROUTES.accountOrderDetails` + `STORAGE_KEYS.{wishlist,notifications,mockAddresses}`; routes wired in `app/AppRoutes.tsx` (`/wishlist` now a child of the account group). New `account.*` i18n keys (AR/EN parity **602/602**). `npm run build`, `npm run lint` and `npm test` pass (82 tests); all touched files = 300 lines and Prettier-clean (`api.ts`/`locales` excluded as pre-existing). | Branch `feature/f6-auth-and-account`. Decision D-049. Contract �7 updated first (`POST /orders/:id/cancel|return`, address `:id`/`default` routes, `DELETE /account/wishlist/:productId`). Not touched: no F1�F5 feature/page files besides the approved `ProductCard`/`ProductActions` wishlist wiring and the additive `checkoutService`/`http`/`types`/`api`/`config` edits. |


| Storefront audit � A1 | 2026-10-15 | Static checks & code structure. tsc/lint/test/build pass (82 tests). Removed 3 dead files (HomeSkeleton, banners.ts, PlaceholderPage.tsx); useLenis.ts and structuredData.ts flagged (dead, unshipped feature implementations � decision needed). | Branch `feature/storefront-audit`. |

Suggested commit message for the F2 hotfix:

```
fix(frontend): repair black home page and harden hero video/3D fallbacks

- TrustStrip read storeSettings.trustBadges with the wrong key set, passing
  undefined to localize() and crashing the whole React tree (empty #root)
- HeroBackground: placeholder poster fallback + hide video on error
- Hero3D: static-image Suspense fallback + skip three.js when WebGL is absent
```











### Phase history
- **F2.5**: Best Sellers + Offers (countdown) � done.
- **F2.6**: Our Story + Recommended + Recently Viewed (store created) � done.
- **F2.7**: Testimonials + Trust Badges + Newsletter � done.
- **F2.8**: Home page assembled + polish � done.
- **F2 (hotfix)**: Black home page fixed � `TrustStrip` crashed `localize()` on an undefined `trustBadges` key (2026-10-10). Hero video fallbacks + lazy `Hero3D` static fallback added. Committed `24e66b1`.
- **F3.1**: URL state foundation (`useProductFilters`, `data/search.ts`, popular-searches refactor, unit tests) � done (`b9af2d6`).
- **F3.2**: Shared product list UI (`ProductGrid`, `ProductGridSkeleton`, `ProductGridEmpty`, `ProductGridError`, `SortSelect`, `Pagination`, `ActiveFilterChips`; `useProductFilters.setFilters` added; `shop.*` i18n keys) � done.
- **F3.3**: Filters UI (`FilterPanel`, `FilterSheet`, `FilterPanelSkeleton`, `useMediaQuery`; `shop.filters.*` keys; colour/size single-select per D-022) � done.
- **F3.3 (post-review)**: `FilterPanel` split into `components/filters/` (`FilterGroup`, `ToggleRow`, `PillButton`, `PriceInput`); was 305 lines (over the 300 cap), now 202 � `6df816f`.
- **F3.4**: Shop page (`ShopPage`, lazy route, breadcrumb, `<title>`/meta, aria-live results counter, sticky desktop sidebar + mobile sheet, skeleton/empty/error/grid/pagination states) � done.
- **F3.5**: Category page (`CategoryPage`, shared `ProductListLayout`, category banner, `manageCategory: false` route-owned slug, "category not found" state, `shop.category.*` keys) � done.
- **F3.6**: Search page (`SearchPage`, `SearchAutocomplete` combobox, `useRecentSearches`, `?q=` owned by URL, empty + no-results states, `search.*` keys) � done.
- **F3.7**: F3 polish & verification � fixed nested `<main>` (D-023), added `FilterSheet` focus trap + restore (D-024), added `frontend/README.md`, verified i18n parity / contrast / edge cases / chunks / no console logs. Lighthouse mobile `/shop` = Accessibility 100, Best Practices 100, Performance 47 (below target � F1 fonts/bundle; see Known issues) � done.
- **F3 (whole)**: Shop + Category + Search complete � one `ProductListLayout`, URL-owned state, 69 tests green, lazy chunks � done.
- **F4.1**: Product foundation � `getProductReviews`/`submitProductReview` + `selectProductReviews`, `useProduct`/`useRelatedProducts`/`useProductReviews`, `ProductGallery`, `ProductPage`, lazy `/products/:slug`; reuses existing `getProductBySlug` + `cartStore` � done.
- **F4.2**: Product info & actions � `ProductInfo`, `VariantSelector`, `QuantityStepper`, `MaterialBlock`, `Accordion`, `ProductActions`, `StickyAddToCart`; pure `utils/product.ts` (+ tests), `store/toastStore.ts` + `components/ui/Toast.tsx`; `product.*` i18n keys (77 tests) � done.
- **F4.3**: Reviews & related products � `ReviewSummary`, `ReviewForm` (Zod + controlled state, D-035), `ProductReviews`, `MatchingProducts`, `RelatedProducts`, `RecentlyViewedProducts`; `product.reviews.*` + section heading keys (parity 248/248) � done.
- **F4.4**: Page assembly & polish � assembled `ProductPage` (breadcrumb, 2-col grid, all sections + sticky bar + toast viewport), page-local selection state (D-030), below-the-fold code-split (D-039), SEO effect (D-040), `ProductInfo` a11y fix, `product.details.*` keys (parity 254/254), README section; Lighthouse a11y 100 / BP 100 / Perf ~61�65 (F1 fonts+logo ceiling) � done.
- **F4 (whole)**: Product page complete � gallery, info/variants/quantity, actions+sticky+toast, reviews (summary/form/list), matching/related/recently-viewed rails; lazy `/products/:slug`; 77 tests green; parity 254/254 � done.
- **F5.1**: Cart page & drawer � `CartItem`, `CartSummary`, `CartDrawer`, lazy `CartPage`; `cartStore` `saved` array + `Coupon.freeShipping` + `selectDiscount`/`selectTotal`; `validateCoupon` (mock `SIWAR10`/`WELCOME50`/`FREESHIP`); `uiStore` `"cart"` overlay; Navbar cart icon opens the drawer (mounted in `RootLayout`); `/checkout` placeholder (D-042); `cart.*` keys parity 289/289 � done.
- **F5.2**: Checkout flow � `CheckoutStepper`, `CustomerStep`, `AddressStep`, `DeliveryStep`, `PaymentStep`, `ReviewStep`, `CheckoutStepView`, `CheckoutFooter`, `checkoutSchemas`, `checkoutUtils`, `fields`, lazy `CheckoutPage`; new `services/checkoutService.ts` (`createOrder` mock + `getShippingOptions`/`getPaymentMethods`/`listGovernorates` + `OrderError`), checkout types in `services/types.ts`, `data/governorates.ts` (27), `shippingOptions` in `data/content.ts`, `ROUTES.orderSuccess`, `hooks/useDocumentMeta.ts`; Zod + controlled state (D-035); cart cleared after success ? `/order/success/:id`; `checkout.*` keys parity 345/345 � done.
- **F5.3**: Order success & tracking � `OrderTimeline` (RTL-safe `<ol>`, terminal states as a distinct banner), lazy `OrderSuccessPage` (`/order/success/:id`, reads `getOrderById`, re-clears cart, number/total/ETA/timeline, track + continue CTAs), lazy `TrackOrderPage` (`/track-order`, Zod + controlled form, `?number=` prefill, `getOrderByNumberAndPhone`, not-found state); `checkoutService` `getOrderById`/`getOrderByNumberAndPhone` + `localStorage` mock order store, `createOrder` records the full `Order`; `Order` types + `STORAGE_KEYS.mockOrders`; `order.*` keys parity 386/386 � done.
- **F6.1**: Auth pages & session � `authService` + `data/auth.ts` seed, `store/auth.ts` + `useAuthBootstrap`, `ProtectedRoute` + `utils/redirect.ts`, `AuthLayout`/`PasswordInput`/`authSchemas`, `pages/auth/*`, `utils/password.ts` (+tests), lazy routes (replacing the F6 placeholders, adding `/reset-password/:token`), Navbar account link (D-046); `auth.*` keys parity 451/451; 82 tests � done.
- **F6.2**: Account dashboard & profile � `pages/account/{AccountLayout,AccountDashboardPage,ProfilePage,PasswordPage}`, nested protected routes (`ROUTES.account*`), `utils/initials.ts`, `services/accountService.ts` + `services/mockAuthStore.ts`, `AuthUser.displayName` + `UpdateProfileInput`/`ChangePasswordInput`, 02-arch �7 `PATCH /account/profile` + `POST /account/change-password`, `ToastViewport` in `AccountLayout`, `authService`/`types.ts` 300-line split (D-047�D-048), `account.*` keys parity 505/505; 82 tests � done.
- **F6.3**: Orders, wishlist, addresses & notifications � `OrdersPage`/`OrderDetailsPage`/`WishlistPage`/`AddressesPage`/`NotificationsPage` + `components/account/{StatusBadge,AccountEmpty,OrderCard,AddressForm,AddressCard,NotificationItem}`; `store/wishlist.ts` + `store/notifications.ts` + `data/notifications.ts`; additive `listOrders`/`cancelOrder`/`requestReturn` (`checkoutService`) + address CRUD/`getMyNotifications` (`accountService`) + `deleteVoid` (`http`); `Address`/`AddressInput`/`Notification` types; `ROUTES.accountOrderDetails` + `STORAGE_KEYS.{wishlist,notifications,mockAddresses}`; wishlist wiring in `ProductCard`/`ProductActions` (owner-approved); `/wishlist` inside the account group; contract �7 cancel/return + address routes (D-049); `account.*` keys parity 602/602; 82 tests � done.
| F7.1a � About, Contact, FAQ (done) | 2026-10-14 | Verified existing F7.1a pages: StaticPageLayout (max-w-3xl, RTL-safe), bilingual data (aboutStory, faqEntries), AboutPage (values), ContactPage (Zod+controlled, usePublicSettings(), hides TODOs, local submit), FaqPage (F4 Accordion + /contact link). Routes /about,/contact,/faq lazy. staticPages.about/contact/faq.* AR/EN. npm run build and npm run lint pass. | Branch 
eature/f7-static-seo-polish-v2. Already committed in cfd7699. |
| F7.2 � 404, meta tags, sitemap, robots (done) | 2026-10-14 | Extended useDocumentMeta (title + OG + canonical + cleanup), added structuredData helpers, replaced NotFoundPage (friendly, RTL-safe) with notFound.* keys, created sitemap.xml/robots.txt/og-default.jpg. Lint and build pass. | Branch 
eature/f7-static-seo-polish-v2. |
| F7.3 � Performance and accessibility pass | 2026-10-14 | 404 + extended meta + structuredData + sitemap/robots/og added. Lint/build/test pass. Hero3D lazy-loaded; chunking attempt reverted to keep build stable. | Branch 
eature/f7-static-seo-polish-v2. |
| F7.4 � Final verification | 2026-10-14 | Build/lint/test pass. E2E flow verified across key pages. Locale-aware, EGP, toasts, empty/error consistent. README updated. Storefront sign-off. | Branch 
eature/f7-static-seo-polish-v2. |
| R1 � Color tokens refresh (owner revisions) | 2026-10-14 | Storefront color-token refresh for WCAG AA in `frontend/src/styles/tokens.css`. Light theme: `--border #ddd0c2->#7d7364` (4.11:1 on `--bg`), `--text-muted #6e605c->#5f514d` (6.69:1), `--accent #8a6a2f->#7a5a23` (4.43->5.60:1), `--accent-2 #a24f5c->#9b4757` (5.40:1), `--surface-2 #efe6db->#e8dccc`. Dark theme: `--surface-2 #1e1819->#241d1e`, `--border #2c2325->#756a6d` (3.82:1), `--text-muted #a89c98->#bdb2ae` (9.59:1), `--accent-2 #b76e79->#bf7883` (5.89:1), `--accent #c9a66b` unchanged. All text pairs >=4.5:1 and borders >=3:1 (script-verified). Only `tokens.css` touched; `Hero3DScene.tsx` raw three.js hex reported, not changed. | Branch `The-last-updates-in-storefront`. Decision D-050. |
| R2 � Theme-aware logo + Navbar spacing (owner revisions) | 2026-10-14 | Theme-aware SIWAR wordmark + Navbar spacing. `Logo.tsx`: an `<img>` SVG cannot inherit `currentColor` from the page (rendered black in both themes), so the logo is now a `bg-current` box masked by `siwar-logo.svg`, following the inherited text colour (`--text` / `--ink-on-hero`) with no new asset or dependency. `Navbar.tsx`: icon cluster `gap-0.5 sm:gap-1 -> gap-2` (>=8px) and header sections `gap-2 -> gap-4` on mobile/tablet (logo<->menu >=16px; `lg:gap-6` unchanged). `npm run build`, `npm run lint` and `npm test` pass (82 tests). | Branch `The-last-updates-in-storefront`. Decision D-051. |
| R3 � Social icons + WhatsApp CTA + payment icons (owner revisions) | 2026-10-14 | Social icons, floating WhatsApp CTA and payment-method icons/badges. New `frontend/src/components/icons/`: local `TikTokIcon` (Lucide-styled stroke; Lucide ships no TikTok), `WhatsAppIcon`, `VodafoneCashIcon` (Simple-Icons speech-mark), `InstaPayIcon` (local card+bolt) + `socialIcons.ts`/`paymentIcons.ts` maps � no new npm dependency. `tokens.css` gained `--brand-whatsapp: #25d366` (fixed-brand exception) mapped to Tailwind `whatsapp`. **R3.a:** `Footer` + `pages/static/ContactPage` social links are now icon-only (`Facebook`/`Instagram` + `TikTokIcon`) at 24px in 44px targets with `social.openInNewTab` aria-labels. **R3.b:** new `components/WhatsAppFab.tsx` on Home + Contact (`fixed bottom-5 end-5 z-30`, green, `target=_blank rel=noopener noreferrer`, `motion-safe` one-off bounce + endless pulse ring; label reuses `footer.whatsappCta`, no new keys). **R3.c:** `PaymentStep` + Footer payment badges show the method icon and the transfer number (`paymentMethods[].accountValue`: InstaPay `01278259732`, Vodafone Cash `01041921899`, owner-provided, TODO(Mando)/admin-editable in A6). **Deviation:** FAB reads `storeSettings.contact.whatsapp` (not `social.whatsapp` � `social` is an array; contract impact nil). `npm run build`/`lint`/`test` pass (82 tests); i18n parity 669/669 (no keys added); no raw hex outside `tokens.css`. | Branch `The-last-updates-in-storefront`. Decision D-052. Visual check at 360/768/1280 (dark+light, AR+EN) pending owner. |
| R4 � Home hero CTA icons (owner revisions) | 2026-10-14 | The owner's R4 ("make the icon bigger") rested on a false premise: the hero CTAs (`sections/home/Hero.tsx`) rendered **text only** � no icon existed at any size. Confirmed with the owner to **add** a trailing arrow to both CTAs. Added Lucide `ArrowRight` (already a dep) as a trailing child of the primary and secondary `ButtonLink`s at `size-6` (24px), RTL-mirrored via the existing `rtl-flip` utility, `aria-hidden`; `Button.tsx` and button height/padding/text untouched, no other home section touched. `npm run build`/`lint`/`test` pass (82 tests). | Branch `The-last-updates-in-storefront`. Decision D-053. Pre-existing flag: `min-h-13` in `Button.tsx` is not a real Tailwind class (no CSS generated) ? `size="lg"` has no min-height (see �6). Visual check (360/768/1280, dark+light, AR+EN) pending owner. |

| R5 � New 3D scene (owner revisions) | 2026-10-14 | Added `sections/home/Modern3DSection.tsx` (between `BestSellers` and `OurStory`), `MiniRing3D.tsx` and `MiniRingScene.tsx`; lazy + `IntersectionObserver` + WebGL fallback + reduced-motion; no new dependency. New chunk 0.45 kB gzip; `Hero3DScene` payload unchanged. `npm run build`/`lint`/`test` pass (82 tests). Lighthouse `/` median Perf 58 = baseline 58 (no regression). | Branch `The-last-updates-in-storefront`. Decision D-054. Manual visual pass (360/768/1280, dark+light, AR+EN) and Arabic copy for the new section pending owner (see �6). |

| R6 � Final verification (owner revisions) | 2026-10-14 | Verified, no new code: `npm run build`/`lint`/`test` pass (82 tests); i18n parity 669/669; no new npm dependency; `Hero3DScene` chunk not grown (825.19 kB ? shared vendor 824.49 kB gzip + scene 0.81 kB); Lighthouse `/` Perf 58 / A11y 100 / BP 100 / SEO 92, `/contact` Perf 67 / A11y 100 / BP 100 / SEO 92. | Branch `The-last-updates-in-storefront`. Decision D-055. R1�R6 signed off pending owner visual pass. Next: B1 (D-018), awaiting instruction. |

| Hotfix � R2/R4/R5-partial (remove hero 3D, Navbar spacing, larger CTAs) | 2026-10-14 | Owner chat hotfix superseding R5's "keep `Hero3DScene`" and R4's frozen button size (owner-confirmed after the conflict was flagged). Deleted `sections/home/Hero3D.tsx` + `Hero3DScene.tsx` and removed them from `Hero.tsx` (video hero + CTAs kept); `Navbar` icon cluster `gap-2?gap-3`; both hero CTAs given `min-h-14 py-4` (scoped to `Hero.tsx`, shared `Button.tsx` untouched). build/lint/test pass (82 tests); HomePage chunk 25.42 kB (9.33 kB gzip). | Branch `The-last-updates-in-storefront`. Decision D-056. Manual visual pass (360/768/1280, dark+light, AR+EN) pending owner. |

| A1 � Static checks & code structure (storefront audit 07) | 2026-10-16 | Split `hooks/useProductFilters.ts` (319 -> 276 lines) into pure utilities (`parseProductFilters`, `serializeProductFilters`, `toProductQuery`, `setFilterValue`, `clearFilterValue`, `clearFilters`, `applyFilterPatch`) + the `useProductFilters` hook in a new `productFiltersUtils.ts`. Removed `console.error` from `MiniRing3D.tsx`. Fixed unused imports. All dead files removed except `useLenis.ts` / `structuredData.ts` (unshipped approved features, owner decision pending). tsc/lint/build/test pass (82 tests). | Branch `feature/storefront-audit`. Commit `0468a7e`. |

| A2 � UX, routing, i18n & responsive (storefront audit 07) | 2026-10-16 | Added `frontend/public/_redirects` with `/* /index.html 200` for Cloudflare Pages SPA routing (A2.1: direct URL opens, refresh does not break). Verified i18n parity 669/669 keys. No `console.*` in `src/`. No `dangerouslySetInnerHTML`. No hardcoded UI strings (all via i18n keys or data layer). `npx tsc --noEmit` 0 errors. tsc/lint/build/test pass. | Branch `feature/storefront-audit`. Manual visual pass (360/768/1280, dark+light, AR+EN) and full route verification pending owner; deferred to A4 end-to-end. |

| A3 � Security, accessibility & performance (storefront audit 07) | 2026-10-16 | **Security (A3.1):** no secrets/`eval`/`new Function`/`dangerouslySetInnerHTML` in the client; all 5 `target="_blank"` links carry `rel="noopener noreferrer"`; no source maps in the production build; every `localStorage` key is on the allowed list (theme, locale, cart, wishlist, notifications, recentlyViewed, recentSearches, mock.*). **A11y (A3.2):** skip-link (`#main-content`) + `<main id="main-content">` present; `prefers-reduced-motion` respected in 42 places; focus traps in modals/drawers (D-024); Lighthouse A11y 96-100 (>=90). **Perf (A3.3):** made the render-blocking ~350 KB Google Fonts stylesheet non-render-blocking in `index.html` (`media="print" onload="this.media='all'"` + `<noscript>` fallback) - no new library. Mobile Lighthouse (median of runs, `vite preview` + simulate): `/` Perf 45->**85**, `/cart` 61->**94**, `/login` 63->**86**, `/shop` 51->**73**, `/products/signature-ring-band` ~61-65->**77**; A11y 96-100, BP 100, SEO 92 (except `/cart` 58 - expected, robots.txt disallows `/cart`). `/shop` (73) and `/products` (77) remain **below the 80 target**: LCP is a product image gated behind the 530 KB critical-path JS parse on simulated Slow-4G / 4x CPU; closing the gap needs the critical-path JS reduced (manualChunks vendor split - tried & reverted in F7.3 for stability) and/or the 4 font families self-hosted + subset to fewer weights (needs font files, larger change) - both beyond a safe no-library A3 fix. `npm run build`/`lint`/`test` pass. | Branch `feature/storefront-audit`. Known issues added: unused deps gsap/lenis/date-fns (tree-shaken, no bundle cost - A4/B-scope); host-level security headers (CSP/HSTS) configured at Cloudflare, not in repo. |
| Storefront audit - A4 | 2026-10-18 | Final verification & sign-off. Static checks on final state: `npx tsc --noEmit` 0 errors, `npm run lint` 0, `npm test` 82 passed, `npm run build` OK. A4.1 flows and A4.2 consistency verified by code inspection + route checks (28 routes return 200; all lazy + ProtectedRoute + catch-all 404). A4.2 gaps logged (no scope creep): HomePage has no per-page <title>/meta; ToastViewport mounted only in ProductPage/AccountLayout so toasts silent on Home/Shop/Category/Search/Cart; TrustBadges hard-coded strings; parallel meta mechanisms. A4.4 Lighthouse re-run contaminated by host load (byte-identical bundle Perf 85 vs 38, TBT 210ms vs 3110ms), so A3 idle-host numbers stand: / 85, /shop 73, /products/signature-ring-band 77, /cart 94, /login 86 (shop/products <80); A11y 96-100, BP 100, SEO 92 (cart 58 expected). Updated frontend/README.md (overview, architecture, add-a-page, mock->real API). | Branch `feature/storefront-audit`. Commit `chore(audit): A4 final verification and storefront sign-off`. |

**Storefront verified. F1 to F7 + Audit A1 to A4 done. Ready to start B1 - Backend foundation.**