import "server-only";

import { looksLikeHtml } from "@/lib/system-prompt";

// Topic pages for the chat assistant's lookup_bio tool. The corpus lives
// off-repo (secret gist served as raw markdown, same pattern as the persona in
// lib/system-prompt.ts) so the public repo never ships the full bio.
// BIO_GIST_RAW_BASE — the gist's raw base URL (…/raw); each topic resolves to
// `<base>/<topic>.md`. Unset or unreachable degrades to null and the tool
// surfaces an error the model can answer around.
export const BIO_TOPIC_IDS = [
  "ctd-work",
  "chef-jul",
  "portfolio-site",
  "learning-projects",
  "career-story",
] as const;

export type BioTopic = (typeof BIO_TOPIC_IDS)[number];

// Human-readable index used in the tool description so the model picks the
// right page without a separate index fetch.
export const BIO_TOPIC_SUMMARIES: Record<BioTopic, string> = {
  "ctd-work":
    "Code the Dream employer work: RAG engine, LangGraph workstream, LLM evals, PII/security, Azure, benchmarks",
  "chef-jul": "Chef Jul AI meal planner — hackathon 2nd place, team lead",
  "portfolio-site":
    "this portfolio site's architecture, testing, and design decisions",
  "learning-projects":
    "side projects and earlier work: skill library, practicum team app, MERN build, Python pipeline, Kaggle",
  "career-story":
    "path into software: timeline, restaurant leadership years, gap answer",
};

// Cap what a single tool call can inject into model context.
export const MAX_PAGE_CHARS = 12_000;

const REVALIDATE_SECONDS = 300;

export async function getBioPage(topic: BioTopic): Promise<string | null> {
  const base = process.env.BIO_GIST_RAW_BASE;
  if (!base) return null;

  const url = `${base.replace(/\/$/, "")}/${topic}.md`;
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      console.warn(`[bio-wiki] fetch ${url} → ${res.status}; skipping`);
      return null;
    }
    const text = (await res.text()).trim();
    if (looksLikeHtml(text)) {
      console.warn(
        `[bio-wiki] fetch ${url} returned HTML (non-raw base url?); skipping`,
      );
      return null;
    }
    return text ? text.slice(0, MAX_PAGE_CHARS) : null;
  } catch (err) {
    console.warn(`[bio-wiki] fetch ${url} failed; skipping`, err);
    return null;
  }
}
