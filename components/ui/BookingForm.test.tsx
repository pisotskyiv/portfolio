import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BookingForm } from "./BookingForm";

const useSessionMock = vi.fn();
const signInMock = vi.fn();
vi.mock("next-auth/react", () => ({
  useSession: () => useSessionMock(),
  signIn: (...args: unknown[]) => signInMock(...args),
}));

const baseProps = {
  day: "Monday",
  date: "2030-01-15",
  time: "09:00",
  label: "9am",
  timezone: "PT",
  onCancel: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("BookingForm", () => {
  it("shows a loading state while the session resolves", () => {
    useSessionMock.mockReturnValue({ data: null, status: "loading" });
    render(<BookingForm {...baseProps} />);
    expect(screen.getByText(/checking sign-in/i)).toBeInTheDocument();
  });

  it("prompts Google sign-in and offers a LinkedIn fallback when signed out", async () => {
    const user = userEvent.setup();
    useSessionMock.mockReturnValue({ data: null, status: "unauthenticated" });
    render(<BookingForm {...baseProps} />);

    const signInBtn = screen.getByRole("button", { name: /sign in with google/i });
    expect(screen.getByRole("link", { name: /linkedin/i })).toBeInTheDocument();

    await user.click(signInBtn);
    expect(signInMock).toHaveBeenCalledWith("google");
  });

  it("books on confirm and shows an add-to-calendar link", async () => {
    const user = userEvent.setup();
    useSessionMock.mockReturnValue({
      data: { user: { name: "Jane R", email: "jane@example.com" } },
      status: "authenticated",
    });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        addToCalendarLink: "https://calendar.google.com/calendar/render?action=TEMPLATE",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<BookingForm {...baseProps} />);
    expect(screen.getByText(/booking monday at 9am pt as/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /confirm/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/book",
      expect.objectContaining({ method: "POST" }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toEqual({ date: "2030-01-15", time: "09:00" });

    expect(
      await screen.findByRole("link", { name: /add to your calendar/i }),
    ).toHaveAttribute("href", expect.stringContaining("action=TEMPLATE"));
  });

  it("surfaces a 'just taken' message on a 409", async () => {
    const user = userEvent.setup();
    useSessionMock.mockReturnValue({
      data: { user: { name: "Jane R", email: "jane@example.com" } },
      status: "authenticated",
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 409 }));

    render(<BookingForm {...baseProps} />);
    await user.click(screen.getByRole("button", { name: /confirm/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/just taken/i);
  });

  it("falls back to email when the slot has no bookable date", async () => {
    const user = userEvent.setup();
    useSessionMock.mockReturnValue({
      data: { user: { name: "Jane R", email: "jane@example.com" } },
      status: "authenticated",
    });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<BookingForm {...baseProps} date={undefined} />);
    await user.click(screen.getByRole("button", { name: /confirm/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/email/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
