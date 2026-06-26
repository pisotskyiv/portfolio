import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const CASE_STUDIES = [
  { slug: "ctd-rag-chatbot", title: "CTD RAG Chatbot" },
  { slug: "chef-jul", title: "Chef Jul" },
  { slug: "portfolio", title: "This Portfolio" },
];

for (const { slug, title } of CASE_STUDIES) {
  test.describe(`Case study: ${title}`, () => {
    test("renders the project title as h1", async ({ page }) => {
      await page.goto(`/work/${slug}`);
      await expect(
        page.getByRole("heading", { name: title, level: 1 }),
      ).toBeVisible();
    });

    test("has nav", async ({ page }) => {
      await page.goto(`/work/${slug}`);
      await expect(
        page.getByRole("navigation", { name: "Main navigation" }),
      ).toBeVisible();
    });

    test("passes axe accessibility scan", async ({ page }) => {
      await page.goto(`/work/${slug}`);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });

    test("no horizontal overflow at 375px", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(`/work/${slug}`);
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(375);
    });

    test("no horizontal overflow at 1280px", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`/work/${slug}`);
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(1280);
    });
  });
}
