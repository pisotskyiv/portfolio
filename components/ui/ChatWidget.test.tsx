import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ChatWidget } from "./ChatWidget";

vi.mock("./ChatFab", () => ({
  ChatFab: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick}>Open chat</button>
  ),
}));

vi.mock("./ChatDrawer", () => ({
  ChatDrawer: ({ isOpen }: { isOpen: boolean; onClose: () => void }) => (
    <div data-testid="drawer" data-open={String(isOpen)} />
  ),
}));

vi.mock("./BookingNotifier", () => ({
  BookingNotifier: () => null,
}));

describe("ChatWidget", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows FAB when closed", () => {
    render(<ChatWidget />);
    expect(screen.getByRole("button", { name: "Open chat" })).toBeInTheDocument();
  });

  it("hides FAB and opens drawer when chat:open event fires", async () => {
    render(<ChatWidget />);
    expect(screen.getByRole("button", { name: "Open chat" })).toBeInTheDocument();

    await act(async () => {
      window.dispatchEvent(new Event("chat:open"));
    });

    expect(screen.queryByRole("button", { name: "Open chat" })).not.toBeInTheDocument();
    expect(screen.getByTestId("drawer")).toHaveAttribute("data-open", "true");
  });
});
