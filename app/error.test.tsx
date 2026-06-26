import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AppError from "./error";

describe("AppError", () => {
  const error = new Error("boom");

  it("renders error heading", () => {
    render(<AppError error={error} reset={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /something went wrong/i })).toBeInTheDocument();
  });

  it("renders try again button", () => {
    render(<AppError error={error} reset={vi.fn()} />);
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("calls reset when try again clicked", async () => {
    const reset = vi.fn();
    const user = userEvent.setup();
    render(<AppError error={error} reset={reset} />);
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it("renders reload link", () => {
    render(<AppError error={error} reset={vi.fn()} />);
    expect(screen.getByRole("link", { name: /reload page/i })).toHaveAttribute("href", "/");
  });
});
