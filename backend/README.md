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
