# AGENTS.md — SIWAR

You are working on **SIWAR**, an e-commerce platform for a stainless steel jewelry brand for women in Egypt.
This file is the entry point. Read it first, every session.

## Repository layout

```
siwar/
├── AGENTS.md            ← you are here
├── context/             ← the 6-file context system (read before coding)
├── backend/             ← Node + Express + TypeScript + PostgreSQL (Supabase)
├── frontend/            ← customer storefront (React + Vite + TypeScript + Tailwind)
└── admin/               ← admin dashboard (React + Vite + TypeScript + Tailwind)
```

## Reading order (every session)

1. `context/06-progress-tracker.md` — where we are, what is next, open decisions
2. `context/04-ai-workflow-rules.md` — how you must work
3. `context/02-architecture.md` — stack, API contract, boundaries
4. `context/03-code-standards.md` — how code must be written
5. `context/01-project-overview.md` — what and why (skim if you already know)
6. UI work only: `context/05-ui-context.md` (storefront) or `context/05b-ui-context-admin.md` (admin)

If two files conflict, the higher number in this priority list wins: **AGENTS.md > 04 > 02 > 03 > 01 > 05/05b**. `06` is state, not rules. If you find a conflict, stop and tell me.

## Non-negotiable rules (summary)

1. Work on **one phase at a time**. Stop at the end of the phase, summarize, wait for approval.
2. At the end of every phase, **update `context/06-progress-tracker.md`**.
3. TypeScript strict everywhere. No `any`. No new libraries without asking.
4. No hard-coded colors, strings, secrets, or mock data inside components.
5. The API contract in `02-architecture.md` is the source of truth. Change the contract first, then the code, and tell me.
6. Never commit secrets. Never edit `.env` files with real values.
7. Ask before any architectural decision that is not already recorded in `06-progress-tracker.md` (Decisions log).
8. Do not modify files outside the current phase's scope.

## Commands

| Folder | Dev | Build | Lint | Test |
|---|---|---|---|---|
| `backend/` | `npm run dev` | `npm run build` | `npm run lint` | `npm test` |
| `frontend/` | `npm run dev` | `npm run build` | `npm run lint` | `npm test` |
| `admin/` | `npm run dev` | `npm run build` | `npm run lint` | `npm test` |

A phase is not done until `build` and `lint` pass in every folder you touched.

## Language

- Code, comments, commits, and these context files: **English**.
- Talking to me in chat: **Egyptian Arabic** is fine; keep technical terms in English.
- Product UI: Arabic (default, RTL) and English.
