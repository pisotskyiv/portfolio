import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Nav } from "./Nav";

describe("Nav", () => {
  it("renders inside a header landmark", () => {
    render(<Nav />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders a labelled navigation landmark", () => {
    render(<Nav />);
    expect(
      screen.getByRole("navigation", { name: "Main navigation" }),
    ).toBeInTheDocument();
  });

  it("shows site name as a link", () => {
    render(<Nav />);
    expect(
      screen.getByRole("link", { name: "Vlad Pisotski" }),
    ).toBeInTheDocument();
  });

  it("links Work to work section", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute(
      "href",
      "#work",
    );
  });

  it("links About to about section", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "#about",
    );
  });

  it("links Contact to contact section", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "#contact",
    );
  });

  it("has GitHub link with correct URL", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      expect.stringContaining("github.com"),
    );
  });
});
