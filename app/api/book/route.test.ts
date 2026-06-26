import { describe, it, expect, vi, beforeEach } from "vitest";

class MockBookingError extends Error {
  constructor(
    public readonly code: "past" | "taken" | "unavailable",
    message: string,
  ) {
    super(message);
  }
}

const authMock = vi.fn();
const bookSlotMock = vi.fn();
const bookingRateMock = vi.fn();

vi.mock("@/auth", () => ({ auth: () => authMock() }));
vi.mock("@/lib/google-calendar", () => ({
  bookSlot: (...args: unknown[]) => bookSlotMock(...args),
  BookingError: MockBookingError,
}));
vi.mock("@/lib/rate-limit", () => ({
  checkBookingRateLimit: () => bookingRateMock(),
}));

function makeRequest(
  body: unknown,
  headers: Record<string, string> = {},
): Request {
  return new Request("http://localhost/api/book", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const VALID = { date: "2030-01-15", time: "09:00" };

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ user: { name: "Jane R", email: "jane@example.com" } });
  bookingRateMock.mockResolvedValue({ success: true, enforced: true });
  bookSlotMock.mockResolvedValue({
    start: "2030-01-15T17:00:00.000Z",
    end: "2030-01-15T18:00:00.000Z",
    addToCalendarLink: "https://calendar.google.com/calendar/render?action=TEMPLATE",
  });
});

describe("POST /api/book", () => {
  it("returns 401 when there is no session", async () => {
    authMock.mockResolvedValue(null);
    const { POST } = await import("./route");
    const res = await POST(makeRequest(VALID));
    expect(res.status).toBe(401);
    expect(bookSlotMock).not.toHaveBeenCalled();
  });

  it("returns 429 when the booking rate limit is exceeded", async () => {
    bookingRateMock.mockResolvedValue({ success: false, enforced: true });
    const { POST } = await import("./route");
    const res = await POST(makeRequest(VALID));
    expect(res.status).toBe(429);
    expect(bookSlotMock).not.toHaveBeenCalled();
  });

  it("returns 400 for a malformed body", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ date: "01/15/2030", time: "9am" }));
    expect(res.status).toBe(400);
    expect(bookSlotMock).not.toHaveBeenCalled();
  });

  it("returns 409 when the slot was just taken", async () => {
    bookSlotMock.mockRejectedValue(new MockBookingError("taken", "taken"));
    const { POST } = await import("./route");
    const res = await POST(makeRequest(VALID));
    expect(res.status).toBe(409);
  });

  it("returns 400 when the slot is in the past", async () => {
    bookSlotMock.mockRejectedValue(new MockBookingError("past", "past"));
    const { POST } = await import("./route");
    const res = await POST(makeRequest(VALID));
    expect(res.status).toBe(400);
  });

  it("returns 400 when the slot is off-grid or out of window", async () => {
    bookSlotMock.mockRejectedValue(
      new MockBookingError("unavailable", "That time isn't an available slot."),
    );
    const { POST } = await import("./route");
    const res = await POST(makeRequest(VALID));
    expect(res.status).toBe(400);
  });

  it("returns 503 on an unexpected failure", async () => {
    bookSlotMock.mockRejectedValue(new Error("calendar down"));
    const { POST } = await import("./route");
    const res = await POST(makeRequest(VALID));
    expect(res.status).toBe(503);
  });

  it("books with the session identity and returns the add-to-calendar link", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest(VALID, { "x-forwarded-for": "5.5.5.5, 1.1.1.1" }));
    expect(res.status).toBe(200);
    expect(bookSlotMock).toHaveBeenCalledWith({
      name: "Jane R",
      email: "jane@example.com",
      date: "2030-01-15",
      time: "09:00",
    });
    const json = await res.json();
    expect(json.addToCalendarLink).toContain("action=TEMPLATE");
  });
});
