# 02 — Architecture

> Source of truth for the stack, data model, API contract, and boundaries.
> To change anything here: tell the owner first, update this file, then change the code.

## 1. System overview

```
Customer ──▶ frontend/ (Cloudflare Pages) ─┐
                                           ├─▶ backend/ (Express API) ─▶ Supabase PostgreSQL
Admin ─────▶ admin/    (Cloudflare Pages) ─┘            │
                                                        └─▶ Cloudinary (images, signed uploads)
```

- Two separate SPAs talk to **one REST API**. They never talk to the database or to Supabase directly.
- Supabase is used **only as managed PostgreSQL**. Not Supabase Auth, not the Supabase client libraries, not Supabase Storage.

## 2. Stack

| Layer | Choice |
|---|---|
| Language | TypeScript (strict) in all three folders |
| Backend | Node 20+, Express, Zod (validation), Drizzle ORM + drizzle-kit (migrations), `pg`, pino (logging), helmet, cors, express-rate-limit, Vitest + Supertest |
| Database | PostgreSQL on Supabase (pooled connection for the app, direct connection for migrations) |
| Auth | Server-side **sessions stored in PostgreSQL**, session id in an httpOnly cookie. Passwords hashed with argon2 |
| Storefront | React 18, Vite, Tailwind, React Router, i18next, Zustand, TanStack Query, React Hook Form + Zod, Framer Motion, GSAP, Lenis, Three.js (`@react-three/fiber`) |
| Admin | React 18, Vite, Tailwind, Redux Toolkit + RTK Query, React Router, Recharts, i18next, React Hook Form + Zod, dnd-kit |
| Images | Cloudinary, **signed uploads** (backend signs, browser uploads directly) |
| Hosting | `frontend/` and `admin/` on Cloudflare Pages; DNS/CDN on Cloudflare; database on Supabase; **backend host: see Pending decision D-001** |

Defaults marked as decisions in `06-progress-tracker.md` (ORM = Drizzle, sessions over JWT) can be changed by the owner.

## 3. Folder conventions

```
backend/src/
  app.ts  server.ts
  config/            # env.ts (validated with Zod)
  db/                # client.ts, schema/, migrations/, seed/
  modules/<feature>/ # routes.ts, controller.ts, service.ts, repository.ts, schema.ts (Zod), types.ts
  middlewares/       # auth, requireRole, validate, errorHandler, rateLimit, csrf
  lib/               # cloudinary.ts, logger.ts, mailer.ts
  utils/
```

Frontend and admin folder structures are defined in `05-ui-context.md` and `05b-ui-context-admin.md`.

## 4. Conventions that apply to every endpoint

- Base path: `/api/v1`. JSON only (except file uploads, which go to Cloudinary).
- **Ids** are UUIDs. **Money** is `NUMERIC(10,2)` in EGP, returned as a number with 2 decimals; totals are always computed on the server. **Dates** are ISO 8601 UTC.
- **Bilingual fields** are stored as JSONB `{ "ar": "...", "en": "..." }` and returned in the same shape.
- **List response:** `{ "data": T[], "total": number, "page": number, "limit": number }` with query params `page`, `limit`, `search`, `sort`, plus filters.
- **Single response:** `{ "data": T }`.
- **Error response:** `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }` with correct HTTP status (400, 401, 403, 404, 409, 422, 429, 500).
- All input is validated with Zod at the route level. Never trust the client for prices, totals, stock, or discounts.

## 5. Authentication & sessions

- Two cookies, host-only, different names so a customer session never works on admin routes: `siwar_sid` (customers) and `siwar_admin_sid` (staff).
- Cookie flags: `HttpOnly`, `Secure`, `SameSite=Lax`, path `/`. In production the API lives on a subdomain of the same site (e.g. `api.<domain>`), so no cross-site cookie hacks are needed. `TODO(Mando)`: domain name.
- Sessions table in PostgreSQL with expiry; logout deletes the row; password change invalidates other sessions.
- CSRF: reject mutating requests (`POST/PUT/PATCH/DELETE`) unless the `Origin` header matches an allowed origin **and** an `X-CSRF-Token` header matches the token from `GET /auth/csrf`.
- Rate limit login, register, forgot-password, and coupon validation.
- Roles (`users.role`): `customer`, `super_admin`, `manager`, `support`, `content`. Permission map lives in one file (`backend/src/config/permissions.ts`) and is mirrored in `admin/src/config/permissions.ts`.

