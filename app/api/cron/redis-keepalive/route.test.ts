import { describe, it, expect, vi, beforeEach } from "vitest";

const setMock = vi.fn();

vi.mock("@upstash/redis", () => ({
  Redis: class {
    constructor(_config: unknown) {
      void _config;
    }
    set = setMock;
  },
}));

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/cron/redis-keepalive", { headers });
}

const AUTH = { authorization: "Bearer test-secret" };

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  process.env.CRON_SECRET = "test-secret";
  process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "token";
  setMock.mockResolvedValue("OK");
});

describe("GET /api/cron/redis-keepalive", () => {
  it("rejects a request without the cron secret", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    expect(setMock).not.toHaveBeenCalled();
  });

  it("rejects a request with the wrong secret", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest({ authorization: "Bearer nope" }));
    expect(res.status).toBe(401);
    expect(setMock).not.toHaveBeenCalled();
  });

  it("rejects everything when CRON_SECRET is not configured", async () => {
    delete process.env.CRON_SECRET;
    const { GET } = await import("./route");
    const res = await GET(makeRequest({ authorization: "Bearer undefined" }));
    expect(res.status).toBe(401);
    expect(setMock).not.toHaveBeenCalled();
  });

  it("writes a heartbeat key and returns ok", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest(AUTH));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(setMock).toHaveBeenCalledWith("keepalive:last", expect.any(String));
  });

  it("returns 500 and logs when Upstash is not configured", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    delete process.env.UPSTASH_REDIS_REST_URL;
    const { GET } = await import("./route");
    const res = await GET(makeRequest(AUTH));
    expect(res.status).toBe(500);
    expect(setMock).not.toHaveBeenCalled();
    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining("[cron] redis keepalive"));
    errSpy.mockRestore();
  });

  it("returns 502 and logs when Redis is unreachable", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    setMock.mockRejectedValue(new TypeError("fetch failed"));
    const { GET } = await import("./route");
    const res = await GET(makeRequest(AUTH));
    expect(res.status).toBe(502);
    expect(errSpy).toHaveBeenCalledWith(
      expect.stringContaining("[cron] redis keepalive failed"),
      expect.any(TypeError),
    );
    errSpy.mockRestore();
  });
});
