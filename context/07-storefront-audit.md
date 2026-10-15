# 07 — Storefront Audit & Clean Code Verification

> Context file **07** of the SIWAR context system. Read `AGENTS.md` first,
> then `06`, `04`, `02`, `03`, `05`. This file defines the **storefront
> audit** that runs AFTER F7 and BEFORE B1.
>
> It is NOT a new roadmap phase. It is a verification pass that guarantees
> the storefront (F1 → F7) is production-ready in: code quality, types,
> security, accessibility, performance, i18n, and UX.
>
> Priority when files disagree: `AGENTS.md > 04 > 02 > 03 > 01 > 05 > 07`.
> `06` is state, not rules.
>
> Owner: Mando. Default mode: BUILD (find and fix). LEARN mode only if the
> owner asks for it per section.

---

## 0. Reading order and prerequisites

Before starting any audit section, the AI must have read (in this order):

1. `AGENTS.md`
2. `context/06-progress-tracker.md`
3. `context/04-ai-workflow-rules.md`
4. `context/02-architecture.md`
5. `context/03-code-standards.md`
6. `context/05-ui-context.md`
7. This file (`07`)

Prerequisites that MUST be true:
- F7 is marked `[x]` in `06`.
- `git status` is clean on the audit branch.
- `npm run build`, `npm run lint`, `npm test` all pass locally.
- The owner created a dedicated branch for the audit
  (`feature/storefront-audit`).

If any prerequisite fails, STOP and report before doing anything else.

---

## 1. Scope and non-goals

### 1.1 In scope (this audit covers)
- The customer storefront only: `frontend/`.
- Code quality, types, ESLint, tests, build.
- Component structure, separation of concerns, state, API layer.
- Routing, navigation, forms, loading/empty/error states.
- Responsive, RTL/LTR, dark/light, accessibility.
- Security of the browser bundle (no secrets, no unsafe HTML, safe storage).
- Performance (images, chunks, Lighthouse mobile).
- i18n parity, untranslated keys, formatting.

