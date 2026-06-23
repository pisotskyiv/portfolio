import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BookingPanel } from "./BookingPanel";

const signInMock = vi.fn();
vi.mock("next-auth/react", () => ({ signIn: (...a: unknown[]) => signInMock(...a) }));

const publishMock = vi.fn();
vi.mock("@/lib/booking-broadcast", () => ({
  publishBookingResult: (...a: unknown[]) => publishMock(...a),
}));

const SLOT = {
  date: "2026-06-24",
  time: "12:00",
  whenLabel: "Wed Jun 24, 12pm PT",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("BookingPanel — hook order", () => {
  it("can flip from signed-out to signed-in without a hook-order violation", () => {
    const { rerender } = render(<BookingPanel {...SLOT} signedIn={false} />);
    expect(screen.getByRole("button", { name: /sign in with google/i })).toBeInTheDocument();
    rerender(<BookingPanel {...SLOT} signedIn={true} name="Jane" email="jane@example.com" />);
    expect(screen.getByRole("button", { name: /^confirm$/i })).toBeInTheDocument();
  });
});

describe("BookingPanel — signed out", () => {
  it("signs in with Google, returning to this same booking URL", async () => {
    const user = userEvent.setup();
    render(<BookingPanel {...SLOT} signedIn={false} />);

    await user.click(screen.getByRole("button", { name: /sign in with google/i }));
    expect(signInMock).toHaveBeenCalledWith("google", {
      redirectTo: "/book?date=2026-06-24&time=12:00",
    });
    expect(screen.getByRole("link", { name: /linkedin/i })).toBeInTheDocument();
  });
});

describe("BookingPanel — signed in", () => {
  const authed = { ...SLOT, signedIn: true, name: "Jane R", email: "jane@example.com" };
  const TRACKED = `/api/cal-redirect?to=${encodeURIComponent("https://cal/add")}`;
  const REDIRECT_MS = 5000; // = REDIRECT_SECONDS in BookingPanel

  it("books, shows the 'you must finalize' notice and a Continue link, broadcasts success", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ addToCalendarLink: "https://cal/add" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<BookingPanel {...authed} />);
    await user.click(screen.getByRole("button", { name: /^confirm$/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/book",
      expect.objectContaining({ method: "POST" }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      date: "2026-06-24",
      time: "12:00",
    });
    // The visitor is told they must finalize the event themselves.
    expect(await screen.findByText(/must finalize/i)).toBeInTheDocument();
    // The Continue link routes through the tracking redirect, not straight to Google.
    expect(
      screen.getByRole("link", { name: /continue now/i }),
    ).toHaveAttribute("href", TRACKED);
    expect(publishMock).toHaveBeenCalledWith({
      status: "success",
      when: "Wed Jun 24, 12pm PT",
      link: TRACKED,
    });
  });

  it("waits, then follows the finalize link (same-tab) when the countdown elapses", async () => {
    vi.useFakeTimers();
    // jsdom won't let us spy window.location.assign; the panel instead clicks
    // the real "Continue now" link, so assert that navigation that way.
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ addToCalendarLink: "https://cal/add" }),
    }));

    render(<BookingPanel {...authed} />);
    fireEvent.click(screen.getByRole("button", { name: /^confirm$/i }));
    await act(async () => {}); // flush the fetch -> setState chain

    expect(screen.getByText(/must finalize/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /continue now/i })).toHaveAttribute(
      "href",
      TRACKED,
    );
    expect(clickSpy).not.toHaveBeenCalled(); // not before the countdown elapses

    act(() => vi.advanceTimersByTime(REDIRECT_MS));
    expect(clickSpy).toHaveBeenCalled();

    clickSpy.mockRestore();
  });

  it("shows a Google Meet join link when the booking returns one", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        addToCalendarLink: "https://cal/add",
        meetUrl: "https://meet.google.com/abc-defg-hij",
      }),
    }));

    render(<BookingPanel {...authed} />);
    await userEvent.setup().click(screen.getByRole("button", { name: /^confirm$/i }));

    expect(
      await screen.findByRole("link", { name: /join link \(google meet\)/i }),
    ).toHaveAttribute("href", "https://meet.google.com/abc-defg-hij");
  });

  it("shows a 'just taken' message and broadcasts error on a 409", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 409 }));

    render(<BookingPanel {...authed} />);
    await user.click(screen.getByRole("button", { name: /^confirm$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/just taken/i);
    expect(screen.getByRole("link", { name: /linkedin/i })).toBeInTheDocument();
    expect(publishMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error", when: "Wed Jun 24, 12pm PT" }),
    );
  });

  it("handles a network failure with an error and broadcast", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    render(<BookingPanel {...authed} />);
    await user.click(screen.getByRole("button", { name: /^confirm$/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(publishMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error" }),
    );
  });
});
