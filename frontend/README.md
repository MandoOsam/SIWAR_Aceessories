# SIWAR Storefront (frontend)

Customer storefront for SIWAR — React 18 + Vite + TypeScript (strict) + Tailwind CSS.
See the repo-root `AGENTS.md` and the `context/` folder for the full project rules.

## Commands

| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Lint | `npm run lint` |
| Tests | `npm test` |

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
const { filters, query, setFilter, toggleFilter, setSort, setPage, setSearch, removeFilter, clearFilters } =
  useProductFilters();
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

## Conventions

- TypeScript strict, no `any`; one React component per file; files stay ≤ 300 lines.
- Design tokens only (`src/styles/tokens.css`) — never raw colours. Logical Tailwind utilities
  (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`) so RTL works. Light **and** dark themes both matter.
- Every data view handles loading, empty and error states.
