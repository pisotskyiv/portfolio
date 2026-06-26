import { test, expect } from "@playwright/test";

test.describe("About section", () => {
  test("section landmark is present and labelled", async ({ page }) => {
    await page.goto("/");
    const section = page.getByRole("region", { name: /about/i });
    await expect(section).toBeAttached();
  });

  test("shows About heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /about/i })).toBeVisible();
  });

  test("shows resume download link", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /download resume/i }),
    ).toBeVisible();
  });

  test("shows Education section", async ({ page }) => {
    await page.goto("/");
    // "Code the Dream" also appears in the bio text — use Hack Reactor (education-only) to avoid ambiguity
    await expect(page.getByText(/Hack Reactor/i)).toBeVisible();
  });

  test("shows location", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/San Francisco/i)).toBeVisible();
  });
});

test.describe("Projects section", () => {
  test("shows Selected Work heading", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Selected Work/i }),
    ).toBeVisible();
  });

  test("renders all project cards", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /CTD RAG Chatbot/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Chef Jul/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /This Portfolio/i }),
    ).toBeVisible();
  });

  test("each project with a case study has a case study link", async ({ page }) => {
    await page.goto("/");
    const caseStudyLinks = page.getByRole("link", { name: /case study/i });
    await expect(caseStudyLinks).toHaveCount(3);
  });

  test("Chef Jul card shows hackathon highlight", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/MetLife Hackathon/i)).toBeVisible();
  });
});
