import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChatDrawer } from "./ChatDrawer";

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: (allProps: Record<string, unknown>) => {
      const { initial, animate, exit, transition, children, ...props } = allProps;
      void [initial, animate, exit, transition];
      return (
        <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>
          {children as React.ReactNode}
        </div>
      );
    },
  },
}));

describe("ChatDrawer", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<ChatDrawer isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders dialog with heading when open", () => {
    render(<ChatDrawer isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Chat with Vlad")).toBeInTheDocument();
  });

  it("renders demo messages", () => {
    render(<ChatDrawer isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/schedule an interview/i)).toBeInTheDocument();
  });

  it("renders SchedulerCard inside assistant message", () => {
    render(<ChatDrawer isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("Schedule a Call")).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ChatDrawer isOpen={true} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Close chat" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders message input", () => {
    render(<ChatDrawer isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole("textbox", { name: /message/i })).toBeInTheDocument();
  });
});
