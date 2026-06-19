import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FragmentedPortrait } from "./FragmentedPortrait";

describe("FragmentedPortrait", () => {
  it("renders with accessible role and label", () => {
    render(<FragmentedPortrait src="/portrait.jpg" alt="Vlad Pisotski" />);
    expect(
      screen.getByRole("img", { name: "Vlad Pisotski" }),
    ).toBeInTheDocument();
  });

  it("renders 20 tiles", () => {
    const { container } = render(
      <FragmentedPortrait src="/portrait.jpg" alt="Vlad Pisotski" />,
    );
    const tiles = container.querySelectorAll("[style*='background-image']");
    expect(tiles).toHaveLength(20);
  });
});
