import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Projects } from "./Projects";

describe("Projects", () => {
  it("renders section with id work", () => {
    render(<Projects />);
    expect(document.querySelector("#work")).toBeInTheDocument();
  });

  it("renders Selected Work as a level-2 heading", () => {
    render(<Projects />);
    expect(
      screen.getByRole("heading", { level: 2, name: /selected work/i }),
    ).toBeInTheDocument();
  });

  it("renders CTD RAG Chatbot title", () => {
    render(<Projects />);
    expect(screen.getByText("CTD RAG Chatbot")).toBeInTheDocument();
  });

  it("renders Chef Jul title", () => {
    render(<Projects />);
    expect(screen.getByText("Chef Jul")).toBeInTheDocument();
  });

  it("renders portfolio title", () => {
    render(<Projects />);
    expect(screen.getByText("This Portfolio")).toBeInTheDocument();
  });

  it("renders LangGraph RAG Citation Engine title", () => {
    render(<Projects />);
    expect(screen.getByText("LangGraph RAG Citation Engine")).toBeInTheDocument();
  });

  it("renders tech tags", () => {
    render(<Projects />);
    expect(screen.getAllByText("Next.js").length).toBeGreaterThan(0);
    expect(screen.getAllByText("MongoDB").length).toBeGreaterThan(0);
    expect(screen.getByText("LangGraph")).toBeInTheDocument();
  });

  it("renders project descriptions", () => {
    render(<Projects />);
    expect(
      screen.getByText(/retrieval-augmented generation pipeline/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/AI-powered meal planner/i)).toBeInTheDocument();
  });

  it("renders Chef Jul highlight badge", () => {
    render(<Projects />);
    expect(
      screen.getByText("2nd Place, MetLife Hackathon 2025"),
    ).toBeInTheDocument();
  });

  it("renders case study link for CTD RAG chatbot", () => {
    render(<Projects />);
    expect(
      screen.getByRole("link", { name: /read ctd rag chatbot case study/i }),
    ).toHaveAttribute("href", "/work/ctd-rag-chatbot");
  });

  it("renders live link for Chef Jul", () => {
    render(<Projects />);
    expect(
      screen.getByRole("link", { name: /view chef jul live/i }),
    ).toHaveAttribute("href", "https://ctd-hackaton.web.app/");
  });

  it("renders github link for Chef Jul", () => {
    render(<Projects />);
    expect(
      screen.getByRole("link", { name: /view chef jul on github/i }),
    ).toHaveAttribute("href", "https://github.com/ctd-hackaton/front-end");
  });

  it("renders case study link for portfolio", () => {
    render(<Projects />);
    expect(
      screen.getByRole("link", { name: /read this portfolio case study/i }),
    ).toHaveAttribute("href", "/work/portfolio");
  });

  it("renders github link for portfolio", () => {
    render(<Projects />);
    expect(
      screen.getByRole("link", { name: /view this portfolio on github/i }),
    ).toHaveAttribute("href", "https://github.com/vlad-pisotskyi/portfolio");
  });

  it("does not render a github link for CTD RAG chatbot", () => {
    render(<Projects />);
    expect(
      screen.queryByRole("link", { name: /view ctd rag chatbot on github/i }),
    ).not.toBeInTheDocument();
  });

  it("renders LangGraph as a sub-entry within the CTD RAG card", () => {
    render(<Projects />);
    const ctdCard = screen.getByText("CTD RAG Chatbot").closest("li")!;
    expect(
      within(ctdCard).getByText("LangGraph RAG Citation Engine"),
    ).toBeInTheDocument();
  });

  it("renders 3 top-level project cards", () => {
    render(<Projects />);
    const outerList = screen.getByText("CTD RAG Chatbot").closest("li")
      ?.parentElement;
    expect(outerList?.children.length).toBe(3);
  });

  it("renders LangGraph case study link within CTD RAG card", () => {
    render(<Projects />);
    const ctdCard = screen.getByText("CTD RAG Chatbot").closest("li")!;
    expect(
      within(ctdCard).getByRole("link", {
        name: /read langgraph rag citation engine case study/i,
      }),
    ).toHaveAttribute("href", "/work/ctd-rag-chatbot");
  });
});
