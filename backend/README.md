# SIWAR — Backend

Node 20+ · Express · TypeScript (strict) · Drizzle ORM · PostgreSQL (Supabase) · pino · Vitest + Supertest.

The single REST API for both the storefront (`frontend/`) and the admin dashboard (`admin/`). Base path: `/api/v1`. See `../context/02-architecture.md` for the stack, data model, and API contract.

## Prerequisites

- Node.js 20.6+ (uses the native `--env-file` flag)
- A PostgreSQL database (Supabase works; used only as managed Postgres)

## Local setup

```bash
cd backend
npm install
```

> If `npm install` fails with `Cannot read properties of null (reading 'edgesOut')`,
> add `--legacy-peer-deps` (npm 10.8 bug with optional peer deps).

Copy the example environment file and fill in real values:

```bash
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
```

| Variable | Required | Purpose |
|---|---|---|
| `NODE_ENV` | yes | `development` \| `test` \| `production` (default `development`) |
| `PORT` | no | HTTP port (default `3000`) |
| `DATABASE_URL` | yes | Supabase **pooled** connection string (port 6543) — app runtime |
| `DIRECT_URL` | yes | Supabase **direct** connection string (port 5432) — migrations only |
| `SESSION_SECRET` | yes | Random string, ≥ 32 chars (sessions start in B2) |
| `FRONTEND_ORIGIN` | yes | Storefront origin, for CORS |
| `ADMIN_ORIGIN` | yes | Admin origin, for CORS |
| `COOKIE_DOMAIN` | no | Session cookie domain (B2; empty in dev) |
| `CLOUDINARY_CLOUD_NAME` | yes | Cloudinary account (uploads start in B3) |
| `CLOUDINARY_API_KEY` | yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | yes | Cloudinary API secret |
| `OWNER_EMAIL` | no | Owner account created by `npm run db:seed` (B3+) |
| `OWNER_PASSWORD` | no | Password for that owner account |
| `OWNER_NAME` | no | Display name for that owner account (default `Owner`) |

The app **fails fast at startup** with a clear message if any required variable is missing or malformed (`src/config/env.ts`).

## Run the server

```bash
npm run dev        # tsx watch + --env-file=.env
# → http://localhost:3000/api/v1/health → {"data":{"status":"ok"}}
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with watch + hot reload |
| `npm run build` | Compile TypeScript to `dist/` and rewrite `@/` aliases (`tsc-alias`) |
| `npm start` | Run the compiled server: `node --env-file=.env dist/server.js` |
| `npm run lint` | ESLint |
| `npm test` | Vitest (single run) |
| `npm run test:watch` | Vitest (watch mode) |
| `npm run db:generate` | Generate a Drizzle migration from the schema |
| `npm run db:migrate` | Apply migrations (uses `DIRECT_URL`) |
| `npm run db:seed` | Create/reset the owner account, the starter catalogue and the demo content (idempotent, dev only) |
| `npm run db:push` | Push schema straight to the DB (dev only) |
| `npm run db:studio` | Open Drizzle Studio |

## Tests

Tests are Vitest + Supertest. The health test runs fully in-process. The auth
tests use a **real throwaway PostgreSQL** configured in `.env.test`
(git-ignored) — no mocking of the repository layer.

Start a disposable test database:

```bash
docker run -d --name siwar-test-pg -e POSTGRES_PASSWORD=test \
  -e POSTGRES_USER=test -e POSTGRES_DB=siwar_test -p 5433:5432 postgres:17-alpine
