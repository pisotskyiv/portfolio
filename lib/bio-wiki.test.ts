import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

import { getBioPage, BIO_TOPIC_IDS, MAX_PAGE_CHARS } from "./bio-wiki";

const BASE = "https://gist.example/raw";

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("BIO_TOPIC_IDS", () => {
  it("exposes the five topic slugs the gist serves", () => {
    expect(BIO_TOPIC_IDS).toEqual([
      "ctd-work",
      "chef-jul",
      "portfolio-site",
      "learning-projects",
      "career-story",
    ]);
  });
});

describe("getBioPage", () => {
  it("returns null without fetching when BIO_GIST_RAW_BASE is unset", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await expect(getBioPage("ctd-work")).resolves.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetches <base>/<topic>.md with a 300s revalidate", async () => {
    vi.stubEnv("BIO_GIST_RAW_BASE", BASE);
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(new Response("# CTD work\n", { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);

    await expect(getBioPage("ctd-work")).resolves.toBe("# CTD work");
    expect(fetchSpy).toHaveBeenCalledWith(`${BASE}/ctd-work.md`, {
      next: { revalidate: 300 },
    });
  });

  it("strips a trailing slash from the base", async () => {
    vi.stubEnv("BIO_GIST_RAW_BASE", `${BASE}/`);
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(new Response("page", { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);

    await getBioPage("career-story");
    expect(fetchSpy).toHaveBeenCalledWith(
      `${BASE}/career-story.md`,
      expect.anything(),
    );
  });

  it("returns null on a non-OK response", async () => {
    vi.stubEnv("BIO_GIST_RAW_BASE", BASE);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("gone", { status: 404 })),
    );

    await expect(getBioPage("chef-jul")).resolves.toBeNull();
  });

  it("returns null when the fetch throws", async () => {
    vi.stubEnv("BIO_GIST_RAW_BASE", BASE);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    await expect(getBioPage("chef-jul")).resolves.toBeNull();
  });

  it("returns null for blank content", async () => {
    vi.stubEnv("BIO_GIST_RAW_BASE", BASE);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("  \n ", { status: 200 })),
    );

    await expect(getBioPage("portfolio-site")).resolves.toBeNull();
  });

  it("rejects an HTML response (misconfigured non-raw base URL)", async () => {
    vi.stubEnv("BIO_GIST_RAW_BASE", "https://gist.github.com/user/abc123");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("<!DOCTYPE html>\n<html><head></head></html>", {
            status: 200,
          }),
        ),
    );

    await expect(getBioPage("ctd-work")).resolves.toBeNull();
  });

  it("caps oversized pages at MAX_PAGE_CHARS", async () => {
    vi.stubEnv("BIO_GIST_RAW_BASE", BASE);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("x".repeat(MAX_PAGE_CHARS + 500), { status: 200 }),
        ),
    );

    const page = await getBioPage("learning-projects");
    expect(page).toHaveLength(MAX_PAGE_CHARS);
  });
});
