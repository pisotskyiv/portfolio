import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ContactFallback } from "./ContactFallback";
import { siteConfig } from "@/lib/site";

describe("ContactFallback", () => {
  it("links to LinkedIn, opening in a new tab", () => {
    render(<ContactFallback />);
    const link = screen.getByRole("link", { name: /linkedin/i });
    expect(link).toHaveAttribute("href", siteConfig.links.linkedin);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
  });

  it("renders the default message and accepts an override", () => {
    const { rerender } = render(<ContactFallback />);
    expect(screen.getByText(/reach out directly/i)).toBeInTheDocument();

    rerender(<ContactFallback message="Popup blocked — can't open booking." />);
    expect(screen.getByText(/popup blocked/i)).toBeInTheDocument();
  });
});
