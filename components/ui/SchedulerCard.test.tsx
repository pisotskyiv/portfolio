import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SchedulerCard } from "./SchedulerCard";
import { availability } from "@/lib/availability";

describe("SchedulerCard", () => {
  it("renders all day abbreviations", () => {
    render(<SchedulerCard availability={availability} />);
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText("Thu")).toBeInTheDocument();
    expect(screen.getByText("Fri")).toBeInTheDocument();
  });

  it("renders available time slots as buttons", () => {
    render(<SchedulerCard availability={availability} />);
    expect(
      screen.getByRole("button", { name: /Monday at 9am/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Wednesday at 11am/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Thursday at 3pm/i }),
    ).toBeInTheDocument();
  });

  it("shows dash for days with no slots", () => {
    render(<SchedulerCard availability={availability} />);
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it("calls onSlotClick with day and time when slot clicked", async () => {
    const user = userEvent.setup();
    const onSlotClick = vi.fn();
    render(<SchedulerCard availability={availability} onSlotClick={onSlotClick} />);
    await user.click(screen.getByRole("button", { name: /Monday at 9am/i }));
    expect(onSlotClick).toHaveBeenCalledWith("Monday", "09:00");
  });

  it("renders email link", () => {
    render(<SchedulerCard availability={availability} />);
    expect(screen.getByRole("link", { name: /email/i })).toBeInTheDocument();
  });

  it("renders timezone label", () => {
    render(<SchedulerCard availability={availability} timezone="PST" />);
    expect(screen.getByText("PST")).toBeInTheDocument();
  });
});