## 6. Database (PostgreSQL) — main tables

All tables have `id uuid pk`, `created_at`, `updated_at` unless noted. Use snake_case in the DB, camelCase in the API.

| Table | Key columns |
|---|---|
| `users` | email (unique), phone, password_hash, name, role, is_active, last_login_at |
| `sessions` | id, user_id, kind (`customer`/`admin`), expires_at, ip, user_agent |
| `categories` | slug (unique), name jsonb, description jsonb, image_url, parent_id, sort_order, is_active, seo jsonb |
| `products` | slug (unique), sku (unique), name jsonb, description jsonb, category_id, price, old_price, discount_percent, stock, low_stock_threshold, status (`draft`/`active`/`archived`), is_new, is_best_seller, is_featured, colors text[], sizes text[], material, plating, water_resistant, hypoallergenic, seo jsonb |
| `product_images` | product_id, url, alt jsonb, is_primary, sort_order |
| `addresses` | user_id, governorate, city, street, building, apartment, phone, is_default |
| `orders` | number (unique, e.g. `SW-10025`), user_id (nullable for guests), customer_name, phone, email, address jsonb, subtotal, shipping, discount, total, coupon_code, payment_method (`cod`/`instapay`/`vodafone_cash`), payment_status (`unpaid`/`paid`/`refunded`), payment_proof_url, status, tracking_number, courier, internal_note |
| `order_items` | order_id, product_id, name_snapshot jsonb, variant jsonb, qty, unit_price |
| `order_events` | order_id, status, note, actor_id, created_at (timeline) |
| `reviews` | product_id (nullable), user_id (nullable), author_name, rating 1–5, text jsonb, images text[], status (`pending`/`approved`/`hidden`), is_seed, show_on_home, is_verified_purchase |
| `wishlist_items` | user_id, product_id |
| `coupons` | code (unique), type (`percent`/`fixed`), value, min_order, max_discount, expires_at, usage_limit, used_count, is_active |
| `campaigns` | name jsonb, discount_percent, starts_at, ends_at, is_active, target (products/categories) |
| `content_blocks` | key (`hero`, `story`, `banner:<n>`...), data jsonb, sort_order, is_active |
| `pages` | slug (`about`, `faq`...), title jsonb, body jsonb |
| `store_settings` | single row: shipping, payment_methods, trust_badges, social, contact, seo |
| `inventory_movements` | product_id, delta, reason, actor_id |
| `notifications` | target (`admin`/user id), type, payload jsonb, read_at |
| `activity_log` | actor_id, action, entity, entity_id, meta jsonb |
| `newsletter_subscribers` | email (unique) |

**Supabase security (must do):** enable Row Level Security on **every** table with **no policies**, so the public Supabase REST API cannot read data. Only the backend's database role may access tables.

**Migrations:** every schema change is a Drizzle migration committed to git. Never edit the database by hand.

## 7. API contract

All paths are under `/api/v1`. `A` = needs admin session + permission.

### Public
| Method & path | Purpose |
|---|---|
| `GET /products` | list with `category`, `minPrice`, `maxPrice`, `rating`, `inStock`, `color`, `size`, `discount`, `isNew`, `sort`, `page`, `limit`, `search` |
| `GET /products/:slug` | product details + related |
| `GET /categories`, `GET /categories/:slug` | categories |
| `GET /search/suggest?q=` | autocomplete + popular searches |
| `GET /content/home` | hero, banners, story, trust badges, featured sections |
| `GET /content/pages/:slug` | static pages |
| `GET /reviews`, `GET /products/:id/reviews`, `POST /products/:id/reviews` | approved reviews, submit (goes to `pending`) |
| `GET /settings/public` | shipping fees, enabled payment methods + instructions, social |
| `POST /coupons/validate` | validate code against a cart |
| `POST /orders` | create order (guest or logged in) — server recomputes totals and checks stock |
| `GET /orders/track?number=&phone=` | public tracking |
| `POST /newsletter` | subscribe |
| `POST /uploads/payment-proof` | signed upload params for a transfer screenshot (rate limited) |