```

Create `backend/.env.test` (copy the values from `.env.example`, then set):

```
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5433/siwar_test
DIRECT_URL=postgresql://test:test@localhost:5433/siwar_test
```

Then run:

```bash
npm test
```

Migrations are applied automatically by the test setup (`tests/db.ts`) and each
test starts from empty tables. Test files run **one after another**
(`fileParallelism: false` in `vitest.config.ts`) because they share that single
database.

### Argon2 on Windows

Passwords are hashed with Argon2id through `@node-rs/argon2`, which loads a
prebuilt **native** binary. Some managed Windows machines run a code-integrity
policy that blocks unsigned native modules, and the API then fails to boot with
`Cannot find native binding`. The package `@node-rs/argon2-wasm32-wasi` is
therefore installed as an **optional dependency**: the same library ships a WASM
build, and `@node-rs/argon2` falls back to it automatically when the native
binary cannot be loaded. On Linux (Render) the native binding is used and the
WASM build is never touched.

## Auth endpoints

Base path `/api/v1`. Every mutating request needs the `Origin` header and an
`X-CSRF-Token` header matching the `siwar_csrf` cookie from `GET /auth/csrf`.

| Method & path | Cookie | Purpose |
|---|---|---|
| `GET /auth/csrf` | sets `siwar_csrf` | issues the CSRF token |
| `POST /auth/register` | sets `siwar_sid` | create a customer account |
| `POST /auth/login` | sets `siwar_sid` | customer login |
| `POST /auth/logout` | clears `siwar_sid` | end the customer session |
| `GET /auth/me` | `siwar_sid` | current customer |
| `POST /admin/auth/login` | sets `siwar_admin_sid` | staff login (staff role required) |
| `POST /admin/auth/logout` | clears `siwar_admin_sid` | end the staff session |
| `GET /admin/auth/me` | `siwar_admin_sid` | current staff user |

The two session cookies are separate and the session `kind` must match the
cookie it arrives on, so a customer session can never open an admin route
(02-architecture §5).

## Catalogue endpoints (public)

Read-only. No cookie and no CSRF needed.

| Method & path | Response |
|---|---|
| `GET /categories` | `{ data: Category[] }`, active categories ordered by `sortOrder` |
| `GET /categories/:slug` | `{ data: Category \| null }` — **200 with `null`** when it does not exist |
| `GET /products` | `{ data: Product[], total, page, limit }`, active products only |
| `GET /products/:slug` | `{ data: { product, matching, related } \| null }` — **200 with `null`** when it does not exist |

`GET /products` accepts `category` (slug), `minPrice`, `maxPrice`, `inStock`,
`color` (`gold \| silver \| rose-gold \| black`), `size`, `discount`, `isNew`,
`search`, `sort` (`newest \| best-selling \| price-asc \| price-desc \| rating`),
`page` and `limit` (default 20, max 100). `rating` is accepted but ignored until
reviews ship in B6; `sort=rating` falls back to best sellers. An unknown
`category` returns an empty page, not a 404. Money is returned as a JSON number.

## Admin catalogue endpoints

Staff session (`siwar_admin_sid`) + permission + CSRF (`Origin` header and
`X-CSRF-Token`). Reads need `products:read`; every write needs `products:write`
(categories live in the catalogue, so they share the product permissions).
Listings include drafts and inactive rows; `slug` and `sku` are derived from the
English name when omitted, and a compare-at `oldPrice` fills `discountPercent`.

| Method & path | Purpose |
|---|---|
| `GET /admin/categories?search=&isActive=` | `{ data: AdminCategory[] }`, each with `productCount` |
| `POST /admin/categories` | 201, body: `name`, optional `slug`, `description`, `imageUrl`, `parentId`, `sortOrder`, `isActive`, `seo` |
| `PATCH /admin/categories/:id` | partial update; 409 if the new slug is taken; 400 on a parent loop |
| `DELETE /admin/categories/:id` | 204; 409 while the category still has products |
| `GET /admin/products?status=&category=&search=&sort=&page=&limit=` | `{ data: AdminProduct[], total, page, limit }` |
| `GET /admin/products/:id` | `{ data: AdminProduct }`; 404 when missing |
| `POST /admin/products` | 201, body: `name`, `description`, `categoryId`, `price`, optional `slug`/`sku`/`oldPrice`/`stock`/`status`/`colors`/`sizes`/`images`/… |
| `PATCH /admin/products/:id` | partial update; sending `images` replaces the whole gallery (`[]` clears it) |
| `DELETE /admin/products/:id` | 204; the gallery is removed by the cascade |

Errors follow the contract: `400 VALIDATION_ERROR` (bad input),
`404 NOT_FOUND`, `409 CONFLICT` (slug/SKU duplicate, category still in use),
`422 UNPROCESSABLE_ENTITY` (unknown category/parent), `403` for a role without
the permission.

## Upload signatures

`POST /admin/uploads/sign` (staff + `products:write`, CSRF, rate limited to
30 requests / 10 min) returns the parameters for a direct browser → Cloudinary
upload: `signature`, `timestamp`, `apiKey`, `cloudName`, `folder`, `uploadUrl`,
`maxBytes` (5 MB) and `allowedFormats` (`jpg`, `jpeg`, `png`, `webp`). Body:
`{ "scope": "product" | "category" | "content" }` (default `product`), which
selects `siwar/products`, `siwar/categories` or `siwar/content`. The API secret
never leaves the server, and a signature is bound to its folder. The admin app
posts the file plus these fields to `uploadUrl`; Cloudinary answers with the
secure URL that is stored in `product_images.url` / `categories.image_url`.

## Content and settings endpoints

Public, no cookie or CSRF needed:

| Method & path | Response |
|---|---|
| `GET /content/home` | `{ data: { hero, story, featuredCollections } }`; 404 when the hero/story blocks are not seeded |
| `GET /content/pages` | `{ data: StaticPage[] }` ordered by slug (feeds the footer sitemap) |
| `GET /content/pages/:slug` | `{ data: StaticPage \| null }` — **200 with `null`** when it does not exist |
| `GET /settings/public` | `{ data: StoreSettings }` with `storeName`, `currency`, `shipping`, **enabled** `paymentMethods`, `trustBadges`, `social`, `contact`; `seo` is never exposed |

Home is composed from `content_blocks` rows: `hero`, `story` and one
`featured:<id>` per featured collection (ordered by `sortOrder`, inactive rows
skipped). The `<id>` in the key becomes the collection `id` in the response, so
editing a key keeps the collection stable. Known keys are validated with a
strict schema; other keys (e.g. `banner:1`) must be a JSON object.

Admin (`content:write` for content/pages, `settings:write` for settings; both
need the staff session, writes also need CSRF):

| Method & path | Purpose |
|---|---|
| `GET /admin/content` | `{ data: AdminContentBlock[] }`, inactive included |
| `GET /admin/content/:key` | one block; 404 when missing |
| `PUT /admin/content/:key` | **upsert** (201 created / 200 updated), body: `data`, optional `sortOrder`, `isActive` |
| `DELETE /admin/content/:key` | 204 |
| `GET /admin/pages`, `GET /admin/pages/:slug` | page list / one page |
| `PUT /admin/pages/:slug` | upsert, body: `title`, `body` (both `{ ar, en }`) |
| `DELETE /admin/pages/:slug` | 204 |
| `GET /admin/settings` | the singleton including `seo` and disabled payment methods |
| `PATCH /admin/settings` | partial update; at least one field required |

The store settings table holds one row (created by `npm run db:seed`); the admin
API never creates a second one. `PATCH /admin/settings` answers 404 before the
row exists.

## Orders and coupons endpoints

Checkout is public (guests allowed), but both mutations need the CSRF token:
call `GET /auth/csrf` first and send `x-csrf-token` plus the `siwar_csrf` cookie.

| Method & path | Response |
|---|---|
| `POST /orders` | 201 `{ data: { id, number, total } }`; body: `customer` (`name`, `phone`, `email?`), `address` (`governorate`, `city`, `street`, `building?`, `apartment?`, `notes?`), `deliveryOptionId` (`standard` \| `express`), `paymentMethod` (`cod` \| `instapay` \| `vodafone-cash`), `paymentProofUrl?`, `items` (`productId`, `variant`, `qty`), `couponCode?` |
| `GET /orders/track?number=&phone=` | `{ data: Order \| null }` — **200 with `null`** when number + phone do not match |
| `GET /orders/:id` | `{ data: Order \| null }` for the success page (UUID) |
| `POST /coupons/validate` | always 200: `{ valid: true, code, type, value, discount, freeShipping?, maxDiscount? }` or `{ valid: false, error: "invalid" \| "min-order" }` (rate limited) |

Totals are always recomputed server-side: lines are re-priced from the database,
duplicate lines merged, stock checked and decremented, and the coupon row locked
(`FOR UPDATE`) before `used_count` is incremented. Order numbers come from the
`order_number_seq` sequence (`SW-10025` onward). `standard` shipping uses
`store_settings.shipping.defaultFee` and becomes free at `freeAbove`; `express`
uses `expressFee` and falls back to `defaultFee` when unset.

Admin (`orders:read` / `orders:write`, staff session, CSRF on writes):

| Method & path | Purpose |
|---|---|
| `GET /admin/orders?status=&paymentStatus=&search=&page=&limit=` | `{ data: Order[], total, page, limit }`; search matches number, phone or customer name |
| `GET /admin/orders/:id` | one order with its items and full timeline |
| `PATCH /admin/orders/:id/status` | body `{ status, note? }`; validated transitions, 409 on an invalid move, appends an `order_events` row |
| `PATCH /admin/orders/:id/payment` | body `{ paymentStatus, note? }`; manual confirmation, idempotent when unchanged |

Status path: `pending → confirmed → processing → shipped → out_for_delivery →
delivered`, with `cancelled` allowed before processing and `returned → refunded`
after delivery. Cancelling or returning does not restock yet.

## Seed the database

```bash
npm run db:seed     # idempotent: 5 categories + 14 demo products + content + settings + 3 coupons
```

It reads `OWNER_EMAIL`, `OWNER_PASSWORD` and `OWNER_NAME` from `.env` and fails
with a clear message when the first two are missing. Products and categories are
matched by `slug`, so running it again updates the demo rows in place; it never
deletes rows created by hand. Product images point at the storefront placeholders
(`/assets/placeholder/product-<tone>.svg`); replace them with Cloudinary URLs via
`PATCH /admin/products/:id` once the admin panel uploads real photos.

Content is seeded only when missing: `hero`, `story` and two `featured:<id>`
blocks, the seven static pages (`about`, `contact`, `faq`, `shipping`, `returns`,
`privacy`, `terms`) and the settings singleton. Dashboard edits are never
overwritten by a later seed run. Coupons `SIWAR10` (10%), `WELCOME50` (EGP 50 off
over 300) and `FREESHIP` are inserted by code, and a settings row created before
B5 gets `shipping.expressFee` backfilled without touching other fields.

## Deploy to Render

The backend is an Express long-lived Node process (D-001). On Render, create a **Web Service** from this repo and set:

| Setting | Value |
|---|---|
| **Root Directory** | `backend` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Environment** | Node |
| **Health Check Path** | `/api/v1/health` |

`npm run build` compiles `src/` → `dist/` (tests excluded) and rewrites the `@/` import aliases.
`npm start` runs the compiled `dist/server.js`.

### Environment variables to add in Render's dashboard

Add every variable below (values are the real ones — never commit them):

```
NODE_ENV=production
PORT=3000
DATABASE_URL=<supabase pooled connection string, port 6543>
DIRECT_URL=<supabase direct connection string, port 5432>
SESSION_SECRET=<random string, >= 32 chars>
FRONTEND_ORIGIN=<storefront URL, e.g. https://siwar.example>
ADMIN_ORIGIN=<admin URL, e.g. https://admin.siwar.example>
COOKIE_DOMAIN=<cookie domain, e.g. .siwar.example>
CLOUDINARY_CLOUD_NAME=<cloudinary cloud name>
CLOUDINARY_API_KEY=<cloudinary api key>
CLOUDINARY_API_SECRET=<cloudinary api secret>
```

Note: `--env-file=.env` in `npm start` is harmless on Render — the platform injects variables into `process.env` directly, and the file simply does not exist there.

## Layout

```
backend/src/
  app.ts  server.ts            # app factory (testable) + listener
  config/env.ts                # Zod-validated environment
  db/                          # client.ts, schema/, migrations/, seed/
  modules/<feature>/           # routes.ts, controller.ts, service.ts, repository.ts, schema.ts, types.ts
  middlewares/                 # errorHandler, auth, requireRole, validate, rateLimit, csrf
  lib/                         # logger.ts, cloudinary.ts, mailer.ts
  utils/
```

Layering: `routes → controller → service → repository`. Only repositories touch the database. See `../context/03-code-standards.md`.
