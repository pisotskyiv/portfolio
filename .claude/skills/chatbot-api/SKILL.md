---
name: chatbot-api
description: Governs the streaming AI chat route and its tools — the AI SDK v6 pattern, model selection from env, tool definitions, and the client-side message-parts contract. Use when adding or changing app/api/chat/route.ts, a chat tool, or how ChatDrawer renders tool output.
---

# chatbot-api

The chat backend is a single streaming route (`app/api/chat/route.ts`) plus the client that renders its stream (`components/ui/ChatDrawer.tsx`). This skill is the contract for both: the v6 streaming shape, env-driven model selection, tool definitions, and the message-parts rendering rules. The route is public and recruiter-visible — secrets and persona stay out of it.

## When to use / when not

- use: adding or editing `app/api/chat/route.ts`; adding a chat tool; changing how the client renders message parts or tool output; touching `getModel()` or provider/model env wiring.
- skip: pure presentational changes to `ChatDrawer` that do not touch `message.parts`, the stream, or tool rendering; work on the scheduler data layer (`lib/google-calendar.ts`, `lib/availability.ts`) that does not change the tool contract.

## The v6 streaming pattern (canonical)

The route MUST follow this exact shape. Canonical file: `app/api/chat/route.ts`.

1. Parse `{ messages }: { messages: UIMessage[] }` from the request body.
2. `streamText({ model: getModel(), system, messages: await convertToModelMessages(messages), stopWhen: stepCountIs(N), tools })`.
3. `return result.toUIMessageStreamResponse()`.

Do not hand-roll SSE, do not return `result.toDataStreamResponse()` (pre-v6), do not pass `messages` to `streamText` without `convertToModelMessages` — `useChat` sends `UIMessage[]`, the model needs `ModelMessage[]`.
Check: `npm run gate` (typecheck — wrong helper names or message types fail `tsc`; the route imports from `ai`).

## Steps

1. State the change and which files it touches. If it spans route + client + a styleguide rule, that is multi-file — hit the SCOPE checkpoint first.
2. Write the test first (Rule "test-first" below). For a route change: a Vitest unit test for the POST handler. For a user-visible flow: a Playwright chat spec in `e2e/`. Red before green. See `notes/styleguide/testing.md` and `notes/styleguide/testing-e2e.md`.
3. Select the model only through `getModel()` — never inline a model id. `AI_PROVIDER` defaults to `"anthropic"`; `ANTHROPIC_MODEL` defaults to `claude-haiku-4-5-20251001`; `OPENAI_MODEL` defaults to `gpt-4o-mini`. Read every secret from `process.env` at call time. Top of the module: `import "server-only";`.
4. Define each tool with `tool({ description, inputSchema: z.object({...}), execute })`. Keep the loop bounded with `stopWhen: stepCountIs(N)` (currently `3`) so a tool that re-triggers the model cannot spin unbounded.
5. For every tool you add, add the matching client branch in `ChatDrawer` keyed on `part.type === "tool-{name}"`, and handle BOTH terminal states: `output-available` AND `output-error` (see the rules). A pending state is fine, but a tool can fail.
6. Keep the system prompt / persona out of the committed route file (see the persona rule).
7. Run `npm run gate`. For any user-visible change run `npm run ship` (adds the Playwright + axe e2e) before pushing.

## Rules

Each rule names its check, or is labeled `guidance:` with the missing check logged in `CLAUDE.local.md`.

1. **Node runtime + duration for streaming routes that touch googleapis.**
   `app/api/chat/route.ts` calls `getAvailability()` from `lib/google-calendar.ts`, which uses `googleapis` + the Node `JWT` client — incompatible with the Edge runtime, and a streaming tool call can outrun the default function timeout. The route MUST export `runtime = "nodejs"` and a `maxDuration` (e.g. `30`).
   guidance: not present in the route today; no check enforces it. Backlog item in `CLAUDE.local.md`. Until added, deploys default to the platform runtime/timeout — verify manually that the scheduler tool completes on the deployed preview.

2. **Client handles both tool terminal states.**
   In `ChatDrawer`, each `tool-{name}` part branch MUST render `output-available` (success) and `output-error` (failure) distinctly, plus an optional pending state. Today `tool-show_scheduler` renders `output-available` and otherwise falls through to a permanent "Checking availability..." pulse — so an `execute` rejection shows a fake spinner forever.
   guidance: no automated check; an RTL test asserting an error branch would enforce it. Backlog in `CLAUDE.local.md` (logged with the test-first item). Code fix is a Type B (code drifted): keep the rule strict.

3. **Persona / system prompt is not committed in the public route.**
   The route file is recruiter-visible. The system prompt (bio, contact, tone) MUST live in a gitignored module or an env var, with a minimal committed fallback in the route. Today the full persona is inline in `route.ts` (the `SYSTEM` constant) — public.
   guidance: no check distinguishes "fallback" from "full persona"; a reviewer call. Backlog in `CLAUDE.local.md`. Type B (code drifted): move the persona, leave a one-line fallback.

4. **Secrets via `process.env` at call time; `import "server-only"`.**
   No API key, client email, or private key is ever a literal, a default value, or imported into a client module. `getModel()` and `lib/google-calendar.ts` read keys from `process.env` inside the function. Any module that reads a secret starts with `import "server-only";` so a client import fails the build.
   Check: `npm run gate` (build — `server-only` throws at build if pulled into a client bundle). The route is server-only by being an App Router route handler; `lib/google-calendar.ts` already imports `server-only`.

5. **Test-first: route unit test + chat e2e.**
   A new or changed route gets a Vitest unit test for the POST handler before the implementation; a user-visible chat flow gets a Playwright spec in `e2e/` before the UI. Neither exists yet — `app/api/chat/route.ts` has no co-located test and `e2e/` holds only `home.spec.ts`.
   guidance: the tests-exist convention does not yet assert a test for route handlers. Backlog in `CLAUDE.local.md`. Once written, `npm run gate` (Vitest) and `npm run ship` (Playwright + axe) enforce them.

6. **Rate-limit + spend cap before public launch.**
   The route is unauthenticated and bills a paid LLM per request. Before exposing it publicly it MUST sit behind a rate limiter and a spend cap. `@upstash/ratelimit` / `@upstash/redis` are not installed.
   guidance: nothing installed, nothing enforced. **Launch blocker** logged in `CLAUDE.local.md`. Do not ship the public chat route until this lands.

## Checkpoints

> CHECKPOINT — SCOPE. Before editing across route + client + styleguide, confirm: which files change, whether a new tool is added (route branch + client `tool-{name}` branch + persona impact), and which test goes red first.

> CHECKPOINT — IRREVERSIBLE. Before pushing or deploying the chat route publicly, confirm the launch blocker (Rule 6, rate-limit + spend cap) is resolved or the deploy is an intentionally gated preview. An unmetered public LLM endpoint is a cost-and-abuse risk.

> CHECKPOINT — CAN'T-VERIFY. The agent cannot open the deployed preview to confirm the Node runtime / `maxDuration` (Rule 1) or that an errored tool renders correctly in a real browser (Rule 2). Either name these in the receipt `needs-you` line with the actor, or stop here.

## Receipt

```
--- RECEIPT ---
did:       <route/client/test files created or changed>
gate:      green | FAILED: <which step of npm run gate>
checked:   <ran npm run gate; npm run ship for user-visible flows; which rules were verified vs left guidance>
needs-you: <verify deployed preview runtime/timeout; visually confirm error-state rendering; resolve launch blocker before public push> | nothing
```
