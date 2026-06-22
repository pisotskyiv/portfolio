import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// system-prompt.ts imports "server-only" (throws outside an RSC build). Stub it
// so the loader is unit-testable, same pattern as google-calendar.test.ts.
vi.mock("server-only", () => ({}));

import { getSystemPrompt, FALLBACK_PROMPT } from "./system-prompt";

const REMOTE = "## About Vlad\nHosted persona from the gist.";

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getSystemPrompt", () => {
  it("returns the minimal committed fallback when PROMPT_URL is unset", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await expect(getSystemPrompt()).resolves.toBe(FALLBACK_PROMPT);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetches the hosted prompt and revalidates on a TTL", async () => {
    vi.stubEnv("PROMPT_URL", "https://gist.example/raw/prompt.md");
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(`${REMOTE}\n`, { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchSpy);

    await expect(getSystemPrompt()).resolves.toBe(REMOTE);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://gist.example/raw/prompt.md",
      { next: { revalidate: 300 } },
    );
  });

  it("falls back when the fetch is non-OK", async () => {
    vi.stubEnv("PROMPT_URL", "https://gist.example/raw/prompt.md");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("nope", { status: 404 })),
    );

    await expect(getSystemPrompt()).resolves.toBe(FALLBACK_PROMPT);
  });

  it("falls back when the fetch throws", async () => {
    vi.stubEnv("PROMPT_URL", "https://gist.example/raw/prompt.md");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    await expect(getSystemPrompt()).resolves.toBe(FALLBACK_PROMPT);
  });

  it("falls back when the hosted prompt is blank", async () => {
    vi.stubEnv("PROMPT_URL", "https://gist.example/raw/prompt.md");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("   \n  ", { status: 200 })),
    );

    await expect(getSystemPrompt()).resolves.toBe(FALLBACK_PROMPT);
  });
});
