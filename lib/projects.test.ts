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

  it.each(projects)("$slug github link is a valid https URL", (project) => {
    expect(() => new URL(project.github)).not.toThrow();
    expect(project.github.startsWith("https://")).toBe(true);
  });
});
