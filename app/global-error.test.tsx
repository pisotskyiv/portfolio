import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import GlobalError from "./global-error";

describe("GlobalError", () => {
  const error = new Error("boom");

  it("renders error heading", () => {
    render(<GlobalError error={error} reset={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /something went wrong/i })).toBeInTheDocument();
  });

  it("renders retry button", () => {
    render(<GlobalError error={error} reset={vi.fn()} />);
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("calls reset when retry clicked", async () => {
    const reset = vi.fn();
    const user = userEvent.setup();
    render(<GlobalError error={error} reset={reset} />);
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
