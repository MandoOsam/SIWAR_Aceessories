# SIWAR

E-commerce platform for **SIWAR**, a stainless steel jewelry brand for women in Egypt.

```
SIWAR/
├── AGENTS.md      ← read this first, every session
├── context/       ← the 6-file context system (rules, architecture, standards, UI, state)
├── backend/       ← Node + Express + TypeScript + PostgreSQL (Supabase)
├── frontend/      ← customer storefront (React + Vite + TypeScript + Tailwind)
└── admin/         ← admin dashboard (not created yet)
```

## Working rules

`AGENTS.md` and `context/` are the source of truth. Start every session with:

1. `AGENTS.md`
2. `context/06-progress-tracker.md` — where we are and what is next
3. `context/04-ai-workflow-rules.md` — how the agent must work
4. `context/02-architecture.md`, `context/03-code-standards.md`
5. For UI work: `context/05-ui-context.md` (storefront) or `context/05b-ui-context-admin.md` (admin)

## Build order

The **storefront is built first, end to end, on mock data** behind a typed service layer
(decision D-018). `backend/` and `admin/` come afterwards. The frontend switches from mock
to the real API by setting `VITE_API_URL` — no component changes.

```
Phase 0 → F1 → F2 → F3 → F4 → F5 → F6 → F7 → B1 … B8 → A1 … A7
```

## Commands

Each folder is a standalone npm project:

| Folder | Dev | Build | Lint |
|---|---|---|---|
| `frontend/` | `npm run dev` | `npm run build` | `npm run lint` |
| `backend/` | `npm run dev` | `npm run build` | `npm run lint` |
| `admin/` | `npm run dev` | `npm run build` | `npm run lint` |

## Status

See `context/06-progress-tracker.md`.