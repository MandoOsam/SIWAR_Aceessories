# 03 — Code Standards

Applies to `backend/`, `frontend/`, and `admin/`. If a rule here conflicts with a template's existing style (the admin starts from a template), **this file wins** and the old code is migrated gradually inside the relevant phase.

## 1. TypeScript

- `"strict": true`. **No `any`** (use `unknown` + narrowing). No `@ts-ignore` without a comment explaining why.
- Prefer `type`/`interface` colocated with the feature; share API types by copying them from the contract in `02-architecture.md`.
- Named exports (default exports only for pages and lazy-loaded components).
- Use `async/await`; never mix with `.then()` chains. Handle every rejected promise.

## 2. Style and tooling

- ESLint + Prettier in every folder. Commit only code that passes `npm run lint` and `npm run build`.
- 2 spaces, double quotes, semicolons, trailing commas, max line width 100.
- Files ≤ **300 lines**; split when bigger. One React component per file.
- Imports order: node/libs → absolute (`@/`) → relative → styles. Use the `@/` alias for `src/`.

## 3. Naming

| Thing | Style | Example |
|---|---|---|
| Files (components) | PascalCase | `ProductCard.tsx` |
| Files (other) | camelCase or kebab-case, consistent per folder | `productService.ts` |
| Variables / functions | camelCase | `getProductBySlug` |
| Types / interfaces / components | PascalCase | `OrderStatus` |
| Constants | UPPER_SNAKE_CASE | `MAX_UPLOAD_MB` |
| DB tables / columns | snake_case | `order_items.unit_price` |
| API JSON | camelCase | `oldPrice` |
| Routes | kebab-case plural nouns | `/admin/order-events` |
| Booleans | `is/has/can` prefix | `isFeatured` |

## 3.1 Comments

Write comments that explain **why**, not what. Add a short header to non-trivial modules: purpose, inputs, outputs. No author names, no commented-out code.

## 4. Backend rules

- Layering: `routes → controller → service → repository`. Controllers parse/validate and respond; services hold business rules; repositories are the only place that touches the database.
- **Every** request body, query, and param is validated by a Zod schema through the `validate` middleware.
- One central error handler. Throw typed errors (`AppError(code, status, message)`); never leak stack traces or SQL errors to clients.
- Database access only through Drizzle (parameterized). Wrap multi-step writes (order creation: stock decrement + order + items + events) in a **transaction**.
- Order creation: recompute prices, discounts, shipping and totals on the server from the DB, check stock, store **snapshots** of product name/price in `order_items`.
- Passwords: argon2. Never log passwords, cookies, tokens, or full payment proofs.
- Config via a validated `env.ts`; the app must fail to start if a required variable is missing.
- Logging with pino (structured). Log request id, user id, route, status, duration.
- Pagination is mandatory on list endpoints (default `limit=20`, max `100`).
- Tests: at least happy path + one failure path for auth, order creation, and permissions (Vitest + Supertest).

## 5. Frontend / Admin rules

- **No hard-coded strings**: all text through i18n keys (`ar.json`, `en.json`). Keys are namespaced: `shop.filters.price`.
- **No hard-coded colors**: only design tokens (CSS variables mapped in Tailwind). No inline hex.
- **RTL-safe Tailwind**: logical utilities only (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `border-s`). Flip directional icons in RTL.
- Data fetching only through `services/` (and TanStack Query / RTK Query). Components never import mock data or call `fetch` directly.
- Server state lives in the query layer; client state (cart, theme, language, sidebar) in Zustand (storefront) or Redux slices (admin).
- Forms: React Hook Form + Zod. Show field-level errors, disable submit while pending, toast on result.
- Every list/page has **loading (skeleton), empty, and error** states.
- Accessibility: semantic HTML, `alt` on images, labels on inputs, visible focus, contrast ≥ 4.5:1, keyboard navigable.
- Performance: lazy-load routes, 3D, and video; images with `loading="lazy"`, width/height, responsive `srcset` via Cloudinary transformations; respect `prefers-reduced-motion`.
- Stable React keys (ids, never random). No business logic inside JSX; extract hooks.
- Never store tokens or personal data in `localStorage` (only theme, language, cart items, recently viewed ids).

## 6. API usage rules

- Base URL from `VITE_API_URL`; every request uses `credentials: "include"` and sends `X-CSRF-Token` on mutations.
- Handle 401 (redirect to login with return URL), 403 (forbidden page), 429 (friendly message), 5xx (error state).
- Dates formatted with `Intl`/`date-fns` using the active locale; currency with `Intl.NumberFormat` (`EGP`).

## 7. Git

- Branch per phase or feature: `phase/B1-foundation`, `feat/product-gallery`.
- **Conventional commits**: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`. One logical change per commit; at least one commit per phase.
- Never commit `.env`, `node_modules`, build output, or large unoptimized media. Add `.env.example` instead.
- Never rewrite published history.

## 8. Security checklist (apply to every feature)

- Validate input; encode output; parameterized queries.
- Authorization on **every** protected route (role + ownership check: a customer can only read their own orders).
- Rate limit sensitive routes. Helmet and strict CORS (only `FRONTEND_ORIGIN` and `ADMIN_ORIGIN`).
- Uploads: allow-list MIME types and size; Cloudinary signed uploads only.
- No secrets in client bundles or logs.

## 9. Definition of done (per task)

Code compiles, lint passes, relevant tests pass, loading/empty/error states exist, works in AR + EN and dark + light (UI), works at 360 / 768 / 1280 px (UI), no TODOs left without an entry in `06-progress-tracker.md`.
