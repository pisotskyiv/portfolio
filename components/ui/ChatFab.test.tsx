import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChatFab } from "./ChatFab";

describe("ChatFab", () => {
  it("renders with aria-label 'Open chat' when closed", () => {
    render(<ChatFab isOpen={false} onClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Open chat" })).toBeInTheDocument();
  });

  it("renders with aria-label 'Close chat' when open", () => {
    render(<ChatFab isOpen={true} onClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Close chat" })).toBeInTheDocument();
  });

  it("sets aria-expanded false when closed", () => {
    render(<ChatFab isOpen={false} onClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Open chat" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("sets aria-expanded true when open", () => {
    render(<ChatFab isOpen={true} onClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Close chat" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ChatFab isOpen={false} onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: "Open chat" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
