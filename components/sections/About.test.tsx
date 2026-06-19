import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { About } from "./About";

describe("About", () => {
  it("renders a labelled section landmark", () => {
    render(<About />);
    expect(screen.getByRole("region", { name: /About/i })).toBeInTheDocument();
  });

  it("renders section heading", () => {
    render(<About />);
    expect(
      screen.getByRole("heading", { name: /About/i }),
    ).toBeInTheDocument();
  });

  it("renders bio text", () => {
    render(<About />);
    expect(screen.getByText(/Langfuse/i)).toBeInTheDocument();
  });

  it("renders education entries", () => {
    render(<About />);
    expect(screen.getByText(/Hack Reactor/i)).toBeInTheDocument();
    expect(screen.getByText(/React, Node\.js, Python/i)).toBeInTheDocument();
  });

  it("renders location", () => {
    render(<About />);
    expect(screen.getByText(/San Francisco/i)).toBeInTheDocument();
  });

  it("has resume download link", () => {
    render(<About />);
    expect(screen.getByRole("link", { name: /resume/i })).toHaveAttribute(
      "href",
      expect.stringContaining("resume"),
    );
  });
});
