import { describe, it, expect } from "vitest";
import { projects } from "./projects";

describe("projects data integrity", () => {
  it("has at least one project", () => {
    expect(projects.length).toBeGreaterThan(0);
  });

  it("has unique slugs", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(projects)("$slug has all required fields populated", (project) => {
    expect(project.slug).toMatch(/^[a-z0-9-]+$/);
    expect(project.title.trim()).not.toBe("");
    expect(project.role.trim()).not.toBe("");
    expect(project.description.trim()).not.toBe("");
    expect(project.bullets.length).toBeGreaterThan(0);
    expect(project.bullets.every((b) => b.trim().length > 0)).toBe(true);
    expect(project.tech.length).toBeGreaterThan(0);
  });

  it.each(projects)("$slug github link is a valid https URL when present", (project) => {
    if (!project.github) return;
    expect(() => new URL(project.github!)).not.toThrow();
    expect(project.github.startsWith("https://")).toBe(true);
  });

  it.each(projects)("$slug live link is a valid https URL when present", (project) => {
    if (!project.live) return;
    expect(() => new URL(project.live!)).not.toThrow();
    expect(project.live.startsWith("https://")).toBe(true);
  });

  it.each(projects)("$slug caseStudy is a root-relative path when present", (project) => {
    if (!project.caseStudy) return;
    expect(project.caseStudy.startsWith("/")).toBe(true);
  });

  it.each(projects)("$slug has at least one link (github, live, or caseStudy)", (project) => {
    expect(project.github || project.live || project.caseStudy).toBeTruthy();
  });

  it("LangGraph is not a top-level project", () => {
    const topLevelSlugs = projects.map((p) => p.slug);
    expect(topLevelSlugs).not.toContain("langgraph-rag-citation-engine");
  });

  it("CTD RAG has LangGraph as a child with its case study link", () => {
    const ctdRag = projects.find((p) => p.slug === "ctd-rag-chatbot")!;
    expect(ctdRag.children).toBeDefined();
    const langGraph = ctdRag.children!.find(
      (c) => c.slug === "langgraph-rag-citation-engine",
    );
    expect(langGraph).toBeDefined();
    expect(langGraph!.caseStudy).toBe("/work/ctd-rag-chatbot");
  });
});
