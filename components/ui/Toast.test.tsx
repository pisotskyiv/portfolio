import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Toast } from "./Toast";

describe("Toast", () => {
  it("announces its message via a polite live region", () => {
    render(<Toast variant="success" message="Booked Wed Jun 24" onDismiss={vi.fn()} />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveTextContent("Booked Wed Jun 24");
  });

  it("renders an optional action link to a new tab", () => {
    render(
      <Toast
        variant="success"
        message="Booked"
        actionHref="https://calendar.google.com/x"
        actionLabel="Add to calendar"
        onDismiss={vi.fn()}
      />,
    );
    const link = screen.getByRole("link", { name: /add to calendar/i });
    expect(link).toHaveAttribute("href", "https://calendar.google.com/x");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("calls onDismiss when the dismiss button is clicked", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Toast variant="error" message="Booking failed" onDismiss={onDismiss} />);
    await user.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
