# 04 — AI Workflow Rules

How you (the AI agent in opencode) must work on SIWAR. These rules protect the owner's time, the codebase, and his ability to understand it.

## 1. Working mode

**Default: BUILD** — you implement one phase at a time and explain it.

| Mode | When | What you do |
|---|---|---|
| `BUILD` (default) | All phases | Implement the phase, run checks, write the phase report |
| `LEARN` | Only if the owner says "learn mode" for a task (useful for the backend) | Do **not** write the implementation. Explain the concept, give the task breakdown and acceptance criteria, let the owner write the code, then review it |

The owner can switch mode per task at any time. Without an explicit switch, use BUILD.

## 2. Session start (always)

1. Read `AGENTS.md`, then `context/06-progress-tracker.md`, `04`, `02`, `03` (and `05`/`05b` for UI work).
2. Tell the owner in 3–5 lines: current phase, what you will do now, what you will **not** touch.
3. If the tracker and the code disagree, stop and report; do not guess.

## 3. One phase at a time

- Work only on the **current phase** listed in `06-progress-tracker.md`. Never start the next phase without approval.
- Before coding, post a short plan: files to create/change, new dependencies (should be none), risks, open questions.
- If the phase is bigger than expected, split it and ask.

## 4. Decision protocol

- If a decision is **already in the Decisions log** (`06`), follow it silently.
- If it is **not** recorded and it affects architecture, security, data model, libraries, hosting, or the API contract: **stop and ask**, offering 2–3 options with a recommendation and trade-offs.
- Small implementation details inside the standards (naming, file placement, minor UI spacing) — decide yourself.
- When the owner decides, add it to the Decisions log with the date.

## 5. Allowed without asking

Creating files inside the current phase's scope, writing tests, fixing lint/type errors you caused, small refactors in files you are already changing, adding `.env.example` entries, updating the context files **to record facts** (progress, decisions).

## 6. Must ask first

New dependencies; new tables or API endpoints not in `02`; changing auth/session behavior; changing the folder structure; deleting files you did not create; touching a different app than the phase says (e.g. backend work during an admin phase); anything involving real credentials, production data, deployments, or DNS.

## 7. Never do

- Commit or print secrets; edit real `.env` files; run commands against production.
- Disable security (RLS, CSRF, validation, rate limits) to "make it work".
- Use `any`, `@ts-ignore`, or silence ESLint rules to pass checks.
- Invent API shapes: the contract in `02` is the source of truth.
- Copy reference designs literally; use real brand names or fake press logos.
- Present sample reviews as verified purchases.
- Make destructive changes (drop tables, delete migrations, force-push) without explicit approval.
- Say something works without running it.

## 8. During implementation

- Follow `03-code-standards.md` strictly.
- Backend first, frontends second, when a feature needs both: the endpoint exists and is documented before the UI uses it. While the API is missing, UI uses the mock service layer behind the **same interface**.
- Run `npm run lint` and `npm run build` in every touched folder; run tests when they exist. Fix failures before reporting.
- For UI phases, test at 360 / 768 / 1280 px, dark and light, Arabic and English.
- Commit with conventional commits (at least one per phase).

## 9. End of phase (always)

1. All checks pass (`build`, `lint`, `test`).
2. Update `context/06-progress-tracker.md`: mark the phase status, list what changed, record new decisions, list open questions and known issues.
3. Write the **Phase Report** in chat using this template:

```
## Phase <ID> — <name>: done / partial
**What I built:** (3–6 bullets)
**Files changed:** (list)
**How it works:** (plain explanation, short)
**Why these choices:** (the reasoning, especially anything non-obvious)
**How to run/test it:** (exact commands and URLs)
**Checks:** build ✓ lint ✓ tests ✓ (or what failed)
**Decisions needed from you:** (if any)
**Next phase proposal:** <ID> — <name>
```

4. **Stop** and wait for the owner's approval.

## 10. Explaining things

The owner is a CS student learning backend deeply. In reports, explain the "why" in plain language (Arabic is fine in chat, English in code). Prefer small examples over theory. If you used a pattern (e.g. repository layer, session cookie, transaction), name it and say in one sentence what problem it solves.

## 11. Conflicts and uncertainty

- Priority when files disagree: `AGENTS.md > 04 > 02 > 03 > 01 > 05/05b`. `06` is state, not rules.
- If the request in chat conflicts with these files, say so and ask which to follow. A chat instruction for the current task wins only if the owner confirms after you point out the conflict.
- If you are unsure, ask. A short question is cheaper than a wrong phase.

## 12. Context maintenance

- Keep the six files accurate. If code and docs drift, fix the docs (or ask) in the same phase.
- Do not rewrite these files wholesale; make small edits and mention them in the phase report.
- Never delete the Decisions log or the Phase history in `06`.
