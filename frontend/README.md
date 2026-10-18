# SIWAR Storefront (frontend)

Customer storefront for SIWAR — React 18 + Vite + TypeScript (strict) + Tailwind CSS.
See the repo-root `AGENTS.md` and the `context/` folder for the full project rules.

## Commands

| Task             | Command         |
| ---------------- | --------------- |
| Dev server       | `npm run dev`   |
| Production build | `npm run build` |
| Lint             | `npm run lint`  |
| Tests            | `npm test`      |

## Storefront overview

Every customer route lives in `src/app/AppRoutes.tsx` and is lazy-loaded with `React.lazy` +
`Suspense`.

| Area | Routes |
| --- | --- |
| Home | `/` |
| Catalogue | `/shop`, `/category/:slug`, `/search?q=…` |
| Product | `/products/:slug` |
| Cart & checkout | `/cart`, `/checkout`, `/order/success/:id`, `/track-order` |
| Auth | `/login`, `/register`, `/forgot-password`, `/reset-password/:token` |
| Account (protected) | `/account`, `/account/orders`, `/account/orders/:id`, `/account/wishlist`, `/account/addresses`, `/account/notifications`, `/account/profile`, `/account/password`, `/wishlist` |
| Static | `/about`, `/contact`, `/faq`, `/shipping`, `/returns`, `/privacy`, `/terms` |
| Fallback | any unknown URL → `NotFoundPage` (404) |

## Architecture

- **Routing** — `src/app/AppRoutes.tsx` owns every route; `src/App.tsx` only mounts providers. Routes
  are code-split, and the account group is wrapped in `src/components/ProtectedRoute.tsx`, which
  redirects to `/login?redirect=<path>` when signed out.
- **Data layer** — components never call `fetch` or import `src/data/` directly. Everything goes
  through `src/services/` (re-exported from `api.ts`), which answers the `02-architecture.md`
  contract from the mock adapter until `VITE_API_URL` is set. TanStack Query owns server state.
- **Client state** — Zustand stores in `src/store/`: cart, wishlist, notifications, auth,
  recently-viewed, UI overlays and the toast queue. Catalogue filters / sort / page live **only** in
  the query string (`useProductFilters`), never in a store.
- **SEO** — `hooks/useDocumentMeta.ts` sets the per-page `<title>`, meta description, canonical link
  and Open Graph tags.

## Adding a new page

1. Add the page under `src/pages/` (one component per file, ≤ 300 lines) and register it as a lazy
   route in `src/app/AppRoutes.tsx`; add its path to `ROUTES` in `src/config/app.ts`.
2. Fetch data through a `src/services/` function exposed by a `src/hooks/` query — never `fetch` in
   the component.
3. Call `useDocumentMeta(title, description, …)` for per-page SEO, and translate every string with
   `t("…")` — add the keys to **both** `src/locales/en.json` and `src/locales/ar.json` (they must
   stay key-for-key in sync).
4. Handle loading, empty and error states. If the page needs a session, put it inside the
   `ProtectedRoute` account group.

## Switching from the mock layer to the real API

The storefront runs entirely on **mock data** (`src/data/` via `src/services/mockAdapter.ts`) until
the backend phases land (B1 to B8). Setting `VITE_API_URL` switches the whole app to the real API —
`src/config/env.ts` exposes it as `API_BASE_URL` and `IS_MOCK_MODE` becomes `false` — and
`src/services/http.ts` then calls the real endpoints. No component changes are needed.

```bash
# frontend/.env
VITE_API_URL=https://api.example.com/api/v1
```

Until then, auth, orders, addresses, notifications and all catalogue content are local mocks.

## Catalogue pages (F3)

- `/shop` — full catalogue (`src/pages/ShopPage.tsx`)
- `/category/:slug` — one category (`src/pages/CategoryPage.tsx`)
- `/search?q=…` — search (`src/pages/SearchPage.tsx`)

All three share `src/components/ProductListLayout.tsx`, which owns the filtering, sorting,
active-filter chips, the results counter and the skeleton / empty / error states. The pages only
supply a header slot and the SEO strings.

## How URL state works

Catalogue state lives **entirely in the query string**, never in a store, so a refresh keeps the
filters and the browser back button restores the previous view. The single entry point is the
`useProductFilters` hook (`src/hooks/useProductFilters.ts`):

```ts
const {
  filters,
  query,
  setFilter,
  toggleFilter,
  setSort,
  setPage,
  setSearch,
  removeFilter,
  clearFilters,
} = useProductFilters();
const products = useProducts(query); // query is ready for the service layer
```

The hook is built from pure functions that are all unit-tested (`useProductFilters.test.ts`):

- `parseProductFilters(params, options)` — reads the URL, dropping anything invalid so a bad link
  never throws.
- `serializeProductFilters(state, options)` — writes the URL, omitting defaults so links stay short.
- `toProductQuery(state)` — maps the state to the `GET /products` query.

Query-string keys are centralised in `FILTER_PARAM` (never hard-code a key). Documented shape:

```
/shop?category=rings&minPrice=200&maxPrice=800&rating=4&inStock=true&color=gold&size=8&discount=true&isNew=true&sort=price-asc&page=2
/search?q=ring
```

`ProductListLayout` runs the hook with `manageCategory: false` on `/category/:slug`, so `category`
is never read from or written to the query string — the slug comes from the URL path instead.

## How to add a new filter

Work through the layers in this order (change the contract first):

1. **Contract** — `src/services/types.ts`: add the field to `ProductQuery` and, for enums, add the
   allowed values (e.g. the `PRODUCT_COLORS` / `CATEGORY_SLUGS` pattern).
