import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

import { getSystemPrompt, FALLBACK_PROMPT } from "./system-prompt";

const SYSTEM_PART = "## Instructions\nBe helpful and concise.";
const PERSONA_PART = "## About Vlad\nHosted persona from the gist.";

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getSystemPrompt", () => {
  it("returns fallback when neither URL is set", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await expect(getSystemPrompt()).resolves.toBe(FALLBACK_PROMPT);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetches both URLs and concatenates them", async () => {
    vi.stubEnv("SYSTEM_PROMPT_URL", "https://gist.example/raw/system.md");
    vi.stubEnv("PERSONA_URL", "https://gist.example/raw/persona.md");
    const fetchSpy = vi.fn().mockImplementation((url: string) => {
      const body = url.includes("system") ? `${SYSTEM_PART}\n` : `${PERSONA_PART}\n`;
      return Promise.resolve(new Response(body, { status: 200 }));
    });
    vi.stubGlobal("fetch", fetchSpy);

    const result = await getSystemPrompt();
    expect(result).toBe(`${SYSTEM_PART}\n\n${PERSONA_PART}`);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://gist.example/raw/system.md",
      { next: { revalidate: 300 } },
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://gist.example/raw/persona.md",
      { next: { revalidate: 300 } },
    );
  });

  it("uses only the persona when SYSTEM_PROMPT_URL is unset", async () => {
    vi.stubEnv("PERSONA_URL", "https://gist.example/raw/persona.md");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(`${PERSONA_PART}\n`, { status: 200 })),
    );

    await expect(getSystemPrompt()).resolves.toBe(PERSONA_PART);
  });

  it("uses only the system prompt when PERSONA_URL is unset", async () => {
    vi.stubEnv("SYSTEM_PROMPT_URL", "https://gist.example/raw/system.md");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(`${SYSTEM_PART}\n`, { status: 200 })),
    );

    await expect(getSystemPrompt()).resolves.toBe(SYSTEM_PART);
  });

  it("falls back when a fetch returns non-OK and the other is unset", async () => {
    vi.stubEnv("SYSTEM_PROMPT_URL", "https://gist.example/raw/system.md");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("nope", { status: 404 })),
    );

    await expect(getSystemPrompt()).resolves.toBe(FALLBACK_PROMPT);
  });

  it("falls back when a fetch throws and the other is unset", async () => {
    vi.stubEnv("PERSONA_URL", "https://gist.example/raw/persona.md");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    await expect(getSystemPrompt()).resolves.toBe(FALLBACK_PROMPT);
  });

  it("falls back when both fetches return blank content", async () => {
    vi.stubEnv("SYSTEM_PROMPT_URL", "https://gist.example/raw/system.md");
    vi.stubEnv("PERSONA_URL", "https://gist.example/raw/persona.md");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("   \n  ", { status: 200 })),
    );

    await expect(getSystemPrompt()).resolves.toBe(FALLBACK_PROMPT);
  });
});
