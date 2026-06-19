import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Projects } from "./Projects";

describe("Projects", () => {
  it("renders section with id work", () => {
    render(<Projects />);
    expect(document.querySelector("#work")).toBeInTheDocument();
  });

  it("renders Selected Work heading", () => {
    render(<Projects />);
    expect(screen.getByText(/selected work/i)).toBeInTheDocument();
  });

  it("renders CTD RAG Chatbot title", () => {
    render(<Projects />);
    expect(screen.getByText("CTD RAG Chatbot")).toBeInTheDocument();
  });

  it("renders Chef Jul title", () => {
    render(<Projects />);
    expect(screen.getByText("Chef Jul")).toBeInTheDocument();
  });

  it("renders tech tags for first project", () => {
    render(<Projects />);
    expect(screen.getByText("Next.js")).toBeInTheDocument();
    expect(screen.getByText("MongoDB")).toBeInTheDocument();
  });

  it("renders project descriptions", () => {
    render(<Projects />);
    expect(screen.getByText(/retrieval-augmented generation pipeline/i)).toBeInTheDocument();
    expect(screen.getByText(/AI-powered meal planner/i)).toBeInTheDocument();
  });

  it("renders Chef Jul highlight badge", () => {
    render(<Projects />);
    expect(screen.getByText("2nd Place, MetLife Hackathon 2025")).toBeInTheDocument();
  });

  it("renders View links pointing to github", () => {
    render(<Projects />);
    const links = screen.getAllByRole("link", { name: /view/i });
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => {
      expect(link).toHaveAttribute("href");
    });
  });
});
