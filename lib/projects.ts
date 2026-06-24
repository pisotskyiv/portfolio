export type Project = {
  slug: string;
  title: string;
  role: string;
  /** One or two sentence card summary */
  description: string;
  /** Optional one-line badge, e.g. an award */
  highlight?: string;
  /** Metric-backed accomplishments, sourced from the resume */
  bullets: string[];
  tech: string[];
  github?: string;
  live?: string;
  caseStudy?: string;
  /** Nested sub-projects rendered inside this card */
  children?: Project[];
};

export const projects: Project[] = [
  {
    slug: "ctd-rag-chatbot",
    title: "CTD RAG Chatbot",
    role: "Full-Stack Developer, Code the Dream",
    description:
      "Retrieval-augmented generation pipeline for clinical trial documentation. Improved retrieval precision by 60% and increased observability by 40% through LLM-as-a-Judge evaluation infrastructure.",
    bullets: [
      "Built full-stack evaluation infrastructure on the LLM-as-a-Judge paradigm, combining automated multi-metric scoring with human validation workflows.",
      "Integrated Langfuse observability to visualize production responses via structured Scores and Sessions, increasing actionable visibility by 40%.",
      "Designed a modular MongoDB Filestore supporting multiple vector store configurations, improving retrieval precision by 60% across production programs.",
    ],
    tech: ["Next.js", "TypeScript", "MongoDB", "Langfuse", "LangChain", "OpenAI"],
    caseStudy: "/work/ctd-rag-chatbot",
    children: [
      {
        slug: "langgraph-rag-citation-engine",
        title: "LangGraph RAG Citation Engine",
        role: "Full-Stack Developer, Code the Dream",
        description:
          "Replaced a single-pass LangChain pipeline with a stateful 4-node LangGraph that validates citations sentence-by-sentence before committing any answer. Reduced response inaccuracy from 30%+ via structured validation, retry loops, and rolling conversation summarization.",
        bullets: [
          "Designed and implemented a 4-node LangGraph with conditional routing: conversation summarization, MMR retrieval, LLM generation, and a two-layer citation validator with up to 2 retries.",
          "Built a Locust benchmark script replaying real production conversations message-by-message against the new graph route to measure improvement at scale.",
          "Wrote three LLM-as-judge evaluators in Langfuse — retrieval precision, citation faithfulness, and answer correctness — and produced the six-phase production hardening roadmap the team now executes.",
        ],
        tech: ["LangGraph", "LangChain", "MongoDB", "OpenAI", "Langfuse", "Python", "Next.js", "TypeScript"],
        caseStudy: "/work/ctd-rag-chatbot",
      },
    ],
  },
  {
    slug: "chef-jul",
    title: "Chef Jul",
    role: "Team Lead & Full-Stack Developer",
    description:
      "AI-powered meal planner with personalized nutrition intelligence built in 48 hours. Parallelized LLM pipeline cut processing time by 40%; multi-agent workflow enables ~2s preference adjustments.",
    highlight: "2nd Place, MetLife Hackathon 2025",
    bullets: [
      "Led the team from concept to a production-ready Firebase backend in under 48 hours.",
      "Architected a parallelized LLM generation pipeline, cutting total processing time by 40% to sub-55s execution under constrained hardware.",
      'Orchestrated a multi-agent "Split-Brain" workflow enabling near-instant (~2s) user preference adjustments via shared state synchronization.',
    ],
    tech: ["Firebase", "React", "Node.js", "LLM Orchestration"],
    github: "https://github.com/ctd-hackaton/front-end",
    live: "https://ctd-hackaton.web.app/",
    caseStudy: "/work/chef-jul",
  },
  {
    slug: "portfolio",
    title: "This Portfolio",
    role: "Author",
    description:
      "A recruiter-facing portfolio built with an agentic engineering workflow. Engineering values — TDD-first, error-before-happy-path, accessibility, CI gates — illustrated through the code itself.",
    bullets: [
      "Practiced Karpathy's agentic engineering methodology: spec-first, small reviewed increments, agent does the typing, human owns decisions.",
      "TDD throughout: Vitest + RTL tests written before each component; 60+ tests green in CI on every push.",
      "Error-before-happy-path convention: error.tsx and loading.tsx defined before each feature to catch silent failures early.",
    ],
    tech: ["Next.js 16", "TypeScript", "Tailwind v4", "Vitest", "Playwright", "GitHub Actions"],
    github: "https://github.com/vlad-pisotskyi/portfolio",
    caseStudy: "/work/portfolio",
  },
];
