import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { Nav } from "./Nav";

describe("Nav", () => {
  afterEach(() => {
    Object.defineProperty(window, "scrollY", {
      value: 0,
      configurable: true,
      writable: true,
    });
  });

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
      screen.getByRole("link", { name: "Vlad Pisotskyi" }),
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

  it("header is transparent before scrolling", () => {
    render(<Nav />);
    expect(screen.getByRole("banner")).toHaveClass("border-transparent");
  });

  it("header shows background after scrolling", () => {
    Object.defineProperty(window, "scrollY", {
      value: 50,
      configurable: true,
      writable: true,
    });
    render(<Nav />);
    fireEvent.scroll(window);
    expect(screen.getByRole("banner")).toHaveClass("backdrop-blur-sm");
  });
});
