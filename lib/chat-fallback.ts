import type { LanguageModel } from "ai";

// Provider failover policy for the chat route. The pure parts (breaker, ordering,
// error classification) are SDK-free so they unit-test without network or mocks;
// createFallbackModel wraps real provider models.
//
// Shape of the real failure: the default provider (Gemini free tier) returns
// HTTP 429 when its quota is exhausted, and that quota stays blown for ~a minute.
//
// Two layers cooperate:
//  1. createFallbackModel — a model wrapper whose doStream/doGenerate try each
//     provider in order. A provider that REJECTS at connect time (Gemini's 429
//     throws before any token) is caught and the next provider is used in the
//     SAME request, so the user only ever sees a loading state then the answer —
//     no mid-stream error, no stutter.
//  2. createBreaker — an in-memory circuit breaker. Once a provider trips, the
//     ordering skips it for a cooldown so we don't waste a doomed Gemini attempt
//     (~350ms) on every request during the outage window.

/** A resolved language model (the union the AI SDK accepts, minus the bare
 * model-id string form). */
export type ResolvedModel = Exclude<LanguageModel, string>;

export type ChatProvider = "gemini" | "anthropic" | "openai";

export const FALLBACK_COOLDOWN_MS = 60_000;

export interface Breaker {
  isDown(provider: ChatProvider): boolean;
  trip(provider: ChatProvider): void;
  reset(provider: ChatProvider): void;
  /**
   * Returns true exactly once when a tripped provider's cooldown has lapsed,
   * clearing the entry. Lets the caller log the recovery (switch back to the
   * primary) without spamming a log on every subsequent request.
   */
  takeRecovery(provider: ChatProvider): boolean;
}

/**
 * In-memory, best-effort circuit breaker. On serverless each instance keeps its
 * own state (not shared across lambdas, reset on cold start) — that is fine here:
 * the goal is to spare a warm instance from hammering a quota-exhausted provider.
 */
export function createBreaker(
  now: () => number = Date.now,
  cooldownMs: number = FALLBACK_COOLDOWN_MS,
): Breaker {
  const downUntil = new Map<ChatProvider, number>();
  return {
    isDown(provider) {
      const until = downUntil.get(provider);
      return until !== undefined && now() < until;
    },
    trip(provider) {
      downUntil.set(provider, now() + cooldownMs);
    },
    reset(provider) {
      downUntil.delete(provider);
    },
    takeRecovery(provider) {
      const until = downUntil.get(provider);
      if (until !== undefined && now() >= until) {
        downUntil.delete(provider);
        return true;
      }
      return false;
    },
  };
}

/**
 * The ordered list of providers to attempt this request. A primary in its
 * cooldown is skipped (we go straight to the fallback); otherwise the primary
 * leads and the fallback backs it up. Always returns at least one provider.
 */
export function orderProviders(opts: {
  primary: ChatProvider;
  fallback: ChatProvider | null;
  isDown: (provider: ChatProvider) => boolean;
}): ChatProvider[] {
  const { primary, fallback, isDown } = opts;
  const order: ChatProvider[] = [];
  if (!isDown(primary)) order.push(primary);
  if (fallback && fallback !== primary) order.push(fallback);
  // Primary down with no usable fallback: it's still the only option.
  if (order.length === 0) order.push(primary);
  return order;
}

function statusOf(err: unknown): number | undefined {
  if (err && typeof err === "object" && "statusCode" in err) {
    const status = (err as { statusCode?: unknown }).statusCode;
    if (typeof status === "number") return status;
  }
  return undefined;
}

/**
 * True when a primary failure is transient and worth failing over (429 rate /
 * quota, 5xx, or a network/unknown error). False for 4xx auth/bad-request
 * errors — those are config bugs and must surface rather than silently
 * double-bill the fallback.
 */
export function isTransientProviderError(err: unknown): boolean {
  const status = statusOf(err);
  if (status !== undefined) {
    return status === 429 || status >= 500;
  }
  // RetryError-style wrappers expose the underlying attempts in `errors[]`;
  // classify by the last one.
  if (
    err &&
    typeof err === "object" &&
    Array.isArray((err as { errors?: unknown[] }).errors)
  ) {
    const errors = (err as { errors: unknown[] }).errors;
    const last = errors[errors.length - 1];
    if (last && last !== err) return isTransientProviderError(last);
  }
  // No status and no wrapped cause: network/timeout/unknown → fail over.
  return true;
}

/**
 * Wrap an ordered list of provider models into one model. Its doStream/doGenerate
 * try each provider in turn; if one REJECTS with a transient error (Gemini's 429
 * throws before any token), the next is tried within the same call so the failure
 * never reaches the client. A non-transient error (auth/bad-request) is rethrown
 * immediately rather than silently failing over to the paid provider.
 *
 * Implemented as a Proxy over the primary model so every other member
 * (specificationVersion, provider, modelId, supportedUrls, ...) passes through
 * untouched and the wrapper stays agnostic to the model spec version.
 */
export function createFallbackModel(
  models: ResolvedModel[],
  opts: {
    /** Defaults to isTransientProviderError. */
    shouldFailover?: (err: unknown) => boolean;
    /** Called when provider at `failedIndex` fails over to the next one. */
    onFailover?: (failedIndex: number, err: unknown) => void;
  } = {},
): ResolvedModel {
  if (models.length === 0) {
    throw new Error("createFallbackModel: at least one model is required");
  }
  const shouldFailover = opts.shouldFailover ?? isTransientProviderError;

  async function attempt(
    method: "doStream" | "doGenerate",
    options: unknown,
  ): Promise<unknown> {
    let lastErr: unknown;
    for (let i = 0; i < models.length; i++) {
      try {
        const model = models[i] as unknown as Record<
          "doStream" | "doGenerate",
          (o: unknown) => PromiseLike<unknown>
        >;
        return await model[method](options);
      } catch (err) {
        lastErr = err;
        if (i === models.length - 1 || !shouldFailover(err)) throw err;
        opts.onFailover?.(i, err);
      }
    }
    throw lastErr;
  }

  return new Proxy(models[0], {
    get(target, prop, receiver) {
      if (prop === "doStream" || prop === "doGenerate") {
        const method = prop;
        return (options: unknown) => attempt(method, options);
      }
      return Reflect.get(target, prop, receiver);
    },
  }) as ResolvedModel;
}
