# 06 ———————————?? Progress Tracker



> State file. Update it at the end of **every phase** (see `04-ai-workflow-rules.md`). Never delete the Decisions log or the Phase history.

> Last updated: 2026-10-11 (F3.7 polish + verification done; **F3 — Shop, Category, Search complete**).

## 1. Current status



| Item | Value |

|---|---|

| **Current phase** | **F3 — Shop, Category, Search: done** (branch `feature/f3-shop-and-search`) |

| Last completed phase | F3.7 — F3 polish & verification (a11y, i18n, edge cases, Lighthouse) |

| Next phase | F4 — Product page (gallery, variants, reviews, related/matching) |

| Backend | Not started. Nothing implemented. **Out of scope until the storefront is done** (D-018). |

| Storefront (`frontend/`) | F1 + F2 **done**. F3 (Shop, Category, Search) in progress on branch `feature/f3-shop-and-search`. |

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

- [ ] Real product images ———————————?? owner has them; to be uploaded through the admin later

- [x] Animated hero background ———————————?? wired at `/assets/hero/hero.mp4` with poster fallback and `prefers-reduced-motion` support (O-001 resolved 2026-10-10; still needs compression + WebM before ship)

- [ ] Full processed logo set (light/gold PNG, monogram, standard favicon sizes) ———————————?? only 3 source files exist; see O-009





## 3. Roadmap (do in order; one phase at a time)



Legend: `[ ]` in progress (F2.1) —————— `[~]` in progress —————— `[x]` done



### Phase 0 ———————————?? Project setup

- [~] Create repo `siwar/` with `backend/`, `frontend/`, `admin/`, `context/` ———————————?? done for `frontend/` + `context/`; `backend/` is an empty folder, `admin/` not created yet (both out of scope per D-018)

- [x] Place `AGENTS.md` at the root and the context files in `context/`

