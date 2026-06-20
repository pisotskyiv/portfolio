export type CaseStudySection = {
  id: string;
  heading: string;
  body: string[];
};

export type CaseStudy = {
  slug: string;
  tldr: string;
  sections: CaseStudySection[];
};

export const caseStudies: Record<string, CaseStudy> = {
  "ctd-rag-chatbot": {
    slug: "ctd-rag-chatbot",
    tldr: "Built retrieval-augmented generation infrastructure for clinical trial documentation at Code the Dream. Improved retrieval precision by 60% through modular vector store design and raised observability by 40% by wiring LLM-as-a-Judge scoring into Langfuse production dashboards.",
    sections: [
      {
        id: "problem-context",
        heading: "Problem & Context",
        body: [
          "Code the Dream's benefits navigation chatbot answered questions against a large corpus of clinical trial and program documentation. As the document library grew, retrieval quality degraded — users received answers grounded in stale or mismatched chunks, and there was no systematic way to detect regressions.",
          "The team lacked observability into which retrievals were failing and why. Without structured evaluation data, every prompt-engineering change was a guess. I was brought in to build the evaluation layer from the ground up and stabilize retrieval quality before the next program rollout.",
        ],
      },
      {
        id: "my-role",
        heading: "My Role",
        body: [
          "Full-Stack Developer at Code the Dream. Owned the evaluation infrastructure end to end — from scoring pipeline design to the Langfuse dashboard surfacing results to the team. Also contributed to the MongoDB Filestore refactor and the streaming chat interface.",
        ],
      },
      {
        id: "architecture",
        heading: "Architecture",
        body: [
          "The evaluation system runs on the LLM-as-a-Judge paradigm: a secondary model scores each production response across multiple metrics (faithfulness, relevance, completeness) and writes structured Scores back to Langfuse alongside the originating Session. This creates a searchable, filterable audit trail of every response the chatbot has ever given.",
          "On the retrieval side, the MongoDB Filestore was refactored to support multiple vector store configurations behind a common interface. Each configuration — embedding model, chunk size, overlap — can be swapped and evaluated independently without touching the query layer. This modularity was the key lever that enabled the 60% precision improvement: we could run controlled comparisons across configurations against a fixed eval set.",
        ],
      },
      {
        id: "key-challenges",
        heading: "Key Challenges",
        body: [
          "Eval data bootstrapping: there were no labeled question-answer pairs to evaluate against. Solved by generating a synthetic eval set from the document corpus using the same LLM, then having domain experts spot-check a stratified sample.",
          "Streaming + evaluation coexistence: the chat UI streams tokens as they arrive, but the judge needs the complete response. Implemented a post-stream hook that buffers the full response before dispatching the scoring pipeline asynchronously — zero latency impact to the user.",
        ],
      },
      {
        id: "results-impact",
        heading: "Results & Impact",
        body: [
          "Retrieval precision improved by 60% after switching to the optimal vector store configuration identified through the evaluation pipeline. Langfuse observability increased actionable visibility by 40% — the team can now detect regressions within hours of a document update rather than waiting for user complaints.",
          "The LLM-as-a-Judge infrastructure is now the team's primary quality gate before any prompt or retrieval change ships to production.",
        ],
      },
    ],
  },
  "chef-jul": {
    slug: "chef-jul",
    tldr: "Led a four-person team from zero to a production-ready AI meal planner in 48 hours at the MetLife Hackathon 2025. Parallelized LLM pipeline cut total processing time by 40%; a multi-agent Split-Brain workflow enables near-instant preference adjustments. Placed 2nd overall.",
    sections: [
      {
        id: "problem-context",
        heading: "Problem & Context",
        body: [
          "The MetLife Hackathon 2025 challenge: build something meaningful in 48 hours. Our team chose personalized nutrition — a space where generic meal plans fail users because they ignore individual preferences, restrictions, and goals.",
          "The core technical challenge was latency. Generating a full weekly meal plan with per-meal nutrition data required multiple sequential LLM calls — a naive implementation would take minutes, killing the interactive feel we needed to win.",
        ],
      },
      {
        id: "my-role",
        heading: "My Role",
        body: [
          "Team Lead and Full-Stack Developer. Set the technical direction in hour one, assigned work streams, and kept the team unblocked across 48 hours. Personally architected and implemented the parallelized LLM pipeline and the Split-Brain multi-agent workflow.",
        ],
      },
      {
        id: "architecture",
        heading: "Architecture",
        body: [
          "Instead of sequentially generating each meal, the pipeline fans out: all seven days of meal generation run in parallel via Promise.all, with each day's meals generated concurrently within that batch. This alone cut end-to-end generation time by 40% to under 55 seconds on constrained hackathon hardware.",
          "User preference adjustments use a Split-Brain pattern: a lightweight preference agent holds shared state and responds to changes in ~2 seconds by regenerating only the affected meals rather than the full plan.",
        ],
      },
      {
        id: "results-impact",
        heading: "Results & Impact",
        body: [
          "2nd place finish at MetLife Hackathon 2025. Judges highlighted the real-time preference adjustment experience as the standout differentiator.",
          "Shipped a production-ready Firebase backend with auth, Firestore persistence, and a React frontend — all within the 48-hour window.",
        ],
      },
    ],
  },
  portfolio: {
    slug: "portfolio",
    tldr: "Built this portfolio using an agentic engineering workflow: spec-first, TDD throughout, CI-gated, with an AI agent handling implementation while the human owns every architectural decision. The engineering methodology is the showcase.",
    sections: [
      {
        id: "problem-context",
        heading: "Problem & Context",
        body: [
          "Most developer portfolios demonstrate taste in design but obscure how the engineer actually works. I wanted mine to do the opposite — treat the codebase itself as evidence of engineering values.",
          "The constraint: it had to be production-grade by the time any recruiter saw it. No placeholder tests, no skipped linting, no debt.",
        ],
      },
      {
        id: "my-role",
        heading: "My Role",
        body: [
          "Author and architect. Wrote every spec, made every architectural call, reviewed every diff. Claude handled the implementation typing; I owned the decisions.",
        ],
      },
      {
        id: "methodology",
        heading: "Methodology",
        body: [
          "Practiced Karpathy's agentic engineering methodology: small, reviewed increments with the agent doing the typing and the human owning direction. Every component was specced before it was built.",
          "TDD throughout: Vitest + React Testing Library tests written before each component. Playwright E2E tests cover every user-visible flow. 60+ unit tests green in CI on every push.",
          "Error-before-happy-path convention: error.tsx and loading.tsx defined before each feature route to catch silent failures early rather than after the fact.",
        ],
      },
      {
        id: "results-impact",
        heading: "Results & Impact",
        body: [
          "CI gates (lint, typecheck, test, build) pass on every push. Zero accessibility violations on axe scan. Responsive from 375px to 1280px.",
          "The workflow itself became a portfolio artifact: the commit history, PR descriptions, and CLAUDE.md document how the project was built as clearly as the code does.",
        ],
      },
    ],
  },
};
