import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { UIMessage } from "ai";
import { checkRateLimit } from "@/lib/rate-limit";

const streamTextMock = vi.fn();

vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn() }));
vi.mock("@/lib/google-calendar", () => ({
  getAvailability: vi.fn().mockResolvedValue([]),
}));
vi.mock("@/lib/system-prompt", () => ({
  getSystemPrompt: vi.fn().mockResolvedValue("SYSTEM"),
}));
vi.mock("@ai-sdk/anthropic", () => ({ createAnthropic: () => () => "model" }));
vi.mock("@ai-sdk/openai", () => ({ createOpenAI: () => () => "model" }));
vi.mock("@ai-sdk/google", () => ({ createGoogleGenerativeAI: () => () => "model" }));
vi.mock("ai", () => ({
  streamText: (...args: unknown[]) => streamTextMock(...args),
  convertToModelMessages: (m: unknown) => m,
  stepCountIs: (n: number) => n,
  tool: (config: unknown) => config,
}));

const rateLimitMock = checkRateLimit as Mock;

function userMessage(text: string): UIMessage {
  return {
    id: "m1",
    role: "user",
    parts: [{ type: "text", text }],
  } as unknown as UIMessage;
}

function makeRequest(
  messages: UIMessage[],
  headers: Record<string, string> = {},
): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify({ messages }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.CHAT_ENABLED;
  rateLimitMock.mockResolvedValue({
    success: true,
    remaining: 9,
    limit: 10,
    reset: 0,
    enforced: true,
  });
  streamTextMock.mockReturnValue({
    toUIMessageStreamResponse: () => new Response("stream", { status: 200 }),
  });
});

describe("POST /api/chat", () => {
  it("returns 503 when the chat kill switch is set", async () => {
    process.env.CHAT_ENABLED = "false";
    const { POST } = await import("./route");
    const res = await POST(makeRequest([userMessage("hi")]));
    expect(res.status).toBe(503);
    expect(streamTextMock).not.toHaveBeenCalled();
  });

  it("returns 413 when there are too many messages", async () => {
    const messages = Array.from({ length: 26 }, () => userMessage("hi"));
    const { POST } = await import("./route");
    const res = await POST(makeRequest(messages));
    expect(res.status).toBe(413);
    expect(streamTextMock).not.toHaveBeenCalled();
  });

  it("returns 413 when the input is too long", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest([userMessage("x".repeat(4001))]));
    expect(res.status).toBe(413);
    expect(streamTextMock).not.toHaveBeenCalled();
  });

  it("returns 429 when the rate limit is exceeded", async () => {
    rateLimitMock.mockResolvedValue({
      success: false,
      remaining: 0,
      limit: 10,
      reset: 0,
      enforced: true,
    });
    const { POST } = await import("./route");
    const res = await POST(makeRequest([userMessage("hi")]));
    expect(res.status).toBe(429);
    expect(streamTextMock).not.toHaveBeenCalled();
  });

  it("streams a response on the happy path with an output cap", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest([userMessage("What are your skills?")]));
    expect(res.status).toBe(200);
    expect(streamTextMock).toHaveBeenCalledOnce();
    expect(streamTextMock.mock.calls[0][0]).toMatchObject({
      maxOutputTokens: 800,
      system: "SYSTEM",
    });
  });

  it("streams successfully when AI_PROVIDER=gemini", async () => {
    process.env.AI_PROVIDER = "gemini";
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
    const { POST } = await import("./route");
    const res = await POST(makeRequest([userMessage("hi")]));
    expect(res.status).toBe(200);
    expect(streamTextMock).toHaveBeenCalledOnce();
    delete process.env.AI_PROVIDER;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  });

  it("rate-limits on the forwarded client IP", async () => {
    const { POST } = await import("./route");
    await POST(
      makeRequest([userMessage("hi")], { "x-forwarded-for": "9.9.9.9, 1.1.1.1" }),
    );
    expect(rateLimitMock).toHaveBeenCalledWith("9.9.9.9");
  });
});
