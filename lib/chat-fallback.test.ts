import { describe, it, expect, vi } from "vitest";
import {
  createBreaker,
  orderProviders,
  createFallbackModel,
  isTransientProviderError,
  FALLBACK_COOLDOWN_MS,
  type ResolvedModel,
} from "./chat-fallback";

/** A minimal fake provider model whose doStream/doGenerate resolve or reject. */
function fakeModel(
  id: string,
  behavior: { stream?: () => Promise<unknown>; generate?: () => Promise<unknown> },
): ResolvedModel {
  return {
    specificationVersion: "v2",
    provider: id,
    modelId: id,
    supportedUrls: {},
    doStream: behavior.stream ?? (() => Promise.resolve(`${id}:stream`)),
    doGenerate: behavior.generate ?? (() => Promise.resolve(`${id}:generate`)),
  } as unknown as ResolvedModel;
}

function callDoStream(model: ResolvedModel): Promise<unknown> {
  return (model as unknown as { doStream: (o: unknown) => Promise<unknown> }).doStream({});
}

describe("createBreaker", () => {
  it("reports a provider as up until it is tripped", () => {
    const breaker = createBreaker(() => 0);
    expect(breaker.isDown("gemini")).toBe(false);
    breaker.trip("gemini");
    expect(breaker.isDown("gemini")).toBe(true);
  });

  it("recovers after the cooldown window passes", () => {
    let t = 0;
    const breaker = createBreaker(() => t);
    breaker.trip("gemini");
    t = FALLBACK_COOLDOWN_MS - 1;
    expect(breaker.isDown("gemini")).toBe(true);
    t = FALLBACK_COOLDOWN_MS;
    expect(breaker.isDown("gemini")).toBe(false);
  });

  it("tracks providers independently and can be reset", () => {
    const breaker = createBreaker(() => 0);
    breaker.trip("gemini");
    expect(breaker.isDown("gemini")).toBe(true);
    expect(breaker.isDown("anthropic")).toBe(false);
    breaker.reset("gemini");
    expect(breaker.isDown("gemini")).toBe(false);
  });
});

describe("takeRecovery", () => {
  it("signals recovery exactly once after the cooldown lapses", () => {
    let t = 0;
    const breaker = createBreaker(() => t);
    breaker.trip("gemini");

    // Still cooling down → no recovery signal.
    t = FALLBACK_COOLDOWN_MS - 1;
    expect(breaker.takeRecovery("gemini")).toBe(false);

    // Cooldown lapsed → recovery signalled once, then cleared.
    t = FALLBACK_COOLDOWN_MS;
    expect(breaker.takeRecovery("gemini")).toBe(true);
    expect(breaker.takeRecovery("gemini")).toBe(false);
  });

  it("returns false for a provider that was never tripped", () => {
    const breaker = createBreaker(() => 1_000_000);
    expect(breaker.takeRecovery("gemini")).toBe(false);
  });
});

describe("orderProviders", () => {
  const isDownNone = () => false;

  it("leads with the primary and backs it with the fallback", () => {
    expect(
      orderProviders({ primary: "gemini", fallback: "anthropic", isDown: isDownNone }),
    ).toEqual(["gemini", "anthropic"]);
  });

  it("skips the primary while it is in cooldown", () => {
    expect(
      orderProviders({
        primary: "gemini",
        fallback: "anthropic",
        isDown: (p) => p === "gemini",
      }),
    ).toEqual(["anthropic"]);
  });

  it("returns just the primary when there is no fallback", () => {
    expect(
      orderProviders({ primary: "anthropic", fallback: null, isDown: isDownNone }),
    ).toEqual(["anthropic"]);
  });

  it("still returns the primary if it is down with no fallback", () => {
    expect(
      orderProviders({ primary: "gemini", fallback: null, isDown: () => true }),
    ).toEqual(["gemini"]);
  });
});

describe("createFallbackModel", () => {
  it("returns the first model's result when it succeeds (no failover)", async () => {
    const onFailover = vi.fn();
    const model = createFallbackModel(
      [
        fakeModel("gemini", { stream: () => Promise.resolve("gemini-ok") }),
        fakeModel("anthropic", {}),
      ],
      { onFailover },
    );
    await expect(callDoStream(model)).resolves.toBe("gemini-ok");
    expect(onFailover).not.toHaveBeenCalled();
  });

  it("fails over to the next model on a transient (429) reject", async () => {
    const onFailover = vi.fn();
    const model = createFallbackModel(
      [
        fakeModel("gemini", {
          stream: () => Promise.reject({ statusCode: 429 }),
        }),
        fakeModel("anthropic", {
          stream: () => Promise.resolve("anthropic-ok"),
        }),
      ],
      { onFailover },
    );
    await expect(callDoStream(model)).resolves.toBe("anthropic-ok");
    expect(onFailover).toHaveBeenCalledWith(0, { statusCode: 429 });
  });

  it("does NOT fail over on a non-transient (401) reject", async () => {
    const onFailover = vi.fn();
    const anthropicStream = vi.fn(() => Promise.resolve("anthropic-ok"));
    const model = createFallbackModel(
      [
        fakeModel("gemini", {
          stream: () => Promise.reject({ statusCode: 401 }),
        }),
        fakeModel("anthropic", { stream: anthropicStream }),
      ],
      { onFailover },
    );
    await expect(callDoStream(model)).rejects.toEqual({ statusCode: 401 });
    expect(anthropicStream).not.toHaveBeenCalled();
    expect(onFailover).not.toHaveBeenCalled();
  });

  it("rethrows the last error when every provider fails", async () => {
    const model = createFallbackModel([
      fakeModel("gemini", { stream: () => Promise.reject({ statusCode: 429 }) }),
      fakeModel("anthropic", {
        stream: () => Promise.reject({ statusCode: 500 }),
      }),
    ]);
    await expect(callDoStream(model)).rejects.toEqual({ statusCode: 500 });
  });

  it("passes through non-call members from the primary model", () => {
    const model = createFallbackModel([
      fakeModel("gemini", {}),
      fakeModel("anthropic", {}),
    ]);
    expect(model.provider).toBe("gemini");
    expect(model.modelId).toBe("gemini");
  });

  it("throws when given no models", () => {
    expect(() => createFallbackModel([])).toThrow();
  });
});

describe("isTransientProviderError", () => {
  it("treats 429 quota/rate errors as transient", () => {
    expect(isTransientProviderError({ statusCode: 429 })).toBe(true);
  });

  it("treats 5xx as transient", () => {
    expect(isTransientProviderError({ statusCode: 503 })).toBe(true);
  });

  it("does NOT fail over on auth / bad-request errors", () => {
    expect(isTransientProviderError({ statusCode: 401 })).toBe(false);
    expect(isTransientProviderError({ statusCode: 403 })).toBe(false);
    expect(isTransientProviderError({ statusCode: 400 })).toBe(false);
    expect(isTransientProviderError({ statusCode: 404 })).toBe(false);
  });

  it("unwraps a RetryError-style wrapper and classifies the last attempt", () => {
    const retryError = {
      reason: "maxRetriesExceeded",
      errors: [{ statusCode: 429 }, { statusCode: 429 }],
    };
    expect(isTransientProviderError(retryError)).toBe(true);

    const wrappedAuth = { errors: [{ statusCode: 401 }] };
    expect(isTransientProviderError(wrappedAuth)).toBe(false);
  });

  it("fails over on network/unknown errors with no status", () => {
    expect(isTransientProviderError(new Error("fetch failed"))).toBe(true);
  });
});