- [ ] Clone the admin template into `admin/` (keep its MIT `LICENSE`, add owner's copyright line) ———————————?? deferred (D-018)

- [~] Copy logo files to `frontend/public/assets/logo/` and `admin/public/assets/logo/`; copy reference images to `frontend/public/assets/reference/` ———————————?? storefront side done with the 3 real files; `admin/` side deferred; **no reference images exist**

- [x] `.gitignore`, `.editorconfig`, root `README.md` (short)

- [x] Initial commit (`427b2da`)

- [x] Fix asset folder typo: `public/assetes/` ——————? ————?? `public/assets/`



### Backend (`backend/`)

- [ ] **B1 Foundation** ———————————?? Express + TypeScript, env validation, Drizzle + Supabase connection, migrations setup, health check, error handler, pino logging, helmet/CORS, lint/test setup. *(If a leftover `mongoose` dependency exists, remove it.)*

- [ ] **B2 Auth & sessions** ———————————?? users, sessions, argon2, customer + admin login, CSRF, roles/permissions middleware, rate limits, RLS enabled on all tables

- [ ] **B3 Catalog** ———————————?? categories, products, images, Cloudinary signing endpoint, public listing/filter/search/sort/pagination

- [ ] **B4 Content & settings** ———————————?? content blocks (hero, banners, story), static pages, store settings, public settings endpoint

- [ ] **B5 Orders** ———————————?? coupons, order creation (transaction, server-side totals, stock), manual payment methods + proof upload, tracking, order events, admin order management

- [ ] **B6 Customer features** ———————————?? reviews (submit/moderate), wishlist, addresses, notifications, newsletter, recently viewed support

- [ ] **B7 Admin analytics & ops** ———————————?? dashboard stats, inventory movements, campaigns, activity log, CSV export

- [ ] **B8 Hardening & deploy** ———————————?? security review, tests, seed data, production config, deployment (see D-001)



### Admin (`admin/`) ———————————?? phases mirror section 12 of `05b`

- [ ] **A1** Foundation & rebrand

- [ ] **A2** i18n + RTL

- [ ] **A3** Data layer + Auth (against mock first, then real API after B2)

- [ ] **A4** Core commerce (dashboard, products + ImageUploader, categories, orders, customers, inventory)

- [ ] **A5** Marketing & reviews

- [ ] **A6** CMS & settings

- [ ] **A7** Polish



### Storefront (`frontend/`)

- [x] **F1** Foundation ———————————?? Vite + TS scaffold, tokens, fonts, i18n/RTL, dark/light, layout, Navbar/Footer, service layer with mock data

- [x] **F2** Home - all sections, Hero with swappable animated background + one 3D element (F2.1-F2.7 structure in place; F2.8 polish) |

- [x] **F3** Shop, Category, Search ———————————?? filters, sort, pagination, mobile filter sheet. **F3.1 done** (`b9af2d6`); **F3.2** done; **F3.3** done; **F3.4** done; **F3.5** done; **F3.6** done; **F3.7 (polish & verification)** done

- [ ] **F4** Product page ———————————?? gallery, variants, reviews, related/matching

- [ ] **F5** Cart, Checkout, Order success, Track order

- [ ] **F6** Auth + Account (orders, wishlist, addresses)

- [ ] **F7** Static pages, 404/empty states, SEO tags, performance + accessibility pass



**F1 shape as built** (for the phases that follow):



- `src/services/` is the only data entry point. `mockAdapter.ts` answers the `02-architecture.md`

  endpoints from `src/data/`; setting `VITE_API_URL` switches to the real API with no component change.

- `src/data/` is placeholder content and must be replaced by the owner (products, settings, reviews,

  contact details, social URLs, images). Every missing value is the literal `TODO(Mando)`; components

  use `isPlaceholder()` from `src/utils/format.ts` to hide incomplete entries instead of rendering a

  broken link or visible `TODO` text.

- Routes for F3———————————?F7 already exist and render `src/pages/PlaceholderPage.tsx`, so navbar links work

  before their real page is built. Replace each placeholder as its phase lands.

- `src/pages/HomePage.tsx` is intentionally only a hero-height block (poster + headline from

  `GET /content/home`) so the navbar's transparent-over-hero behaviour can be checked. F2 replaces it.

- `src/components/layout/SearchOverlay.tsx` was included in F1 because the Navbar needs it; it calls

  `GET /search/suggest`. F3 adds the full results page.



### Suggested sequence

`Phase 0 ——————? ————?? F1 ——————? ————?? F2 ——————? ————?? F3 ——————? ————?? F4 ——————? ————?? F5 ——————? ————?? F6 ——————? ————?? F7 ——————? ————?? B1 ——————? ————?? B2 ——————? ————?? B3 ——————? ————?? B4 ——————? ————?? B5 ——————? ————?? B6 ——————? ————?? B7 ——————? ————?? B8 ——————? ————?? A1 ——————? ————?? A2 ——————? ————?? A3 ——————? ————?? A4 ——————? ————?? A5 ——————? ————?? A6 ——————? ————?? A7`



**The storefront is built first, end to end, on the mock service layer** (D-018). The backend comes after, and the admin last. Frontends switch from mock to the real API by setting `VITE_API_URL` once the matching backend phase is done ———————————?? components never change.



## 4. Decisions log



`owner` = decided by the owner. `default` = proposed by the assistant, **not yet confirmed**; the owner may change it.



| ID | Date | Decision | Source |

|---|---|---|---|

| D-001 | ———————————?? | **PENDING ———————————?? Backend hosting.** Owner wants Cloudflare + Supabase. Cloudflare Pages hosts the two frontends. Express is a long-lived Node server and does not run on Cloudflare Workers out of the box. Options: (a) Express on Render/Railway/Fly.io; (b) rewrite the API on Hono for Cloudflare Workers (+ Hyperdrive for Postgres); (c) Cloudflare Containers. Decide before B8 | open |

| D-002 | 2026-10-03 | TypeScript (strict) in all three folders | owner |

| D-003 | 2026-10-03 | Database: PostgreSQL on Supabase (used only as managed Postgres). MongoDB/Mongoose dropped | owner |

| D-004 | ———————————?? | **PENDING ———————————?? Email provider** for password reset and order emails (e.g. Resend). Not needed until B2 | open |

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

| D-021 | 2026-10-10 | Recent searches (query strings only, max 5) are stored in `localStorage`, consistent with the allowed client-storage list (theme, language, cart, recently-viewed) in `03-code-standards.md` §5. No personal data, no tokens. | owner |

| D-022 | 2026-10-11 | Filter **Color & Size are single-select for now**, built on the frozen F3.1 contract (`color?: ProductColor`, `size?: string`). True multi-select (OR inside one filter, e.g. gold OR silver) is deferred to its own sub-phase that changes the contract first — `services/types.ts` (`02-architecture.md` is the source of truth) → `useProductFilters` → `catalogService` → hook tests — then the multi-select UI. | owner |

| D-023 | 2026-10-11 | **One `<main>` per page.** `RootLayout` owns `<main id="main-content">` (the skip-link target); pages/layouts must not nest another `<main>`. `/shop`, `/category/:slug` and `/search` render `<div>`/`<section>` bodies. Enforced after F3.7 found `ProductListLayout` and `SearchPage` nesting `<main>`. | default |

| D-024 | 2026-10-11 | **Modal surfaces trap focus and restore it.** `FilterSheet` (and any future dialog) keeps Tab inside the open sheet and returns focus to the element that opened it on close, in addition to Escape-to-close. Implemented in F3.7. | default |



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

| O-011 | Reference/inspiration images for `frontend/public/assets/reference/` ———————————?? none were supplied, so F1 was built from the written spec in `05-ui-context.md` alone | when available |



## 6. Known issues / risks



- The admin template is a UI-only template: no real data, auth, or working forms. Every screen must be wired in A3———————————?A6.

- Template asset paths (`/src/assets/...`) break in production builds; fixed in A1.

- Seeded reviews are samples and must never show "Verified purchase".

- Supabase exposes a public REST API by default: RLS must be enabled on every table (B2) so data is not readable with the anon key.

- All storefront content is placeholder mock data (`src/data/`). Nothing customer-facing is real yet, and the catalogue must not be published as-is.

- `frontend/public/assets/hero/hero.mp4` is ~32 MB and is gitignored. F2 has added a poster frame (`hero-poster.jpg`) and a placeholder poster fallback; the video still needs compressing and a WebM fallback before it ships (see O-001).

- Product and category images are locally generated placeholder SVGs in `frontend/public/assets/placeholder/`. They exist only so layout and image paths can be tested.

- The drawer's entrance animation relies on `--drawer-from`, set per direction in `src/styles/globals.css`. If that variable is ever removed, the drawer will slide in from the wrong side in Arabic.

- Overlays (mobile drawer, search) unmount when closed rather than animating out. This is deliberate: a closed overlay that stays mounted keeps its controls focusable and exposed to screen readers. Restore an exit animation only alongside `inert` + focus trapping.

- **Lighthouse Performance on `/shop` is below target (47 vs ≥80).** Measured mobile (4× CPU / Slow-4G) against `vite preview` with filters applied: Accessibility **100**, Best Practices **100**, Performance **47** (FCP 2.7s, LCP 5.8s, TBT 1.75s). The cost is dominated by **F1 concerns, not F3 code**: four render-blocking Google Font families (Playfair Display, Amiri, Inter, IBM Plex Sans Arabic — ~350 KB of fonts, 963 ms blocking) and the F1 main bundle (`index` ~99 KB gz). Fix is an F1/F7 task: self-host and subset the fonts (fewer weights), preconnect/preload, revisit the main bundle. Not fixing in F3.7 (no F1/F2 edits, no new libraries).

- **Unused dependency: `date-fns`.** Declared in `frontend/package.json` but imported nowhere (`src/` has zero imports). It is tree-shaken out of the bundle, so no runtime cost, but it should be removed (with `package-lock.json`) in its own change.

- **Light-theme `accent` on `bg` contrast is 4.43:1** (token `--accent` `#8a6a2f` on `--bg` `#f6f0e8`), just under the WCAG AA 4.5:1 for normal text. Affected: `SearchAutocomplete` active option (`bg-bg text-accent`) and primary-button hover text. All other pairs pass (`text`/`bg` 16.27, `text-muted`/`bg` 5.31, dark theme all ≥4.92). `tokens.css` is an F1 file, so not changed here — flagged for the owner (darken `--accent` in light theme slightly).



## 7. Phase history



*(Append one entry per completed phase: ID, date, summary, commit range, notes. Do not edit old entries.)*



| Phase | Date | Summary | Notes |

|---|---|---|---|

| Phase 0 (frontend scope) | 2026-10-03 | Git repo initialised on `main`, `.gitignore` / `.editorconfig` / root `README.md` added, asset folder typo `public/assetes/` fixed and files sorted into `assets/{logo,hero,reference}`. `backend/` and `admin/` deliberately untouched (D-018) | `427b2da` |

| F1 ———————————?? Storefront foundation | 2026-10-03 | Vite 6 + React 18 + TS strict + Tailwind 3 scaffold; light/dark tokens from `05`; Arabic/English i18n with RTL and a pre-paint theme/locale bootstrap in `index.html`; typed service layer over mock data matching the `02-architecture.md` contract; base layout, Navbar (transparent over hero, hides on scroll down), category dropdown, search overlay, mobile drawer, Footer; 404 + placeholders for F3———————————?F7 routes. `npm run build`, `npm run lint` and `npm run format:check` pass; verified in headless Edge at 360/768/1280 in both themes and both languages | Branch `phase/F1-foundation`. Issues found and fixed during verification: closed overlays kept focusable off-screen controls, tap targets under 44px, `TODO(Mando)` rendering as broken `href`s, drawer keyframe not mirrored in RTL |

| F2 — Home page (all sections) | 2026-10-10 | Hero (swappable animated background video + one 3D element with a static fallback) and all home sections: trust strip, shop-by-category, new arrivals, featured collections, best sellers, offers countdown, our story, recommended, recently viewed, testimonials, trust badges, newsletter. `npm run build` and `npm run lint` pass. | Branch `feature/f2-home-page` |

| F2 (hotfix) ———————————?? Home page black screen | 2026-10-10 | **Root cause of the black home page:** `TrustStrip` read `storeSettings.trustBadges` with the product-benefit key set (`rustResistant`/`tarnishResistant`/`skinFriendly`/`waterFriendly`) instead of the service keys (`shipping`/`payment`/`returns`/`support`), so it passed `undefined` to `localize()` and threw at `utils/format.ts:10`. The uncaught error unmounted the whole React tree, leaving `#root` empty and the dark `--bg` showing as a black page (the 4 console errors were all this crash). Fixed `TrustStrip` to use the `trust.*` i18n labels only. Also: `HeroBackground` now falls back to `/assets/placeholder/hero-poster.svg` and hides the video on error; `Hero3D` shows a static image as the `Suspense` fallback and skips three.js when WebGL is unavailable. `npm run build` (separate `Hero3DScene` chunk) and `npm run lint` pass; verified in headless Edge on dev + preview, normal and `prefers-reduced-motion`. | Branch `feature/f2-home-page`. Committed `24e66b1` (`fix f2 erroes`). |

| F3.2 — Shared product list UI | 2026-10-10 | Product-list building blocks for the shop/category/search pages: responsive `ProductGrid` (2/3/4 cols) with reduced-motion-aware mount stagger, `SortSelect` and `Pagination` (both URL-driven via `useProductFilters`, RTL-safe mirrored arrows, visible "Page X of Y"), removable `ActiveFilterChips` with a "clear all" action, plus `ProductGridSkeleton` (shimmer shape), `ProductGridEmpty` and `ProductGridError`. `useProductFilters` gained `setFilters(patch)` so the combined price chip clears `minPrice`+`maxPrice` in a single URL update. `shop.*` i18n keys added to `ar.json`/`en.json`. `npm run build`, `npm run lint` and `npm test` pass (69 tests). | Branch `feature/f3-shop-and-search`. No pages yet — F3.4–F3.6 wire these into `/shop`, `/category/:slug`, `/search`. |

| F3.3 — Filters UI | 2026-10-11 | Desktop `FilterPanel` (category radios, price via two native `number` inputs committed on blur/Enter, rating 1–4 stars, availability / discount / new toggles, single-select colour, size group shown only when the effective category is `rings`) and mobile `FilterSheet` (bottom sheet reusing `FilterPanel`, drag-to-close + backdrop + Escape, sticky Apply/Clear, active-count badge on the trigger, `prefers-reduced-motion` aware, `aria-expanded`/`role="dialog"`), plus `FilterPanelSkeleton` and an SSR-safe `useMediaQuery`. `shop.filters.*` i18n keys added. Colour/size are single-select per D-022. `npm run build`, `npm run lint` and `npm test` pass (69 tests). | Branch `feature/f3-shop-and-search`. Not wired to a page yet — F3.4–F3.6 assemble these with the F3.2 pieces. |
| F3.4 — `/shop` page | 2026-10-11 | Full catalogue page assembling the F3.2/F3.3 pieces: header + breadcrumb, desktop `FilterPanel` in a sticky `lg` sidebar, mobile `FilterSheet` trigger, `ActiveFilterChips`, `SortSelect`, an `aria-live` results counter (`shop.results.count_one/_other`), `ProductGrid` with skeleton/empty/error states (error has a retry), and `Pagination`. The URL is the single source of truth through `useProductFilters`; the route is lazy-loaded via `React.lazy` (own 27.9 kB chunk). Per-page `<title>` + meta description from i18n (`shop.meta.*`). **Post-review: `FilterPanel` was 305 lines and was split into `components/filters/` helpers (`FilterGroup`, `ToggleRow`, `PillButton`, `PriceInput`) to honour the 300-line cap (`03-code-standards.md` §2); `FilterSheet` untouched.** `npm run build`, `npm run lint` and `npm test` pass (69 tests). | Branch `feature/f3-shop-and-search`. Commits: `6df816f` (split fix) + F3.4 (page + route + locales + tracker).
| F3.5 — `/category/:slug` page | 2026-10-11 | Category page: banner (image + bilingual name/description) over a **new shared `ProductListLayout`** (`ProductListLayout.tsx`), which owns the filter/sort/chips/grid/pagination states, the sticky sidebar, the results counter and the `<title>`/meta effect — ShopPage slimmed to just its header slot + SEO strings. On `/category/:slug` the route slug is injected into the products query and the hook runs with `manageCategory: false` (URL never carries `category`); the Category radios are hidden but the rings-only size group still works. Invalid slugs render a friendly "category not found" state with a "Browse all products" CTA — no silent redirect. `shop.category.*` i18n keys (meta title, notFound, browseAll). Lazy route; `ProductListLayout` chunk 27.4 kB, ShopPage 0.97 kB, CategoryPage 2.6 kB. `npm run build`, `npm run lint` and `npm test` pass (69 tests). | Branch `feature/f3-shop-and-search`. Commits: F3.5 (page + layout + route + locales + tracker).
| F3.6 — `/search?q=` page | 2026-10-11 | Search page: `SearchAutocomplete.tsx` — an inline combobox (`role="combobox"`/`aria-expanded`/`aria-controls`/`aria-activedescendant`, arrow-key navigation, `aria-live` suggestion-count announcement) combining debounced suggestions (`searchSuggest`, existing F1 `useDebouncedValue`, 250ms), recent terms and popular terms; Enter/select → `/search?q=…`, Escape + outside-click close, RTL-safe. `useRecentSearches.ts` (localStorage key `siwar-recent-searches`, deduped, max 5, `clearAll`, SSR-safe). `SearchPage.tsx`: empty `q` → "what are you looking for?" + popular chips; `q` present → `ProductListLayout` with the field in the header; no results → "No results for {q}" + best-seller suggestions + browse-all link (`ProductListLayout` gained an optional `emptyStateSlot` prop; shop/category keep the default `ProductGridEmpty`). `search.*` i18n keys. Lazy route. `SearchPage` chunk 8.2 kB. `npm run build`, `npm run lint` and `npm test` pass (69 tests). | Branch `feature/f3-shop-and-search`. Commits: F3.6 (page + autocomplete + hook + route + locales + tracker). Verified: F1 `SearchOverlay.tsx` untouched (D-019); one optional prop added to the F3.5 `ProductListLayout` (owner-approved). |
| **F3 — Shop, Category, Search (complete)** | 2026-10-11 | Whole-phase summary. URL is the single source of truth (`useProductFilters` + pure, unit-tested parse/serialize/query helpers). Three lazy routes — `/shop` (full catalogue), `/category/:slug` (route-owned slug, banner, friendly not-found), `/search?q=…` (autocomplete combobox, recents, popular, empty + no-results states) — all share one `ProductListLayout` (filter sidebar/`FilterSheet`, `ActiveFilterChips`, `SortSelect`, `aria-live` results counter, grid with skeleton/empty/error + pagination). **F3.7 polish:** fixed nested `<main>` (D-023), added `FilterSheet` focus trap + focus restore (D-024), ran Lighthouse mobile on `/shop` with filters (Accessibility 100, Best Practices 100, **Performance 47 — below the ≥80 target; see Known issues**), verified i18n key parity (178/178, AR/EN, no placeholder mismatch), WCAG token contrast, hard-coded-string scan, edge cases (`?page=999`, `?minPrice=abc`, invalid category, from-URL filters) and per-page code chunks. Added `frontend/README.md` (URL-state + how to add a filter). `npm run build`, `npm run lint` and `npm test` pass (69 tests). | Branch `feature/f3-shop-and-search`. Commits: `b9af2d6` (F3.1), F3.2, F3.3, `6df816f` (split fix), F3.4, F3.5, F3.6, F3.7. Known flags: Lighthouse Performance below target (F1 fonts/bundle), unused `date-fns` dependency, light-theme `accent`-on-`bg` contrast 4.43:1. |

Suggested commit message for the F2 hotfix:

```
fix(frontend): repair black home page and harden hero video/3D fallbacks

- TrustStrip read storeSettings.trustBadges with the wrong key set, passing
  undefined to localize() and crashing the whole React tree (empty #root)
- HeroBackground: placeholder poster fallback + hide video on error
- Hero3D: static-image Suspense fallback + skip three.js when WebGL is absent
```











### Phase history
- **F2.5**: Best Sellers + Offers (countdown) — done.
- **F2.6**: Our Story + Recommended + Recently Viewed (store created) — done.
- **F2.7**: Testimonials + Trust Badges + Newsletter — done.
- **F2.8**: Home page assembled + polish — done.
- **F2 (hotfix)**: Black home page fixed — `TrustStrip` crashed `localize()` on an undefined `trustBadges` key (2026-10-10). Hero video fallbacks + lazy `Hero3D` static fallback added. Committed `24e66b1`.
- **F3.1**: URL state foundation (`useProductFilters`, `data/search.ts`, popular-searches refactor, unit tests) — done (`b9af2d6`).
- **F3.2**: Shared product list UI (`ProductGrid`, `ProductGridSkeleton`, `ProductGridEmpty`, `ProductGridError`, `SortSelect`, `Pagination`, `ActiveFilterChips`; `useProductFilters.setFilters` added; `shop.*` i18n keys) — done.
- **F3.3**: Filters UI (`FilterPanel`, `FilterSheet`, `FilterPanelSkeleton`, `useMediaQuery`; `shop.filters.*` keys; colour/size single-select per D-022) — done.
- **F3.3 (post-review)**: `FilterPanel` split into `components/filters/` (`FilterGroup`, `ToggleRow`, `PillButton`, `PriceInput`); was 305 lines (over the 300 cap), now 202 — `6df816f`.
- **F3.4**: Shop page (`ShopPage`, lazy route, breadcrumb, `<title>`/meta, aria-live results counter, sticky desktop sidebar + mobile sheet, skeleton/empty/error/grid/pagination states) — done.
- **F3.5**: Category page (`CategoryPage`, shared `ProductListLayout`, category banner, `manageCategory: false` route-owned slug, "category not found" state, `shop.category.*` keys) — done.
- **F3.6**: Search page (`SearchPage`, `SearchAutocomplete` combobox, `useRecentSearches`, `?q=` owned by URL, empty + no-results states, `search.*` keys) — done.
- **F3.7**: F3 polish & verification — fixed nested `<main>` (D-023), added `FilterSheet` focus trap + restore (D-024), added `frontend/README.md`, verified i18n parity / contrast / edge cases / chunks / no console logs. Lighthouse mobile `/shop` = Accessibility 100, Best Practices 100, Performance 47 (below target — F1 fonts/bundle; see Known issues) — done.
- **F3 (whole)**: Shop + Category + Search complete — one `ProductListLayout`, URL-owned state, 69 tests green, lazy chunks — done.
