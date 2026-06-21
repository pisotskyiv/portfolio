import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SchedulerCard } from "./SchedulerCard";
import { availability } from "@/lib/availability";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signIn: vi.fn(),
}));

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
      screen.getByRole("button", { name: /Monday at 12pm/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Wednesday at 1pm/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Friday at 2pm/i }),
    ).toBeInTheDocument();
  });

  it("shows dash for a day with no slots", () => {
    render(
      <SchedulerCard availability={[{ day: "Monday", short: "Mon", slots: [] }]} />,
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("calls onSlotClick with day and time when slot clicked", async () => {
    const user = userEvent.setup();
    const onSlotClick = vi.fn();
    render(<SchedulerCard availability={availability} onSlotClick={onSlotClick} />);
    await user.click(screen.getByRole("button", { name: /Monday at 12pm/i }));
    expect(onSlotClick).toHaveBeenCalledWith("Monday", "12:00");
  });

  it("reveals the inline booking form when a slot is clicked without an override", async () => {
    const user = userEvent.setup();
    render(<SchedulerCard availability={availability} />);
    await user.click(screen.getByRole("button", { name: /Monday at 12pm/i }));
    expect(
      screen.getByRole("button", { name: /sign in with google/i }),
    ).toBeInTheDocument();
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