2. **Service** — `src/services/catalogService.ts`: apply the filter when building the product list.
3. **URL state** — `src/hooks/useProductFilters.ts`:
   - add the key to `FILTER_PARAM`;
   - add the field to `ProductFilterState`;
   - read it in `parseProductFilters` (validate, drop invalid) and write it in
     `serializeProductFilters` (omit the default);
   - pass it through in `toProductQuery`.
     Add unit tests to `useProductFilters.test.ts`.
4. **UI** — render the control in `src/components/FilterPanel.tsx` (reuse the `components/filters/`
   helpers). It is shared by the desktop sidebar and the mobile `FilterSheet`, so a single edit
   covers both.
5. **Active-state chips** — add a removable chip in `src/components/ActiveFilterChips.tsx`, and
   include the new filter in the active count in `src/components/FilterSheet.tsx`.
6. **i18n** — add keys to **both** `src/locales/en.json` and `src/locales/ar.json`
   (they must stay key-for-key in sync). No hard-coded strings in components.

Colour and size are single-select per decision D-022 (multi-select is deferred).

## Product page (F4)

- `/products/:slug` — one product (`src/pages/ProductPage.tsx`), lazily loaded by the router.

`ProductPage` assembles the gallery with the info column (rating, price, description, stock), the
variant selector, quantity stepper, the add-to-cart / buy-now / wishlist / share actions, the
material block and a shipping / returns / material accordion. Below that it renders the reviews
section and the matching / related / recently-viewed rails.

The selected colour, size and quantity are **page-local state**, held in `ProductPage` and passed
down as props (no store, D-030); the selection resets cleanly when the slug changes. The mobile
sticky add-to-cart bar appears once the actions block scrolls out of view, driven by an
`IntersectionObserver` rather than a scroll listener. Toasts render through a single
`ToastViewport` mounted on this page.

Below-the-fold sections (`Accordion`, `ProductReviews`, `MatchingProducts`, `RelatedProducts`,
`RecentlyViewedProducts`) are code-split with `React.lazy` + `Suspense` (D-039), keeping
framer-motion and zod off the critical path. The page sets its own `<title>`, meta description and
Open Graph tags in a cleanup-safe effect (D-040); JSON-LD is deferred to F7.

## Cart and Checkout (F5)

- `/cart` — cart page (`src/pages/CartPage.tsx`) plus a slide-over drawer
  (`src/components/CartDrawer.tsx`). The drawer mounts once in `RootLayout`, opens from the navbar
  cart button (`uiStore` overlay `"cart"`), traps focus, restores it on close, and closes on
  Escape / backdrop. Lines can be moved to a persisted "save for later" list in the same
  `src/store/cartStore.ts`.
- `/checkout` — five-step guest flow (customer, address, delivery, payment, review) in
  `src/pages/CheckoutPage.tsx`. The form state is controlled there; each step validates with Zod
  (`components/checkout/checkoutSchemas.ts`). Only enabled payment methods are shown, and the
  transfer proof is a plain URL input for now (real upload lands in F6).
- `/order/success/:id` — order number, total, estimated delivery and the fulfilment timeline
  (`src/components/OrderTimeline.tsx`); the cart is cleared on mount. `/track-order` looks an order
  up by number + phone and is prefilled from `?number=`.
- Mock orders persist to `localStorage` (`siwar.mock.orders`) so success and tracking survive a
  refresh before the real API exists. `createOrder` in `src/services/checkoutService.ts` recomputes
  subtotal, shipping and coupon discount on the service side — the server is the source of truth.
- Empty, loading and error states exist throughout; the currency is always EGP with locale-aware
  formatting. RTL, dark/light and `prefers-reduced-motion` are respected.

## Auth and Account (F6)

- Auth pages live in `src/pages/auth/` (`/login`, `/register`, `/forgot-password`,
  `/reset-password/:token`). The mock session is owned by `src/services/authService.ts` and the
  signed-in user is cached in `src/store/auth.ts`, hydrated once per boot by
  `hooks/useAuthBootstrap.ts`. Nothing personal is persisted (D-046).
- `/account/*` is a single protected route group. `src/components/ProtectedRoute.tsx` shows a
  skeleton while the session restores, then redirects to `/login?redirect=<path>` when signed out.
  `src/pages/account/AccountLayout.tsx` renders the sidebar (desktop) / toggle (mobile), the logout
  action and the `<Outlet/>`; active links get `aria-current` from `NavLink`.
- Account areas: dashboard (real order/address counts + store counts), profile, password, orders
  (`OrdersPage` + `OrderDetailsPage` with timeline, reorder, cancel / return and a print invoice),
  wishlist, addresses (CRUD with the reusable `AddressForm`) and notifications. `accountService.ts`
  owns profile, addresses and notifications; the mock order store lives in `services/mockOrderStore.ts`
  and is re-exported through `accountService`/`api`. `/wishlist` is an alias inside the account group.
- Client stores: `src/store/wishlist.ts` (product ids) and `src/store/notifications.ts` (seeded from
  `src/data/notifications.ts`) both persist to `localStorage`; the navbar shows cart and unread
  notification count badges, and the wishlist/notifications are **not** cleared on logout.
- Forms use Zod + controlled state (D-035), translate field messages at render via `fieldError`,
  focus the first invalid field, and announce errors with `role="alert"`.

## Conventions

- TypeScript strict, no `any`; one React component per file; files stay ≤ 300 lines.
- Design tokens only (`src/styles/tokens.css`) — never raw colours. Logical Tailwind utilities
  (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`) so RTL works. Light **and** dark themes both matter.
- Every data view handles loading, empty and error states.
