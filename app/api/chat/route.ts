import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { getAvailability } from "@/lib/google-calendar";
import { checkRateLimit } from "@/lib/rate-limit";

// googleapis (in the scheduler tool) is Node-only, and we stream — pin Node
// and cap the request so the route can't hang or run on Edge.
export const runtime = "nodejs";
export const maxDuration = 30;

// Cheap abuse/cost guards applied before the model is ever touched.
const MAX_MESSAGES = 25;
const MAX_INPUT_CHARS = 4000;
const MAX_OUTPUT_TOKENS = 800;

function messageChars(message: UIMessage): number {
  return (message.parts ?? []).reduce(
    (n, part) =>
      part.type === "text" && typeof part.text === "string"
        ? n + part.text.length
        : n,
    0,
  );
}

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || "anonymous";
}

function getModel() {
  const provider = process.env.AI_PROVIDER ?? "anthropic";
  if (provider === "openai") {
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    console.log(`[chat] provider=openai model=${model}`);
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openai(model);
  }
  const model = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
  console.log(`[chat] provider=anthropic model=${model}`);
  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropic(model);
}

const SYSTEM = `You are an AI assistant on Vlad Pisotski's portfolio website. Answer questions about Vlad's background, experience, projects, and skills. Keep responses concise and professional.

## About Vlad
- Full-Stack Developer at Code the Dream (November 2024 – present), San Francisco, CA
- Focus: AI-driven web apps, RAG chat systems, streaming UIs, LLM evaluation dashboards
- 2nd place MetLife Hackathon 2025 — team lead, AI meal-planning assistant

## Skills
TypeScript, JavaScript, Next.js, React, Node.js, Express, PostgreSQL, MongoDB, Redis, Firebase, AWS, Python
AI/LLM: OpenAI, Anthropic, LangChain, Langfuse, RAG, streaming interfaces

## Education
- Code the Dream: React, Node.js, Python and Advanced Practicum (2024)
- Hack Reactor: Software Engineer Immersive (2018)
- BA International Affairs, Kyiv International University

## Projects
**CTD RAG Chatbot** — Full-stack RAG pipeline for clinical trial documentation
- Built LLM-as-a-Judge evaluation infrastructure with automated multi-metric scoring and human validation workflows
- Integrated Langfuse observability, increasing actionable visibility by 40%
- Designed modular MongoDB Filestore, improving retrieval precision by 60%
- Tech: Next.js, TypeScript, MongoDB, Langfuse, LangChain, OpenAI

**Chef Jul** — AI meal planner, 2nd place MetLife Hackathon 2025
- Led team from concept to production-ready Firebase backend in 48 hours
- Parallelized LLM pipeline cut processing time by 40% to sub-55s execution
- Multi-agent "Split-Brain" workflow enabling ~2s preference adjustments
- Tech: Firebase, React, Node.js, LLM Orchestration

**This Portfolio** — Built with an agentic engineering workflow
- TDD throughout: Vitest + RTL tests written before each component
- Accessible by default: semantic HTML, axe scan, WCAG AA contrast

## Contact
Email: vlad.pisotski@gmail.com
GitHub: https://github.com/Pisotski
LinkedIn: https://www.linkedin.com/in/vpisotski/

## Scheduling
When someone asks to schedule an interview, call, or meeting — use the show_scheduler tool to display Vlad's live availability. Do not list times manually.

## Tone
Be concise, warm, and professional. Don't oversell. Answer what's asked.`;

export async function POST(req: Request) {
  // Kill switch: flip CHAT_ENABLED=false to take the paid LLM offline instantly.
  if (process.env.CHAT_ENABLED === "false") {
    return Response.json(
      { error: "Chat is currently disabled." },
      { status: 503 },
    );
  }

  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    if (!Array.isArray(messages) || messages.length > MAX_MESSAGES) {
      return Response.json({ error: "Too many messages." }, { status: 413 });
    }
    const totalChars = messages.reduce((n, m) => n + messageChars(m), 0);
    if (totalChars > MAX_INPUT_CHARS) {
      return Response.json({ error: "Message too long." }, { status: 413 });
    }

    const rate = await checkRateLimit(clientIp(req));
    if (!rate.success) {
      return Response.json(
        {
          error:
            "Rate limit reached. Try again later, or reach me via the links on the site.",
        },
        { status: 429 },
      );
    }

    const result = streamText({
      model: getModel(),
      system: SYSTEM,
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(3),
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      tools: {
        show_scheduler: tool({
          description:
            "Display Vlad's live availability calendar for scheduling an interview or meeting. Call this whenever the user wants to book time.",
          inputSchema: z.object({}),
          execute: async () => {
            const availability = await getAvailability();
            return { availability };
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse({
      // Errors are masked by default; surface a friendly, non-leaking message
      // (the client renders a fallback bubble on `error`).
      onError: (err: unknown) => {
        console.error("[chat] stream error", err);
        return "This demo hit an error. Try again in a moment, or reach me via the links on the site.";
      },
    });
  } catch (err) {
    console.error("[chat] request failed", err);
    return Response.json(
      { error: "Chat is temporarily unavailable." },
      { status: 503 },
    );
  }
}
