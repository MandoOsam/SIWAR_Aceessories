# 07 — Storefront Audit & Clean Code Verification

> Context file 07. Read AGENTS.md first, then 06, 04, 02, 03, 05, then this.
> This file defines the storefront audit that runs AFTER F7 and BEFORE B1.
> It is NOT a new roadmap phase. It is a verification pass.
> Priority when files disagree: AGENTS.md > 04 > 02 > 03 > 01 > 05 > 07.
> 06 is state, not rules.
> Owner: Mando. Default mode: BUILD (find and fix).

## 0. Reading order and prerequisites

Read in this order:
1. AGENTS.md
2. context/06-progress-tracker.md
3. context/04-ai-workflow-rules.md
4. context/02-architecture.md
5. context/03-code-standards.md
6. context/05-ui-context.md
7. This file (07)

Prerequisites that MUST be true:
- F7 is marked [x] in 06.
- git status is clean on the audit branch.
- npm run build, npm run lint, npm test all pass locally.
- The owner created feature/storefront-audit.

If any prerequisite fails, STOP and report before doing anything else.

## 1. Scope and non-goals

### 1.1 In scope (this audit covers)
- The customer storefront only: frontend/.
- Code quality, types, ESLint, tests, build.
- Component structure, separation of concerns, state, API layer.
- Routing, navigation, forms, loading/empty/error states.
- Responsive, RTL/LTR, dark/light, accessibility.
- Security of the browser bundle (no secrets, no unsafe HTML, safe storage).
- Performance (images, chunks, Lighthouse mobile).
- i18n parity, untranslated keys, formatting.

