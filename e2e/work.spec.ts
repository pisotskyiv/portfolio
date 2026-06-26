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

test.describe("Case study — chat is available off the home route", () => {
  test("chat widget is mounted and the nav Contact opens it", async ({
    page,
  }) => {
    await page.goto("/work/ctd-rag-chatbot");
    const fab = page.getByRole("button", { name: "Open chat" });
    // FAB present proves ChatWidget mounts here (it used to live only under the
    // (main) route group, so /work had no chat at all).
    await expect(fab).toBeVisible();

    // Contact dispatches chat:open; the listener attaches post-hydration, so a
    // too-early click is a no-op. Retry until it opens (FAB unmounts when open).
    await expect(async () => {
      await page.getByRole("button", { name: "Contact" }).click();
      await expect(fab).toBeHidden({ timeout: 1000 });
    }).toPass({ timeout: 5000 });
  });
});
