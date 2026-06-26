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

  it("links Work to the home work section (works from any route)", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute(
      "href",
      "/#work",
    );
  });

  it("links About to the home about section (works from any route)", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/#about",
    );
  });

  it("Contact is a button (not a link) that opens the chat", () => {
    render(<Nav />);
    expect(screen.queryByRole("link", { name: "Contact" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Contact" })).toBeInTheDocument();
  });

  it("Contact button has aria-haspopup dialog and aria-controls chat-drawer", () => {
    render(<Nav />);
    const btn = screen.getByRole("button", { name: "Contact" });
    expect(btn).toHaveAttribute("aria-haspopup", "dialog");
    expect(btn).toHaveAttribute("aria-controls", "chat-drawer");
  });

  it("renders a theme toggle button", () => {
    render(<Nav />);
    expect(
      screen.getByRole("button", { name: /switch to (dark|light) theme/i }),
    ).toBeInTheDocument();
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
