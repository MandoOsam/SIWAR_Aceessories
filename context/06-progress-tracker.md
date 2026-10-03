# 06 — Progress Tracker

> State file. Update it at the end of **every phase** (see `04-ai-workflow-rules.md`). Never delete the Decisions log or the Phase history.
> Last updated: 2026-10-03 (Phase 0 frontend scope + F1 complete, owner decision D-018).

## 1. Current status

| Item | Value |
|---|---|
| **Current phase** | **F2 — Home page (Hero + all sections)** — not started |
| Last completed phase | Phase 0 (frontend scope only) + F1 — Storefront foundation |
| Next phase (proposed) | F2 — Home page (Hero + all sections) |
| Backend | Not started. Nothing implemented. **Out of scope until the storefront is done** (D-018). |
| Storefront (`frontend/`) | Phase 0 + F1 **done** on branch `phase/F1-foundation`. |
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
- [ ] Real product images — owner has them; to be uploaded through the admin later
- [ ] Animated hero background — owner will provide (file type TBD, see O-001)
- [ ] Full processed logo set (light/gold PNG, monogram, standard favicon sizes) — only 3 source files exist; see O-009


## 3. Roadmap (do in order; one phase at a time)

Legend: `[ ]` not started · `[~]` in progress · `[x]` done