### 1.2 Out of scope (do NOT touch)
- backend/ and admin/ folders.
- Changing the API contract in 02-architecture.md.
- Adding new libraries.
- Adding new features (new pages, new components, new flows).
- Replacing mock data with real APIs (that's B1 to B8).
- Changing auth from mock to real (that's B2).

If you find an out-of-scope issue, log it in 06 Known issues with a target phase.

## 2. The four audit sections

The audit runs in 4 sections. Each section is a self-contained pass
with its own checks, fixes, commit, and tracker update.
Do them in order, one at a time, and stop after each.

| # | Section | Purpose |
|---|---|---|
| A1 | Static checks & code structure | Prove the codebase is clean at the compiler, lint, test, build, and structure levels |
| A2 | UX, routing, i18n & responsive | Prove every page, flow, language, theme, and breakpoint behaves correctly |
| A3 | Security, accessibility & performance | Prove the storefront is safe, accessible, and fast on mobile |
| A4 | Final verification & sign-off | Re-run everything, produce the audit report, update the tracker |

---

## Section A1 — Static checks & code structure

### A1.1 Static checks (run first, always)

Run and paste the raw output for each:

| Check | Command | Pass criteria |
|---|---|---|
| TypeScript | npx tsc --noEmit | no errors |
| ESLint | npm run lint | no errors, no warnings |
| Unit tests | npm test | all green |
| Production build | npm run build | no errors, no warnings |
| Dep vulnerabilities | npm audit --omit=dev | no critical, no high |

Fix every failure. Show the file + line, the fix, and the re-run result.

### A1.2 Component structure

- No file > 300 lines. Find them:
  find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -30
- Split oversized files. Keep each split into a focused module.
- Every component has one clear responsibility.
- No god components that fetch, transform, and render at once.
- No dead files. Find orphan files by searching for imports.
- No commented-out code blocks longer than 3 lines.
- No leftover TODO: without a matching entry in 06 Known issues.

### A1.3 Separation of concerns

- pages/, sections/, components/ do NOT import from services/ directly.
  They use hooks or TanStack Query only.
- No fetch() inside components. Everything goes through src/services/.
- No URL construction inside components.
- No direct localStorage access from components.
- Business rules live in hooks/ or services/, never in JSX.

### A1.4 State management

- Server state lives in TanStack Query only.
- Client state lives in Zustand stores: cart, wishlist, auth,
  notifications, recentlyViewed, ui.
- Page-local state lives in useState / React Hook Form.
- URL-driven state lives in useProductFilters only. Not in Zustand.
- No duplicated state between Zustand and TanStack Query.
- No state that should be in the URL but isn't.

### A1.5 API layer

- All network calls go through src/services/.
- Every service function is typed (no any in signatures or returns).
- Every service has a mock path AND a real-path placeholder.
  The real path reads VITE_API_URL via src/services/http.ts.
- No URL is built by concatenating user input.
- Error responses follow 02-architecture.md section 4.

### A1.6 Types

- No any in the codebase:
  grep -rn "\bany\b" src --include="*.ts" --include="*.tsx"
- No @ts-ignore or @ts-expect-error without a comment explaining why.
- No duplicated type declarations.
- API types match 02-architecture.md section 6 exactly.
- Bilingual fields are typed as L10n = { ar: string; en: string }.

### A1.7 Configuration

- All env vars read through src/config/app.ts.
- VITE_API_URL is the only API-related var exposed to the browser.
- No secrets in the browser bundle:
  grep -rn "SECRET\|PRIVATE_KEY\|TOKEN" src/ .env*
- .env.example documents every var actually used.

### A1.8 Code duplication

- One price formatter (used everywhere).
- One date formatter (used everywhere).
- One currency formatter (EGP).
- One useDebounce / useDebouncedValue.
- One useMediaQuery.
- One useDocumentMeta.
- Shared skeleton / empty / error components are reused.

### A1.9 Dependencies

- No unused packages. Verify with npx depcheck (only if owner approves).
- No two packages doing the same job.
- No vulnerable packages (see A1.1 npm audit).
- Every dependency is justified in 06 Decisions log.

### A1.10 What to fix in A1
- All static-check failures.
- All files > 300 lines.
- All dead files, dead imports, dead TODOs.
- All any, @ts-ignore, unsafe casts.
- All secret-like strings in the client.
- All duplications listed above.

### A1.11 What to defer in A1
- Anything that requires a new library.
- Anything that changes the API contract.
- Anything that touches backend/ or admin/.
- Anything that changes a working behavior in F1 to F7 without a clear bug.

### A1.12 A1 commit
git add frontend/src frontend/package.json context/06-progress-tracker.md
git commit -m "chore(audit): A1 static checks and code structure"

### A1.13 A1 report format
Use the standard Phase Report from 04-ai-workflow-rules.md section 9, plus:

**Audit section:** A1 — Static checks & code structure
**Checks run:** (list each with pass/fail)
**Issues found:** (table: file | line | issue | severity | fixed?)
**Fixes applied:** (file -> what changed)
**Deferred to Known issues:** (issue -> target phase)
**Decisions needed from you:** (if any)
**Next section:** A2 — UX, routing, i18n & responsive

STOP after the report. Wait for approval.


---

## Section A2 — UX, routing, i18n & responsive

### A2.1 Routing & navigation

For every route in 05-ui-context.md section 7:
- The route opens from a direct URL.
- The route is lazy-loaded (React.lazy + Suspense).
- The route has a fallback while loading.
- Back/forward buttons work.
- Refreshing the page does NOT break the route.
  If hosting on Cloudflare Pages, public/_redirects must contain
  /* /index.html 200
- Unknown routes render the 404 page.
- Protected routes redirect to /login?redirect=...
- After login, the user is returned to the requested route.

Routes to verify:
/, /shop, /category/:slug, /products/:slug, /search?q=,
/cart, /checkout, /order/success/:id, /track-order,
/login, /register, /forgot-password, /reset-password/:token,
/account, /account/orders, /account/orders/:id, /account/wishlist,
/wishlist, /account/addresses, /account/notifications,
/account/profile, /account/password,
/about, /contact, /faq, /shipping, /returns, /privacy, /terms,
/404

### A2.2 Interactions & data

- Every form validates required fields with Zod.
- Success and error messages are translated and visible.
- Every list has loading (skeleton), empty, and error states.
  Verify: shop, category, search, product, cart, checkout,
  order success, track order, account/*, static pages.
- No decorative buttons without a real action.
- Optimistic updates roll back on failure (cart, wishlist).
- Quantity steppers enforce 1 <= qty <= stock.
- Coupons validate: SIWAR10, WELCOME50, FREESHIP.
- Checkout totals are computed by the service layer, not the client.
- Placing an order clears the cart.
- Recently viewed updates on product page mount.
- Wishlist heart state is in sync across all pages.
- Cart badge count is correct everywhere.

### A2.3 Design & devices

- Test every page at 360 / 768 / 1280 px.
- No horizontal scroll:
  document.documentElement.scrollWidth <= window.innerWidth
- Text and images do not overlap.
- Modals, drawers, and bottom sheets open and close correctly.
- FilterSheet closes on drag, backdrop tap, and Escape.
- CartDrawer same.
- Mobile sticky add-to-cart appears and disappears correctly.
- Dropdowns, accordions, tabs work on touch.

### A2.4 RTL / LTR & themes

- Every page works in Arabic (RTL) and English (LTR).
- Every page works in dark and light.
- Long Arabic text does not overflow buttons or cards.
- Directional icons flip correctly in RTL.
- Sliders, chips, pagination mirror correctly in RTL.

### A2.5 i18n

- ar.json and en.json have identical key sets.
  Compare: jq -S 'paths | join(".")' src/locales/ar.json | sort
  vs the same for en.json.
- No visible string is hard-coded.
  Check: grep -rn '">[A-Za-z\u0600-\u06FF]' src/components src/pages src/sections
- No raw keys appear in the UI (t("...") always resolves).
- Currency is EGP everywhere, via Intl.NumberFormat.
- Dates are formatted per locale.
- Product names/descriptions show the active language.
- Seeded reviews do NOT show a Verified purchase badge.

### A2.6 Console hygiene

- No console.log in src/:
  grep -rn "console\." src
- No React warnings in DevTools console.
- No network 404s for images, fonts, or JSON.

### A2.7 What to fix in A2
- Broken routes, dead links, missing lazy-loading.
- Missing loading/empty/error states.
- Hard-coded strings, untranslated keys.
- RTL/LTR bugs, dark/light bugs.
- Layout bugs at 360/768/1280.
- Console errors and logs.

### A2.8 What to defer in A2
- Non-blocking UX improvements that need new components.
- Anything that requires a new library.
- Anything that touches backend/ or admin/.

### A2.9 A2 commit
git add frontend/src frontend/public frontend/index.html context/06-progress-tracker.md
git commit -m "chore(audit): A2 UX, routing, i18n and responsive"

### A2.10 A2 report format
Same as A1.13. Add a table of pages x (AR/EN x dark/light x 360/768/1280)
with pass/fail per page. STOP and wait for approval.



---

## Section A3 — Security, accessibility & performance

### A3.1 Security (client bundle)

- No secret in the browser bundle:
  grep -rn "VITE_.*SECRET\|VITE_.*KEY\|VITE_.*TOKEN" src/ .env*
- No sensitive data in localStorage. Allowed keys only:
  theme, language, siwar.cart, siwar.wishlist,
  siwar.recentlyViewed, siwar.notifications,
  siwar.mock.user, siwar.mock.auth, siwar.mock.orders,
  siwar.mock.addresses, siwar.recentSearches.
- No password, token, or full user object in localStorage.
- Every user input is validated with Zod before use.
- No dangerouslySetInnerHTML:
  grep -rn "dangerouslySetInnerHTML" src
- No eval, Function(), new Function.
- External links with target="_blank" use rel="noopener noreferrer".
- No inline <script> in index.html except Vite's entry.
- No source maps published in the production build.
- Security headers (CSP, X-Frame-Options, Referrer-Policy, HSTS)
  are configured at the host. If not in the repo, log as Known issue.

### A3.2 Accessibility

For every page:
- Full keyboard navigation (Tab, Shift+Tab, Enter, Space, Escape, Arrows).
- Visible focus rings on all interactive elements.
- Every form input has a label or aria-label.
- Every image has meaningful alt (or alt="" if decorative).
- Contrast >= 4.5:1 for body text, >= 3:1 for large text, both themes.
- Single h1 per page, no skipped heading levels.
- Navigation uses <a>/<Link>, actions use <button>.
- aria-live for counters, toasts, form errors.
- Skip-to-content link works.
- Focus is trapped in modals/drawers and restored on close.
- prefers-reduced-motion respected on all animated elements.
- The home 3D scene has a static fallback.

Run Lighthouse Accessibility on:
/, /shop, /products/:slug, /cart, /checkout, /login, /account.
Each must score >= 90.

### A3.3 Performance

#### Images
- loading="lazy" on all below-the-fold images.
- Every <img> has width and height.
- Responsive images use srcset where applicable.
- The hero video is muted, playsInline, preload="metadata", has a poster.

#### JavaScript bundle
- Every route is lazy-loaded.
- The 3D chunk (MiniRing) is separate and only loads on /.
- No duplicated Three.js / gsap / framer-motion across chunks.
- manualChunks configured in vite.config.ts to split vendors.

#### Rendering
- No unnecessary re-render on scroll.
- Animations use transform / opacity.
- Heavy lists use windowing if > 50 items (ask first).

#### Lighthouse mobile
Target on /, /shop, /products/:slug, /cart, /login:
- Performance >= 80
- Accessibility >= 90
- Best practices >= 90
- SEO >= 90

Report scores per page.

### A3.4 What to fix in A3
- Any client-side secret or unsafe HTML.
- Any accessibility failure.
- Any performance regression fixable without a new library.
- Any missing lazy-loading.

### A3.5 What to defer in A3
- Anything requiring a new library.
- Server-side security (comes in B2 to B8).
- Host-level headers if the host config is not in the repo.

### A3.6 A3 commit
git add frontend/src frontend/public frontend/vite.config.ts frontend/index.html context/06-progress-tracker.md
git commit -m "chore(audit): A3 security, accessibility and performance"

### A3.7 A3 report format
Same as A1.13. Add a Lighthouse scores table (page x 4 metrics).
STOP and wait for approval.

---

## Section A4 — Final verification & sign-off

### A4.1 End-to-end flow verification

Verify these flows work end to end (report each as pass/fail):
1. Home -> Shop -> Product -> Add to cart -> Cart -> Checkout -> Order -> Track.
2. Register -> Login -> Account -> Orders -> Wishlist -> Addresses -> Logout.
3. Search: autocomplete, results, no results.
4. Filters: 8 filters + 5 sort options + pagination in /shop,
   /category, /search.
5. Static pages: About, Contact, FAQ, Shipping, Returns, Privacy, Terms.
6. 404: any unknown URL.

### A4.2 Cross-storefront consistency

- Every page has a unique <title>.
- Every page has a meta description.
- Cart badge count is correct on every page.
- Wishlist state syncs across pages.
- Currency is EGP everywhere with locale formatting.
- Dates are locale-aware.
- Toast tone and placement are consistent.
- Empty and error states are consistent in tone and layout.
- All links resolve; no dead links.

### A4.3 Final static checks

Re-run everything from A1.1 on the final state:
- npx tsc --noEmit
- npm run lint
- npm test
- npm run build
- npm audit --omit=dev

All must pass.

### A4.4 Final Lighthouse

Re-run mobile Lighthouse on:
/, /shop, /products/:slug, /cart, /login

Report the final scores.

### A4.5 README update

Update frontend/README.md:
- Storefront overview (list of pages).
- Storefront architecture (routing, state, data layer).
- How to add a new page.
- How to switch from mock to the real API.
- Note that the storefront runs on mock data until B1 to B8.

### A4.6 Tracker update

Update context/06-progress-tracker.md:
- Last updated with the audit date.
- Add a new section: Storefront audit with A1 to A4 as [x].
- Add a Phase history entry: Storefront audit complete.
- Add all A1 to A4 decisions to the Decisions log.
- Move resolved Known issues out.
- Add new Known issues with target phases.
- Add a summary note:
  Storefront verified. F1 to F7 + Audit A1 to A4 done.
  Ready to start B1 Backend foundation.

### A4.7 Final audit report

Produce the Storefront Audit Report:

## Storefront Audit — Final Report

**Sections done:** A1 OK A2 OK A3 OK A4 OK
**Total issues found:** N
**Issues fixed in this audit:** N
**Issues deferred:** N (list with target phases)

**Static checks:**
- TypeScript OK
- ESLint OK
- Tests OK (N passing)
- Build OK
- Audit OK

**Lighthouse mobile (final):**
| Page | Perf | A11y | Best | SEO |
|---|---|---|---|---|

**Verdict:** production-ready / partial
**Blockers:** (if any)
**Next phase proposal:** B1 Backend foundation

### A4.8 A4 commit
git add frontend context/06-progress-tracker.md
git commit -m "chore(audit): A4 final verification and storefront sign-off"

STOP. This is the end of the audit. Propose B1 and wait for approval.

---

## 3. Rules for the AI during the whole audit

1. Evidence over opinion. Every claim needs a file path + line or a command output.
2. No guessing. If unsure, ask.
3. No scope creep. Fix only what the current section asks. Log everything else in 06 Known issues with a target phase.
4. No security shortcuts.
5. No new libraries without explicit owner approval.
6. No big refactors beyond the file being fixed.
7. No git push. Only commits. The owner pushes.
8. One section at a time. Stop after each report.
9. Update 06 at the end of every section.
10. Report honestly. If a target cannot be reached, say why.
11. Keep responses short.

## 4. Conflict resolution

If a rule here conflicts with another context file:
AGENTS.md > 04 > 02 > 03 > 01 > 05 > 07.

If a rule here conflicts with a direct owner instruction in chat:
the owner's instruction wins, but the AI must first point out the conflict.

## 5. Definition of done (the entire audit)

The audit is done when:
- All 4 sections are [x] in 06.
- Static checks are green.
- Lighthouse mobile targets are met on the 5 key pages.
- No secrets in the client.
- No any, no console.log, no file > 300 lines.
- No hard-coded strings or colors.
- AR + EN + dark + light + 360/768/1280 all pass.
- frontend/README.md is updated.
- The Final Audit Report is written.
- 06 is updated with the audit summary.