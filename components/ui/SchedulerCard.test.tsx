import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, afterEach } from "vitest";
import { SchedulerCard } from "./SchedulerCard";
import type { DaySchedule } from "@/lib/availability";
import type { BookingResult } from "@/lib/booking-broadcast";

let capturedBookingCallback: ((r: BookingResult) => void) | null = null;

vi.mock("@/lib/booking-broadcast", () => ({
  subscribeBookingResult: (cb: (r: BookingResult) => void) => {
    capturedBookingCallback = cb;
    return () => {};
  },
}));

const availability: DaySchedule[] = [
  {
    day: "Monday",
    short: "Mon",
    date: "2026-06-22",
    slots: [
      { time: "12:00", label: "12pm" },
      { time: "13:00", label: "1pm" },
      { time: "14:00", label: "2pm" },
    ],
  },
  { day: "Tuesday", short: "Tue", date: "2026-06-23", slots: [] },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SchedulerCard", () => {
  it("renders day abbreviations and the timezone label", () => {
    render(<SchedulerCard availability={availability} timezone="PT" />);
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
    expect(screen.getByText("PT")).toBeInTheDocument();
  });

  it("renders slots as booking links to /book that target a new tab", () => {
    render(<SchedulerCard availability={availability} />);
    const link = screen.getByRole("link", { name: /Book Monday at 12pm/i });
    expect(link).toHaveAttribute("href", "/book?date=2026-06-22&time=12:00");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
  });

  it("shows a dash for a day with no slots", () => {
    render(<SchedulerCard availability={availability} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("opens booking in a new tab on a plain click", async () => {
    const user = userEvent.setup();
    // A real browser returns null from window.open when "noopener" is passed,
    // even on success — so the card must open without it (and sever opener
    // itself), and a truthy return must NOT show the blocked-popup fallback.
    const fakeWin = {} as Window;
    const openSpy = vi.spyOn(window, "open").mockReturnValue(fakeWin);
    render(<SchedulerCard availability={availability} />);

    await user.click(screen.getByRole("link", { name: /Book Monday at 1pm/i }));
    expect(openSpy).toHaveBeenCalledWith("/book?date=2026-06-22&time=13:00", "_blank");
    expect(openSpy.mock.calls[0]).toHaveLength(2); // no "noopener" arg
    expect(fakeWin.opener).toBeNull();
    expect(screen.queryByText(/popup blocked/i)).not.toBeInTheDocument();
  });

  it("falls back to LinkedIn when the popup is blocked", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "open").mockReturnValue(null);
    render(<SchedulerCard availability={availability} />);

    await user.click(screen.getByRole("link", { name: /Book Monday at 12pm/i }));
    expect(screen.getByText(/popup blocked/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /linkedin/i })).toBeInTheDocument();
  });

  it("renders dates under day abbreviations", () => {
    render(<SchedulerCard availability={availability} />);
    expect(screen.getByText("Jun 22")).toBeInTheDocument();
    expect(screen.getByText("Jun 23")).toBeInTheDocument();
  });

  it("prev button is disabled at week 0", () => {
    render(<SchedulerCard availability={availability} />);
    expect(screen.getByRole("button", { name: /previous week/i })).toBeDisabled();
  });

  it("next button is enabled at week 0", () => {
    render(<SchedulerCard availability={availability} />);
    expect(screen.getByRole("button", { name: /next week/i })).not.toBeDisabled();
  });

  it("next button fetches week 1 data and enables prev", async () => {
    const user = userEvent.setup();
    const nextAvailability: DaySchedule[] = [
      { day: "Monday", short: "Mon", date: "2026-06-29", slots: [] },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ availability: nextAvailability }),
      }),
    );

    render(<SchedulerCard availability={availability} />);
    await user.click(screen.getByRole("button", { name: /next week/i }));

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith("/api/availability?week=1"),
    );
    expect(screen.getByRole("button", { name: /previous week/i })).not.toBeDisabled();
  });

  it("refetches current week when a booking success is broadcast", async () => {
    const refreshed: DaySchedule[] = [
      { day: "Monday", short: "Mon", date: "2026-06-22", slots: [] },
      { day: "Tuesday", short: "Tue", date: "2026-06-23", slots: [] },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ availability: refreshed }),
      }),
    );

    render(<SchedulerCard availability={availability} />);
    expect(screen.getByRole("link", { name: /Book Monday at 12pm/i })).toBeInTheDocument();

    act(() =>
      capturedBookingCallback!({
        status: "success",
        when: "Mon Jun 22, 12pm PT",
        link: "https://cal/x",
      }),
    );

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith("/api/availability?week=0"),
    );
    expect(screen.queryByRole("link", { name: /Book Monday at 12pm/i })).not.toBeInTheDocument();
  });

  it("next button is disabled and limit message shows at max week offset", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ availability: [] }),
      }),
    );

    render(<SchedulerCard availability={availability} />);
    const nextBtn = screen.getByRole("button", { name: /next week/i });

    for (let i = 0; i < 4; i++) {
      await user.click(nextBtn);
      await waitFor(() => expect(fetch).toHaveBeenCalledTimes(i + 1));
    }

    expect(nextBtn).toBeDisabled();
    expect(screen.getByText(/booking available up to 4 weeks ahead/i)).toBeInTheDocument();
  });
});