### Phase 0 — Project setup
- [~] Create repo `siwar/` with `backend/`, `frontend/`, `admin/`, `context/` — done for `frontend/` + `context/`; `backend/` is an empty folder, `admin/` not created yet (both out of scope per D-018)
- [x] Place `AGENTS.md` at the root and the context files in `context/`
- [ ] Clone the admin template into `admin/` (keep its MIT `LICENSE`, add owner's copyright line) — deferred (D-018)
- [~] Copy logo files to `frontend/public/assets/logo/` and `admin/public/assets/logo/`; copy reference images to `frontend/public/assets/reference/` — storefront side done with the 3 real files; `admin/` side deferred; **no reference images exist**
- [x] `.gitignore`, `.editorconfig`, root `README.md` (short)
- [x] Initial commit (`427b2da`)
- [x] Fix asset folder typo: `public/assetes/` → `public/assets/`

### Backend (`backend/`)
- [ ] **B1 Foundation** — Express + TypeScript, env validation, Drizzle + Supabase connection, migrations setup, health check, error handler, pino logging, helmet/CORS, lint/test setup. *(If a leftover `mongoose` dependency exists, remove it.)*
- [ ] **B2 Auth & sessions** — users, sessions, argon2, customer + admin login, CSRF, roles/permissions middleware, rate limits, RLS enabled on all tables
- [ ] **B3 Catalog** — categories, products, images, Cloudinary signing endpoint, public listing/filter/search/sort/pagination
- [ ] **B4 Content & settings** — content blocks (hero, banners, story), static pages, store settings, public settings endpoint
- [ ] **B5 Orders** — coupons, order creation (transaction, server-side totals, stock), manual payment methods + proof upload, tracking, order events, admin order management
- [ ] **B6 Customer features** — reviews (submit/moderate), wishlist, addresses, notifications, newsletter, recently viewed support
- [ ] **B7 Admin analytics & ops** — dashboard stats, inventory movements, campaigns, activity log, CSV export
- [ ] **B8 Hardening & deploy** — security review, tests, seed data, production config, deployment (see D-001)

### Admin (`admin/`) — phases mirror section 12 of `05b`
- [ ] **A1** Foundation & rebrand
- [ ] **A2** i18n + RTL
- [ ] **A3** Data layer + Auth (against mock first, then real API after B2)
- [ ] **A4** Core commerce (dashboard, products + ImageUploader, categories, orders, customers, inventory)
- [ ] **A5** Marketing & reviews
- [ ] **A6** CMS & settings
- [ ] **A7** Polish

### Storefront (`frontend/`)
- [x] **F1** Foundation — Vite + TS scaffold, tokens, fonts, i18n/RTL, dark/light, layout, Navbar/Footer, service layer with mock data
- [ ] **F2** Home — all sections, Hero with swappable animated background + one 3D element
- [ ] **F3** Shop, Category, Search — filters, sort, pagination, mobile filter sheet
- [ ] **F4** Product page — gallery, variants, reviews, related/matching
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
- Routes for F3–F7 already exist and render `src/pages/PlaceholderPage.tsx`, so navbar links work
  before their real page is built. Replace each placeholder as its phase lands.
- `src/pages/HomePage.tsx` is intentionally only a hero-height block (poster + headline from
  `GET /content/home`) so the navbar's transparent-over-hero behaviour can be checked. F2 replaces it.
- `src/components/layout/SearchOverlay.tsx` was included in F1 because the Navbar needs it; it calls
  `GET /search/suggest`. F3 adds the full results page.

### Suggested sequence
`Phase 0 → F1 → F2 → F3 → F4 → F5 → F6 → F7 → B1 → B2 → B3 → B4 → B5 → B6 → B7 → B8 → A1 → A2 → A3 → A4 → A5 → A6 → A7`

**The storefront is built first, end to end, on the mock service layer** (D-018). The backend comes after, and the admin last. Frontends switch from mock to the real API by setting `VITE_API_URL` once the matching backend phase is done — components never change.

## 4. Decisions log

`owner` = decided by the owner. `default` = proposed by the assistant, **not yet confirmed**; the owner may change it.

| ID | Date | Decision | Source |
|---|---|---|---|
| D-001 | — | **PENDING — Backend hosting.** Owner wants Cloudflare + Supabase. Cloudflare Pages hosts the two frontends. Express is a long-lived Node server and does not run on Cloudflare Workers out of the box. Options: (a) Express on Render/Railway/Fly.io; (b) rewrite the API on Hono for Cloudflare Workers (+ Hyperdrive for Postgres); (c) Cloudflare Containers. Decide before B8 | open |
| D-002 | 2026-10-03 | TypeScript (strict) in all three folders | owner |
| D-003 | 2026-10-03 | Database: PostgreSQL on Supabase (used only as managed Postgres). MongoDB/Mongoose dropped | owner |
| D-004 | — | **PENDING — Email provider** for password reset and order emails (e.g. Resend). Not needed until B2 | open |
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

## 5. Open questions for the owner

| ID | Question | Needed by |
|---|---|---|
| O-001 | Animated hero background: file type (MP4/WebM/Lottie/other), size, and the file itself | F2 |
| O-002 | Domain name (affects cookie domain and `api.` subdomain) | B2 / B8 |
| O-003 | Shipping: one flat fee, or per governorate? Free shipping above an amount? Courier company? | B4 / B5 |
| O-004 | Return policy (days) and the real trust-badge texts | B4 |
| O-005 | InstaPay address and Vodafone Cash number to display at checkout | B5 |
| O-006 | Real customer reviews to replace the 8 sample reviews before launch | before launch |
| O-007 | Will staff accounts (manager, support, content) exist at launch, or only the owner? | B2 |
| O-008 | SEO: is pre-rendering of product pages needed later? | F7 |
| O-009 | Full processed logo set: light-ink and gold PNGs, the monogram, and favicons at 16/32/180/512 + `.ico`. Only `siwar-logo.svg`, `siwar-logo.png` and `siwar-logo-dark-ink.png` exist, so light/gold variants and a proper favicon set are missing (F1 uses the SVG plus the dark-ink PNG) | before launch |
| O-010 | Real values for the footer/contact block: contact email, phone, address, and the Instagram/TikTok/Facebook URLs (all `TODO(Mando)` in `src/data/content.ts`) | F7 |
| O-011 | Reference/inspiration images for `frontend/public/assets/reference/` — none were supplied, so F1 was built from the written spec in `05-ui-context.md` alone | when available |

## 6. Known issues / risks

- The admin template is a UI-only template: no real data, auth, or working forms. Every screen must be wired in A3–A6.
- Template asset paths (`/src/assets/...`) break in production builds; fixed in A1.
- Seeded reviews are samples and must never show "Verified purchase".
- Supabase exposes a public REST API by default: RLS must be enabled on every table (B2) so data is not readable with the anon key.
- All storefront content is placeholder mock data (`src/data/`). Nothing customer-facing is real yet, and the catalogue must not be published as-is.
- `frontend/public/assets/hero/hero.mp4` is ~32 MB and is gitignored. F2 must compress it, add a poster frame, and provide a WebM fallback before it ships (see O-001).
- Product and category images are locally generated placeholder SVGs in `frontend/public/assets/placeholder/`. They exist only so layout and image paths can be tested.
- The drawer's entrance animation relies on `--drawer-from`, set per direction in `src/styles/globals.css`. If that variable is ever removed, the drawer will slide in from the wrong side in Arabic.
- Overlays (mobile drawer, search) unmount when closed rather than animating out. This is deliberate: a closed overlay that stays mounted keeps its controls focusable and exposed to screen readers. Restore an exit animation only alongside `inert` + focus trapping.

## 7. Phase history

*(Append one entry per completed phase: ID, date, summary, commit range, notes. Do not edit old entries.)*

| Phase | Date | Summary | Notes |
|---|---|---|---|
| Phase 0 (frontend scope) | 2026-10-03 | Git repo initialised on `main`, `.gitignore` / `.editorconfig` / root `README.md` added, asset folder typo `public/assetes/` fixed and files sorted into `assets/{logo,hero,reference}`. `backend/` and `admin/` deliberately untouched (D-018) | `427b2da` |
| F1 — Storefront foundation | 2026-10-03 | Vite 6 + React 18 + TS strict + Tailwind 3 scaffold; light/dark tokens from `05`; Arabic/English i18n with RTL and a pre-paint theme/locale bootstrap in `index.html`; typed service layer over mock data matching the `02-architecture.md` contract; base layout, Navbar (transparent over hero, hides on scroll down), category dropdown, search overlay, mobile drawer, Footer; 404 + placeholders for F3–F7 routes. `npm run build`, `npm run lint` and `npm run format:check` pass; verified in headless Edge at 360/768/1280 in both themes and both languages | Branch `phase/F1-foundation`. Issues found and fixed during verification: closed overlays kept focusable off-screen controls, tap targets under 44px, `TODO(Mando)` rendering as broken `href`s, drawer keyframe not mirrored in RTL |
