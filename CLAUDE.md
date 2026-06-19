# Engineering conventions

Personal portfolio site. The build is part of the showcase: test-driven, CI-gated, built with an agentic-engineering workflow.

## Conventions

- **Content is data.** Edit `lib/projects.ts` and `lib/site.ts`; keep component JSX presentational.
- **Server components by default.** Client islands only where interaction requires them.
- **TDD.** Write Vitest unit test first, then implement. Write Playwright E2E test first for each user flow, then build the UI to pass it.
- **Gates (run before every push; CI enforces them):** `npm run lint && npm run typecheck && npm test && npm run build`.
- **E2E:** `npm run test:e2e` — run locally before shipping any user-visible feature. Lives in `e2e/`. Includes axe accessibility scan on every page.
- **Git.** Conventional commits, small PRs. Push to `main` = production deploy; PR = preview deploy.
- **Accessible by default.** Semantic HTML, visible focus states on all interactive elements, axe scan passes, WCAG AA contrast minimums, `prefers-reduced-motion` respected. See `notes/styleguide/accessibility.md`.
- **Responsive by default.** Mobile-first Tailwind classes. Every section tested at 375px and 1280px. No horizontal overflow at any viewport.

## Component architecture

- `components/ui/` — reusable primitives (Button, Card, Badge, etc.)
- `components/sections/` — one-off page sections (Hero, Projects, About, Contact)
- Props: explicit and fully typed — no prop spreading, no `...rest` passthrough
- Every component gets a test; no untested components ship
- Server components by default; `"use client"` only when interaction requires it

## Style rules

- No emoji anywhere — not in portfolio content, PR descriptions, READMEs, commit messages, or comments.
- Structure with lines, indentation, color, and font size — never emoji as visual markers.

## Style guide

Wiki: `notes/styleguide/` (gitignored). Load only the file you need — never read all at once.

| Task | Load |
|---|---|
| TypeScript types, generics, props | `notes/styleguide/typescript.md` |
| useEffect, useMemo, custom hooks | `notes/styleguide/hooks.md` |
| useState, server vs client state | `notes/styleguide/state.md` |
| App Router, Server Components, images, fonts | `notes/styleguide/nextjs.md` |
| Component structure, exports, event handlers | `notes/styleguide/components.md` |
| Tailwind classes, clsx, CSS variables, motion, responsive | `notes/styleguide/tailwind.md` |
| Semantic HTML, ARIA, focus, contrast, axe | `notes/styleguide/accessibility.md` |
| Writing and naming tests, RTL patterns | `notes/styleguide/testing.md` |
| Playwright E2E — flow tests, selectors, config | `notes/styleguide/testing-e2e.md` |
| File naming, import order, path aliases | `notes/styleguide/files-imports.md` |

When introducing a pattern not covered: flag it, ask if it becomes a rule, add it before closing the PR.

## Skills

Workflow skills live in `.claude/skills/` (next-conventions, tdd-flow, add-project, case-study, ship-check) — loaded on demand.

> Personal working notes and roadmap are in `CLAUDE.local.md` (gitignored).
