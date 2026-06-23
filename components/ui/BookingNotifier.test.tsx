import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BookingResult } from "@/lib/booking-broadcast";

// AnimatePresence defers unmount until the exit animation resolves, which jsdom
// never drives — make it a passthrough so removal is synchronous in tests.
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

import { BookingNotifier } from "./BookingNotifier";

let captured: ((r: BookingResult) => void) | null = null;
const unsubscribe = vi.fn();

vi.mock("@/lib/booking-broadcast", () => ({
  subscribeBookingResult: (cb: (r: BookingResult) => void) => {
    captured = cb;
    return unsubscribe;
  },
}));

beforeEach(() => {
  captured = null;
  unsubscribe.mockClear();
});

function emit(result: BookingResult) {
  act(() => captured!(result));
}

describe("BookingNotifier", () => {
  it("shows nothing until a result arrives", () => {
    render(<BookingNotifier />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("toasts a success with an add-to-calendar link", () => {
    render(<BookingNotifier />);
    emit({ status: "success", when: "Wed Jun 24, 12pm PT", link: "https://cal/x" });

    const toast = screen.getByRole("status");
    expect(toast).toHaveTextContent(/wed jun 24, 12pm pt/i);
    expect(screen.getByRole("link", { name: /add to calendar/i })).toHaveAttribute(
      "href",
      "https://cal/x",
    );
  });

  it("toasts a failure with a LinkedIn fallback link", () => {
    render(<BookingNotifier />);
    emit({ status: "error", when: "Wed Jun 24, 12pm PT" });

    expect(screen.getByRole("status")).toHaveTextContent(/didn't go through|failed/i);
    expect(screen.getByRole("link", { name: /linkedin/i })).toBeInTheDocument();
  });

  it("dismisses on the close button", async () => {
    const user = userEvent.setup();
    render(<BookingNotifier />);
    emit({ status: "success", when: "Wed Jun 24, 12pm PT", link: "https://cal/x" });

    await user.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("unsubscribes on unmount", () => {
    const { unmount } = render(<BookingNotifier />);
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
