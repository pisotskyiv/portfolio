import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Contact } from "./Contact";

describe("Contact", () => {
  it("renders a labelled section landmark", () => {
    render(<Contact />);
    expect(screen.getByRole("region", { name: /Contact/i })).toBeInTheDocument();
  });

  it("renders section heading", () => {
    render(<Contact />);
    expect(screen.getByRole("heading", { name: /Contact/i })).toBeInTheDocument();
  });

  it("has email link", () => {
    render(<Contact />);
    expect(screen.getByRole("link", { name: /email/i })).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:"),
    );
  });

  it("has GitHub link", () => {
    render(<Contact />);
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      expect.stringContaining("github.com"),
    );
  });

  it("has LinkedIn link", () => {
    render(<Contact />);
    expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute(
      "href",
      expect.stringContaining("linkedin.com"),
    );
  });
});
