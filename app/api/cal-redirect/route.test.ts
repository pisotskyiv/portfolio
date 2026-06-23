import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

const VALID_TARGET =
  "https://calendar.google.com/calendar/render?action=TEMPLATE&dates=20300115T170000Z/20300115T180000Z";

function call(to?: string): Response {
  const url = to
    ? `http://localhost/api/cal-redirect?to=${encodeURIComponent(to)}`
    : "http://localhost/api/cal-redirect";
  return GET(new Request(url));
}

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});
});

describe("GET /api/cal-redirect", () => {
  it("302s to a valid Google Calendar render link", () => {
    const res = call(VALID_TARGET);
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(VALID_TARGET);
  });

  it("rejects a missing target", () => {
    expect(call().status).toBe(400);
  });

  it("rejects a malformed target", () => {
    expect(call("not a url").status).toBe(400);
  });

  it("rejects a non-Google host (open-redirect guard)", () => {
    expect(call("https://evil.example.com/calendar/render").status).toBe(400);
  });

  it("rejects the right host but a different path", () => {
    expect(call("https://calendar.google.com/phish").status).toBe(400);
  });

  it("rejects a non-https scheme", () => {
    expect(call("http://calendar.google.com/calendar/render").status).toBe(400);
  });
});
