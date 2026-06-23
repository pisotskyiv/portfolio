import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { getAvailability } from "@/lib/google-calendar";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSystemPrompt } from "@/lib/system-prompt";
import { MAX_INPUT_CHARS } from "@/lib/chat-limits";

// googleapis (in the scheduler tool) is Node-only, and we stream — pin Node
// and cap the request so the route can't hang or run on Edge.
export const runtime = "nodejs";
export const maxDuration = 30;

// Cheap abuse/cost guards applied before the model is ever touched.
// MAX_INPUT_CHARS is shared with the client input cap via lib/chat-limits.
const MAX_MESSAGES = 25;
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
  if (provider === "gemini") {
    const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
    console.log(`[chat] provider=gemini model=${model}`);
    const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
    return google(model);
  }
  const model = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
  console.log(`[chat] provider=anthropic model=${model}`);
  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropic(model);
}

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
      system: await getSystemPrompt(),
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
