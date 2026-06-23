# Portfolio — Vlad Pisotski

[![CI](https://github.com/Pisotski/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Pisotski/portfolio/actions/workflows/ci.yml)

Personal portfolio site for an AI/LLM-focused full-stack engineer. The build process is itself part of the showcase: test-driven, CI-gated, shipped via an agentic-engineering workflow.

## Stack

- **Next.js 16** (App Router) + **React 19** — server components first; client islands only where interaction demands.
- **TypeScript** — strict.
- **Tailwind CSS v4** — utility styling, dark/light via `prefers-color-scheme`.
- **Vitest + React Testing Library** — data-integrity and component render/a11y tests.
- **GitHub Actions** — lint, typecheck, test, build on every push and PR.
- **Vercel** — production deploy on `main`, preview deploy per PR.

## Architecture

- `app/` — App Router entry; home page lives under `app/(main)/` (`layout.tsx`, `page.tsx`), and global styles (`globals.css`).
- `components/` — presentational sections (Hero, Projects, About, etc.); each rendered from typed data, not hardcoded copy.
- `lib/` — content as typed data: `projects.ts` (project cards) and `site.ts` (identity, links, education). Edit content here; components stay untouched.

## Develop

```sh
npm install
npm run dev        # http://localhost:3000
```

## Verify (the same gates CI runs)

```sh
npm run lint
npm run typecheck
npm test           # vitest run
npm run build
```

## Method

Built with an AI-assisted, agentic-engineering workflow (Claude Code): spec-first, small reviewed chunks, tests and CI as the safety net. Architecture, decisions, and review are mine.