### 1.2 Out of scope (do NOT touch)
- `backend/` and `admin/` folders.
- Changing the API contract in `02-architecture.md`.
- Adding new libraries.
- Adding new features (new pages, new components, new flows).
- Replacing mock data with real APIs (that's B1 → B8).
- Changing auth from mock to real (that's B2).

If you find an out-of-scope issue, log it in `06` Known issues with a
target phase. Do not fix it here.

---

## 2. The four audit sections

The audit runs in **4 sections**. Each section is a self-contained pass
with its own checks, fixes, commit, and tracker update. Do them in order,
one at a time, and stop after each.

| # | Section | Purpose |
|---|---|---|
| **A1** | Static checks & code structure | Prove the codebase is clean at the compiler, lint, test, build, and structure levels |
| **A2** | UX, routing, i18n & responsive | Prove every page, flow, language, theme, and breakpoint behaves correctly |
| **A3** | Security, accessibility & performance | Prove the storefront is safe, accessible, and fast on mobile |
| **A4** | Final verification & sign-off | Re-run everything, produce the audit report, update the tracker |

Each section has:
- A scope
- A checklist
- What to fix
- What to defer
- The exact commit message
- The tracker updates
- The report format

---

## Section A1 — Static checks & code structure

### A1.1 Static checks (run first, always)

Run and paste the raw output for each:

| Check | Command | Pass criteria |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | no errors |
| ESLint | `npm run lint` | no errors, no warnings |
| Unit tests | `npm test` | all green |
| Production build | `npm run build` | no errors, no warnings |
| Dep vulnerabilities | `npm audit --omit=dev` | no critical, no high |

Fix every failure. Show the file + line, the fix, and the re-run result.

### A1.2 Component structure

- [ ] No file > 300 lines. Find them:
      `find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -30`
- [ ] Split oversized files. Keep each split into a focused module.
- [ ] Every component has one clear responsibility.
- [ ] No "god components" that fetch, transform, and render at once.
- [ ] No dead files. Find orphan files by searching for imports
      (`grep -rn "from \"@/components/<name>\"" src` returns nothing → orphan).
- [ ] No commented-out code blocks longer than 3 lines.
- [ ] No leftover `TODO:` without a matching entry in `06` Known issues.

### A1.3 Separation of concerns

- [ ] `pages/`, `sections/`, `components/` do NOT import from `services/`
      directly. They use hooks or TanStack Query only.
- [ ] No `fetch()` inside components. Everything goes through `src/services/`.
- [ ] No URL construction inside components.
- [ ] No direct `localStorage` access from components. It goes through a store
      or a hook.
- [ ] Business rules live in `hooks/` or `services/`, never in JSX.

### A1.4 State management

- [ ] Server state (products, orders, user) lives in TanStack Query only.
- [ ] Client state lives in Zustand stores: `cart`, `wishlist`, `auth`,
      `notifications`, `recentlyViewed`, `ui`.
- [ ] Page-local state (variant, checkout step, form inputs) lives in
      `useState` / React Hook Form — NOT in a global store.
- [ ] URL-driven state (`/shop`, `/category`, `/search`) lives in
      `useProductFilters` only. Not in Zustand.
- [ ] No duplicated state between Zustand and TanStack Query.
- [ ] No state that should be in the URL but isn't (verify in every list page).

### A1.5 API layer

- [ ] All network calls go through `src/services/`.
      Files: `catalogService.ts`, `checkoutService.ts`, `authService.ts`,
      `accountService.ts`, `mockOrderStore.ts`, `mockAuthStore.ts`,
      `http.ts`, plus the shared types.
- [ ] Every service function is typed (no `any` in signatures or returns).
- [ ] Every service has a mock path AND a real-path placeholder.
      The real path reads `VITE_API_URL` via `src/services/http.ts`.
- [ ] No URL is built by concatenating user input.
- [ ] Error responses follow `02-architecture.md` §4:
      `{ error: { code, message, details } }`.

### A1.6 Types

- [ ] No `any` in the codebase: `grep -rn "\bany\b" src --include="*.ts" --include="*.tsx"`.
- [ ] No `@ts-ignore` or `@ts-expect-error` without a comment explaining why.
- [ ] No duplicated type declarations (e.g., `Product` in two files).
- [ ] API types match `02-architecture.md` §6 exactly.
- [ ] Bilingual fields are typed as `L10n = { ar: string; en: string }`.

### A1.7 Configuration

- [ ] All env vars read through `src/config/app.ts`.
- [ ] `VITE_API_URL` is the only API-related var exposed to the browser.
- [ ] No secrets in the browser bundle:
      `grep -rn "SECRET\|PRIVATE_KEY\|TOKEN" src/ .env*`.
- [ ] `.env.example` documents every var actually used.

### A1.8 Code duplication

- [ ] One price formatter (used everywhere).
- [ ] One date formatter (used everywhere).
- [ ] One currency formatter (EGP).
- [ ] One `useDebounce` / `useDebouncedValue` (only one of them exists).
- [ ] One `useMediaQuery`.
- [ ] One `useDocumentMeta`.
- [ ] Shared skeleton / empty / error components are reused, not duplicated.

### A1.9 Dependencies

- [ ] No unused packages. Verify with `npx depcheck` (install only if the
      owner approves).
- [ ] No two packages doing the same job (two chart libs, two date libs).
- [ ] No vulnerable packages (see A1.1 `npm audit`).
- [ ] Every dependency is justified in `06` Decisions log.

### A1.10 What to fix in A1
- All static-check failures.
- All files > 300 lines.
- All dead files, dead imports, dead TODOs.
- All `any`, `@ts-ignore`, unsafe casts.
- All secret-like strings in the client.
- All duplications listed above.

### A1.11 What to defer in A1
- Anything that requires a new library.
- Anything that changes the API contract.
- Anything that touches `backend/` or `admin/`.
- Anything that changes a working behavior in F1 → F7 without a clear bug.

### A1.12 A1 commit
