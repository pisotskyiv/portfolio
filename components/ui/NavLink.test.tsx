import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { NavLink } from "./NavLink";

describe("NavLink", () => {
  it("renders children as a link", () => {
    render(<NavLink href="#work">Work</NavLink>);
    expect(screen.getByRole("link", { name: "Work" })).toBeInTheDocument();
  });

  it("uses the given href", () => {
    render(<NavLink href="#about">About</NavLink>);
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "#about",
    );
  });

  it("internal link has no target or rel", () => {
    render(<NavLink href="#contact">Contact</NavLink>);
    const link = screen.getByRole("link", { name: "Contact" });
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("external link opens in new tab with noreferrer", () => {
    render(
      <NavLink href="https://github.com" external>
        GitHub
      </NavLink>,
    );
    const link = screen.getByRole("link", { name: "GitHub" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });
});
