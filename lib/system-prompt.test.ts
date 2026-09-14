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
  it("returns fallback, not degraded, when neither URL is set", async () => {
    // Unconfigured (e.g. local dev without secrets) is a normal state, not a
    // failure — nothing was reachable-but-broken, so no user-facing alert.
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await expect(getSystemPrompt()).resolves.toEqual({
      prompt: FALLBACK_PROMPT,
      degraded: false,
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetches both URLs and concatenates them, not degraded", async () => {
    vi.stubEnv("SYSTEM_PROMPT_URL", "https://gist.example/raw/system.md");
    vi.stubEnv("PERSONA_URL", "https://gist.example/raw/persona.md");
    const fetchSpy = vi.fn().mockImplementation((url: string) => {
      const body = url.includes("system") ? `${SYSTEM_PART}\n` : `${PERSONA_PART}\n`;
      return Promise.resolve(new Response(body, { status: 200 }));
    });
    vi.stubGlobal("fetch", fetchSpy);

    const result = await getSystemPrompt();
    expect(result).toEqual({
      prompt: `${SYSTEM_PART}\n\n${PERSONA_PART}`,
      degraded: false,
    });
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

  it("uses only the persona when SYSTEM_PROMPT_URL is unset, not degraded", async () => {
    vi.stubEnv("PERSONA_URL", "https://gist.example/raw/persona.md");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(`${PERSONA_PART}\n`, { status: 200 })),
    );

    await expect(getSystemPrompt()).resolves.toEqual({
      prompt: PERSONA_PART,
      degraded: false,
    });
  });

  it("uses only the system prompt when PERSONA_URL is unset, not degraded", async () => {
    vi.stubEnv("SYSTEM_PROMPT_URL", "https://gist.example/raw/system.md");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(`${SYSTEM_PART}\n`, { status: 200 })),
    );

    await expect(getSystemPrompt()).resolves.toEqual({
      prompt: SYSTEM_PART,
      degraded: false,
    });
  });

  it("falls back and flags degraded when a configured fetch returns non-OK", async () => {
    vi.stubEnv("SYSTEM_PROMPT_URL", "https://gist.example/raw/system.md");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("nope", { status: 404 })),
    );

    await expect(getSystemPrompt()).resolves.toEqual({
      prompt: FALLBACK_PROMPT,
      degraded: true,
    });
  });

  it("falls back and flags degraded when a configured fetch throws", async () => {
    vi.stubEnv("PERSONA_URL", "https://gist.example/raw/persona.md");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    await expect(getSystemPrompt()).resolves.toEqual({
      prompt: FALLBACK_PROMPT,
      degraded: true,
    });
  });

  it("flags degraded when both fetches return blank content", async () => {
    vi.stubEnv("SYSTEM_PROMPT_URL", "https://gist.example/raw/system.md");
    vi.stubEnv("PERSONA_URL", "https://gist.example/raw/persona.md");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("   \n  ", { status: 200 })),
    );

    await expect(getSystemPrompt()).resolves.toEqual({
      prompt: FALLBACK_PROMPT,
      degraded: true,
    });
  });

  it("rejects an HTML response (misconfigured non-raw gist URL) and flags degraded", async () => {
    // A gist PAGE url (missing /raw/) returns the GitHub HTML document with
    // status 200 — that must never become the system prompt.
    vi.stubEnv("SYSTEM_PROMPT_URL", "https://gist.github.com/user/abc123");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("\n\n<!DOCTYPE html>\n<html lang=\"en\"><head>...</head></html>", {
            status: 200,
          }),
        ),
    );

    await expect(getSystemPrompt()).resolves.toEqual({
      prompt: FALLBACK_PROMPT,
      degraded: true,
    });
  });

  it("flags degraded on a partial failure even though the other part filled the prompt", async () => {
    // One gist dead, the other fine: the prompt isn't the generic fallback,
    // but it's still missing half its intended content — the user should
    // still be told, not just silently get a persona-only (or system-only) prompt.
    vi.stubEnv("SYSTEM_PROMPT_URL", "https://gist.example/raw/system.md");
    vi.stubEnv("PERSONA_URL", "https://gist.example/raw/persona.md");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) =>
        url.includes("system")
          ? Promise.resolve(new Response(`${SYSTEM_PART}\n`, { status: 200 }))
          : Promise.resolve(new Response("dead", { status: 404 })),
      ),
    );

    await expect(getSystemPrompt()).resolves.toEqual({
      prompt: SYSTEM_PART,
      degraded: true,
    });
  });
});