### Auth & account
`GET /auth/csrf`, `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/forgot-password`, `POST /auth/reset-password`;
`GET|PATCH /account/profile`, `GET /account/orders`, `GET /account/orders/:id`, `GET|POST|PATCH|DELETE /account/addresses`, `GET|POST|DELETE /account/wishlist`, `GET /account/notifications`.

### Admin (`/admin/...`, role-checked)
`POST /admin/auth/login`, `POST /admin/auth/logout`, `GET /admin/auth/me`;
`GET /admin/dashboard?range=`;
CRUD: `/admin/products`, `/admin/categories`, `/admin/coupons`, `/admin/campaigns`, `/admin/reviews`, `/admin/content/:key`, `/admin/pages/:slug`, `/admin/users`;
Orders: `GET /admin/orders`, `GET /admin/orders/:id`, `PATCH /admin/orders/:id/status`, `PATCH /admin/orders/:id/payment`, `POST /admin/orders` (manual order);
`GET /admin/customers`, `GET /admin/customers/:id`;
Inventory: `GET /admin/inventory`, `POST /admin/inventory/adjust`;
`GET|PATCH /admin/settings`; `GET /admin/notifications`, `PATCH /admin/notifications/read`; `GET /admin/activity`;
`POST /admin/uploads/sign` (Cloudinary signature); `GET /admin/export/:entity.csv`.

## 8. Payments (v1)

No payment gateway. Methods: **COD**, **InstaPay**, **Vodafone Cash**. For the last two the customer sees the account/number (from `store_settings`) and may upload a screenshot. The admin marks the order `paid`. Order statuses: `pending → confirmed → processing → shipped → out_for_delivery → delivered`, plus `cancelled`, `returned`, `refunded`.

## 9. Environment variables

| App | Variables |
|---|---|
| `backend` | `NODE_ENV`, `PORT`, `DATABASE_URL` (pooled), `DIRECT_URL` (migrations), `SESSION_SECRET`, `COOKIE_DOMAIN`, `FRONTEND_ORIGIN`, `ADMIN_ORIGIN`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, email provider vars (D-004) |
| `frontend` | `VITE_API_URL`, `VITE_CLOUDINARY_CLOUD_NAME` |
| `admin` | `VITE_API_URL`, `VITE_CLOUDINARY_CLOUD_NAME` |

Each app has `.env.example` committed; real `.env` is git-ignored. Secrets are never exposed to the frontends.

## 10. Boundaries — allowed and forbidden

**Allowed**
- Add endpoints, tables, and components that are inside the current phase and consistent with this file.
- Add small utilities and hooks without asking.
- Mock data in the frontends **only** behind `services/` until the real API is ready.

**Forbidden (ask first)**
- New libraries, new services, or changing hosting/database/auth approach.
- Calling Supabase from the browser; using Supabase Auth/Storage/Realtime.
- Storing secrets, tokens, or personal data in `localStorage`.
- Computing prices/totals/stock on the client as the source of truth.
- Raw SQL built by string concatenation; disabling Row Level Security; skipping validation.
- Changing the API contract without updating this file.
- Deleting migrations or editing applied migrations.
- Copying reference designs literally.

## 11. Known trade-offs

- Both frontends are Vite SPAs (client rendering). Product pages need good `<title>`/meta tags, structured data, and a sitemap; if SEO becomes weak, consider pre-rendering product pages later. Record that decision in `06`.
- Express runs as a long-lived Node process; it does not fit Cloudflare Workers directly. See D-001.
