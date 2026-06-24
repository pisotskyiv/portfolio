import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChatFab } from "./ChatFab";

describe("ChatFab", () => {
  it("renders with aria-label 'Open chat'", () => {
    render(<ChatFab onClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Open chat" })).toBeInTheDocument();
  });

  it("sets aria-expanded false", () => {
    render(<ChatFab onClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Open chat" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("sets aria-controls to chat-drawer", () => {
    render(<ChatFab onClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Open chat" })).toHaveAttribute(
      "aria-controls",
      "chat-drawer",
    );
  });

  it("shows Chat label text", () => {
    render(<ChatFab onClick={vi.fn()} />);
    expect(screen.getByText("Chat")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ChatFab onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: "Open chat" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
