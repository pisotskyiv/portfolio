---
name: case-study
description: Scaffold and write a case study page at app/work/[slug]. Use when building the first /work/[slug] page or adding another project's case study.
---

# case-study

Case studies are what separate this portfolio from a card grid. Each is ~600 words in five sections, engineering-voice, honest, sanitized for employer work. The audience is a senior engineer or technical recruiter who will probe the decisions in an interview. This skill creates the page, then makes its `caseStudy` link live.

The `app/work/[slug]` route renders a project's case study. A `caseStudy` value in `lib/projects.ts` must point at a page that exists — shipping the page is what makes the link real, so add the page in the same change that sets (or relies on) the link.

## When to use / when not

- use: building the first `app/work/[slug]/page.tsx`, or adding a case study for another project.
- skip: editing the project card itself (that is `add-project`); writing prose that is not a `/work/[slug]` page.

## Steps

1. **Gather raw material — do not write from memory.** Source from: the project's entry in `lib/projects.ts` (canonical bullets + metrics), `notes/chatbot-devlog.md` (decisions, dead-ends), `notes/opus-review-brief.md` (architecture + review notes), and the master resume PDF. Every metric in the page must trace to one of these.
2. **Sanitize employer work** (CTD RAG and any client project): no client names, program names, or proprietary infrastructure. No internal screenshots — diagrams only, redrawn generically. When in doubt, describe the pattern and your decision, not the specific system. Every metric carries a defensible basis ("measured by X in Y").
3. **Create the page file** at `app/work/<slug>/page.tsx`. For slug `ctd-rag-chatbot` that is `app/work/ctd-rag-chatbot/page.tsx`. Server component (no `"use client"`), exports `metadata` and a default page. Wrap content in a `<main>` so the page has one landmark (matches `app/page.tsx`). Use existing tokens only — `bg-surface`, `text-muted`, `border-border` resolve from the `@theme` block in `app/globals.css`; do not invent classes.

   ```tsx
   import type { Metadata } from "next";

   export const metadata: Metadata = {
     title: "[Project Title] — Vlad Pisotski",
     description: "[One sentence summary for OG/SEO]",
   };

   export default function CaseStudyPage() {
     return (
       <main id="main-content" className="mx-auto max-w-2xl px-4 py-16">
         {/* five sections below */}
       </main>
     );
   }
   ```

4. **Write the five sections** — keep this structure exactly, ~600 words total, engineering voice, no code (code lives in GitHub):
   - **Problem (50–80 words)** — what was broken, missing, or slow before this work. Concrete and specific, not "we needed better performance".
   - **What I built (100–150 words)** — high-level architecture: the main components and how they fit. One paragraph or a short list.
   - **Key decisions (200–250 words)** — 2–3 decisions worth defending. For each: the decision, the alternatives considered, why this choice, what you gave up. These are the interview questions, answered before they are asked.
   - **Results (50–80 words)** — quantified outcomes, each with a stated basis ("measured in Langfuse" / "benchmarked against N requests").
   - **What I'd do differently (80–100 words)** — one or two real retrospective tradeoffs. This is the section that reads as senior.
5. **Add the architecture diagram slot** below "What I built". A placeholder is fine in dev; a missing diagram on launch is not — replace before publishing.

   ```tsx
   {/* Architecture diagram — replace with SVG/image before publishing */}
   <div className="my-8 rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted">
     Architecture diagram
   </div>
   ```

6. **Confirm the page renders** before touching `lib/projects.ts`. Run `npm run gate` so the route type-checks and builds, then `npm run ship` to run the gate plus Playwright + axe (`/work/<slug>` returns 200, no 404, no broken links, axe passes). The `caseStudy` link is only real once this is green.
7. **Make the link live (IRREVERSIBLE checkpoint below).** If the slug's `caseStudy` value is already in `lib/projects.ts`, the page rendering is what un-breaks it — note it in the receipt. If you are adding a new slug, add `caseStudy: "/work/<slug>"` to that project entry only after step 6 is green. `lib/projects.test.ts` enforces the data shape.

## Content rules

- Rule: every number in the case study also appears in `lib/projects.ts` bullets — single source of truth.
  Check: `npm test` (`lib/projects.test.ts` validates the projects data shape). guidance: cross-checking each prose number against the bullet is manual — reviewer's job at the IRREVERSIBLE checkpoint; tracked in `CLAUDE.local.md`.
- Rule: never freeze a test count or metric into the page. Source any "N tests passing" figure from current `npm test` output and stamp it with the date you ran it. Notes hold a stale "88/88" — do not copy it.
  Check: `npm test` prints the live count; the page cites that run, not a remembered number.
- Rule: no emoji anywhere (CLAUDE.md style rule).
  Check: `npm run gate` (lint) plus reviewer eyes.
- guidance: no "In conclusion" / "Overall" — just end. No technology bullet list in the body (that is the card's job). Passive voice is fine for decisions ("was chosen"). Check tracked in `CLAUDE.local.md`.

## Checkpoints

> CHECKPOINT — SCOPE. Before creating the page, confirm: the slug, which project entry in `lib/projects.ts` it maps to, and that raw material (devlog, projects.ts, opus brief, resume) is gathered. This touches a new route plus, later, the data file.

> CHECKPOINT — CAN'T-VERIFY. The agent cannot judge whether prose is sanitized, honest, and interview-defensible, nor confirm the diagram reads correctly. Author reviews the five sections and supplies/approves the diagram before publish.

> CHECKPOINT — IRREVERSIBLE. Before the `caseStudy` link goes live (adding it to `lib/projects.ts`, or relying on this page to un-break an existing link), confirm: step 6 is green and the page renders at `/work/<slug>`. Do not make the link real against a 404.

## Receipt

```
--- RECEIPT ---
did:       app/work/<slug>/page.tsx; lib/projects.ts caseStudy (added | already present, now backed by a page)
gate:      green | FAILED: <which step>   (npm run gate, then npm run ship)
checked:   /work/<slug> renders 200, no 404; axe passes; every page number traces to lib/projects.ts; test count sourced from npm test on <date>
needs-you: review sanitization + honesty of the five sections; supply the architecture diagram; approve making the caseStudy link live
```
