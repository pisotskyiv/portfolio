import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const authMock = vi.fn();
vi.mock("@/auth", () => ({ auth: () => authMock() }));
vi.mock("next-auth/react", () => ({ signIn: vi.fn() }));
vi.mock("@/lib/booking-broadcast", () => ({ publishBookingResult: vi.fn() }));

import BookPage from "./page";

function renderPage(params: { date?: string; time?: string }) {
  return BookPage({ searchParams: Promise.resolve(params) }).then((ui) => render(ui));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("BookPage", () => {
  it("shows a fallback for a malformed slot link", async () => {
    await renderPage({ date: "nope", time: "9am" });
    expect(screen.getByText(/missing or malformed/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /linkedin/i })).toBeInTheDocument();
    expect(authMock).not.toHaveBeenCalled();
  });

  it("prompts sign-in when there is no session", async () => {
    authMock.mockResolvedValue(null);
    await renderPage({ date: "2026-06-24", time: "12:00" });
    expect(
      screen.getByRole("button", { name: /sign in with google/i }),
    ).toBeInTheDocument();
  });

  it("shows the confirm panel with the session identity when signed in", async () => {
    authMock.mockResolvedValue({ user: { name: "Jane R", email: "jane@example.com" } });
    await renderPage({ date: "2026-06-24", time: "12:00" });
    expect(screen.getByText(/booking .* with/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane R/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^confirm$/i })).toBeInTheDocument();
  });
});
