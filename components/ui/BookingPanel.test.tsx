import { render, screen, act, fireEvent } from "@testing-library/react";
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

  it("confirms, shows the add-to-calendar link, and broadcasts success", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ addToCalendarLink: "https://cal/add" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { ...window, close: vi.fn() });

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
    expect(
      await screen.findByRole("link", { name: /add to your calendar/i }),
    ).toHaveAttribute("href", "https://cal/add");
    expect(publishMock).toHaveBeenCalledWith({
      status: "success",
      when: "Wed Jun 24, 12pm PT",
      link: "https://cal/add",
    });
  });

  it("auto-closes the tab 2 seconds after a successful booking", async () => {
    const closeMock = vi.fn();
    // Use fake timers before rendering so the useEffect setTimeout is controlled
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ addToCalendarLink: "https://cal/add" }),
    }));
    vi.stubGlobal("window", { ...window, close: closeMock });

    render(<BookingPanel {...authed} />);

    // fireEvent.click is synchronous — avoids userEvent's internal timer usage
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^confirm$/i }));
      // Drain the microtask queue (fetch mock + state updates) without real timers
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(closeMock).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(closeMock).toHaveBeenCalledOnce();
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
