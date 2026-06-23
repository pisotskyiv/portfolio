import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, afterEach } from "vitest";
import { SchedulerCard } from "./SchedulerCard";
import type { DaySchedule } from "@/lib/availability";

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
    const openSpy = vi.spyOn(window, "open").mockReturnValue({} as Window);
    render(<SchedulerCard availability={availability} />);

    await user.click(screen.getByRole("link", { name: /Book Monday at 1pm/i }));
    expect(openSpy).toHaveBeenCalledWith(
      "/book?date=2026-06-22&time=13:00",
      "_blank",
      "noopener",
    );
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

  it("renders the email fallback link", () => {
    render(<SchedulerCard availability={availability} />);
    expect(screen.getByRole("link", { name: /email/i })).toBeInTheDocument();
  });
});
