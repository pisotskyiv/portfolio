import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AuthProvider } from "./AuthProvider";

// SessionProvider opens a network call to /api/auth/session on mount; stub it to
// a passthrough so the wrapper can be tested in isolation.
vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("AuthProvider", () => {
  it("renders its children inside the session context", () => {
    render(
      <AuthProvider>
        <span>child content</span>
      </AuthProvider>,
    );
    expect(screen.getByText("child content")).toBeInTheDocument();
  });
});
