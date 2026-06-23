import { describe, it, expect, vi, beforeEach } from "vitest";

const limitMock = vi.fn();

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn(() => "sliding-window");
    limit = limitMock;
  },
}));

vi.mock("@upstash/redis", () => ({
  Redis: class {
    constructor(_config: unknown) {
      void _config;
    }
  },
}));

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.resetModules();
    limitMock.mockReset();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.VERCEL_ENV;
  });

  it("fails open (allows, unenforced) when Upstash is not configured outside production", async () => {
    const { checkRateLimit } = await import("./rate-limit");
    const res = await checkRateLimit("1.2.3.4");
    expect(res.success).toBe(true);
    expect(res.enforced).toBe(false);
    expect(limitMock).not.toHaveBeenCalled();
  });

  it("fails closed (blocks, unenforced) in production when Upstash is not configured", async () => {
    process.env.VERCEL_ENV = "production";
    const { checkRateLimit } = await import("./rate-limit");
    const res = await checkRateLimit("1.2.3.4");
    expect(res.success).toBe(false);
    expect(res.enforced).toBe(false);
    expect(limitMock).not.toHaveBeenCalled();
  });

  it("blocks when the limit is exceeded", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    limitMock.mockResolvedValue({
      success: false,
      remaining: 0,
      limit: 10,
      reset: 123,
    });
    const { checkRateLimit } = await import("./rate-limit");
    const res = await checkRateLimit("1.2.3.4");
    expect(res.success).toBe(false);
    expect(res.enforced).toBe(true);
    expect(limitMock).toHaveBeenCalledWith("1.2.3.4");
  });

  it("allows when under the limit", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    limitMock.mockResolvedValue({
      success: true,
      remaining: 9,
      limit: 10,
      reset: 123,
    });
    const { checkRateLimit } = await import("./rate-limit");
    const res = await checkRateLimit("1.2.3.4");
    expect(res.success).toBe(true);
    expect(res.enforced).toBe(true);
  });
});

describe("checkBookingRateLimit", () => {
  beforeEach(() => {
    vi.resetModules();
    limitMock.mockReset();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.VERCEL_ENV;
  });

  it("fails open (allows, unenforced) when Upstash is not configured outside production", async () => {
    const { checkBookingRateLimit } = await import("./rate-limit");
    const res = await checkBookingRateLimit("1.2.3.4");
    expect(res.success).toBe(true);
    expect(res.enforced).toBe(false);
    expect(limitMock).not.toHaveBeenCalled();
  });

  it("fails closed (blocks, unenforced) in production when Upstash is not configured", async () => {
    process.env.VERCEL_ENV = "production";
    const { checkBookingRateLimit } = await import("./rate-limit");
    const res = await checkBookingRateLimit("1.2.3.4");
    expect(res.success).toBe(false);
    expect(res.enforced).toBe(false);
    expect(limitMock).not.toHaveBeenCalled();
  });

  it("blocks when the booking limit is exceeded", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    limitMock.mockResolvedValue({ success: false, remaining: 0, limit: 5, reset: 1 });
    const { checkBookingRateLimit } = await import("./rate-limit");
    const res = await checkBookingRateLimit("1.2.3.4");
    expect(res.success).toBe(false);
    expect(res.enforced).toBe(true);
    expect(limitMock).toHaveBeenCalledWith("1.2.3.4");
  });
});
