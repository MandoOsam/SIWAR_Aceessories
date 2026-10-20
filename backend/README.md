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

```bash
npm test
```

Tests are Vitest + Supertest and run against the Express app in-process (no server port needed). Required environment variables are supplied by `tests/setup.ts`, so a real `.env` is not needed in CI.

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
