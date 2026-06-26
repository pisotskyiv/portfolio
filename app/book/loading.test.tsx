import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BookLoading from "./loading";

describe("BookLoading", () => {
  it("renders without crashing", () => {
    const { container } = render(<BookLoading />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders muted heading", () => {
    render(<BookLoading />);
    expect(screen.getByRole("heading", { name: /schedule a call/i })).toBeInTheDocument();
  });

  it("renders disabled confirm button", () => {
    render(<BookLoading />);
    expect(screen.getByRole("button", { name: /confirm/i })).toBeDisabled();
  });
});
