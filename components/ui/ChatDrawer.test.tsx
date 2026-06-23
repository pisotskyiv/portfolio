import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ChatDrawer } from "./ChatDrawer";
import { availability } from "@/lib/availability";
import type { UIMessage } from "ai";

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

const mockSendMessage = vi.fn();
let mockMessages: UIMessage[] = [];
let mockStatus = "ready";
let mockError: Error | undefined;

vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    messages: mockMessages,
    sendMessage: mockSendMessage,
    status: mockStatus,
    error: mockError,
  }),
}));

beforeEach(() => {
  mockSendMessage.mockClear();
  mockMessages = [];
  mockStatus = "ready";
  mockError = undefined;
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

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

  it("shows greeting when no messages", () => {
    render(<ChatDrawer isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/Vlad's AI assistant/i)).toBeInTheDocument();
  });

  it("renders SchedulerCard when tool output available", () => {
    mockMessages = [
      {
        id: "1",
        role: "assistant",
        parts: [
          {
            type: "tool-show_scheduler",
            toolCallId: "tc1",
            state: "output-available",
            output: { availability },
          },
        ],
      },
    ] as unknown as UIMessage[];
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

  it("calls sendMessage with input text on submit", async () => {
    const user = userEvent.setup();
    render(<ChatDrawer isOpen={true} onClose={vi.fn()} />);
    const input = screen.getByRole("textbox", { name: /message/i });
    await user.type(input, "What are your skills?");
    await user.click(screen.getByRole("button", { name: /send/i }));
    expect(mockSendMessage).toHaveBeenCalledWith({ text: "What are your skills?" });
  });

  it("sends suggestion chip prompt on click", async () => {
    const user = userEvent.setup();
    render(<ChatDrawer isOpen={true} onClose={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "What can you do?" }));
    expect(mockSendMessage).toHaveBeenCalledWith({ text: "What can you do?" });
  });

  it("renders disclaimer with LinkedIn link", () => {
    render(<ChatDrawer isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/no data collected/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute(
      "href",
      expect.stringContaining("linkedin.com"),
    );
  });

  it("renders a graceful fallback when the chat errors", () => {
    mockError = new Error("rate limited");
    render(<ChatDrawer isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      /paused or rate-limited/i,
    );
  });

  it("renders an error fallback for a failed tool call, not a spinner", () => {
    mockMessages = [
      {
        id: "1",
        role: "assistant",
        parts: [
          {
            type: "tool-show_scheduler",
            toolCallId: "tc1",
            state: "output-error",
            errorText: "boom",
          },
        ],
      },
    ] as unknown as UIMessage[];
    render(<ChatDrawer isOpen={true} onClose={vi.fn()} />);
    expect(
      screen.getByText(/couldn't load the calendar/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/checking availability/i),
    ).not.toBeInTheDocument();
  });
});
