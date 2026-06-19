import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Hero } from "./Hero";

describe("Hero", () => {
  it("shows name as heading", () => {
    render(<Hero />);
    expect(
      screen.getByRole("heading", { name: /Vlad Pisotski/i }),
    ).toBeInTheDocument();
  });

  it("shows role as eyebrow text", () => {
    render(<Hero />);
    expect(screen.getByText(/Software Engineer/i)).toBeInTheDocument();
  });

  it("shows short pitch", () => {
    render(<Hero />);
    expect(screen.getByText(/RAG pipelines/i)).toBeInTheDocument();
  });

  it("View Work links to work section", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: "View Work" })).toHaveAttribute(
      "href",
      "#work",
    );
  });

  it("has GitHub link", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: /GitHub/i })).toHaveAttribute(
      "href",
      expect.stringContaining("github.com"),
    );
  });

  it("has LinkedIn link", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: /LinkedIn/i })).toHaveAttribute(
      "href",
      expect.stringContaining("linkedin.com"),
    );
  });
});
