import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Home page", () => {
  test("nav shows site name and section links", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(nav.getByRole("link", { name: "Vlad Pisotskyi" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Work" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "About" })).toBeVisible();
    await expect(nav.getByRole("button", { name: "Contact" })).toBeVisible();
  });

  test("nav has GitHub link", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav.getByRole("link", { name: "GitHub" })).toBeVisible();
  });

  test("hero shows name heading and role", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Vlad Pisotskyi/i }),
    ).toBeVisible();
    await expect(page.getByText(/Software Engineer/i).first()).toBeVisible();
  });

  test("hero has View Work CTA linking to work section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "View Work" })).toHaveAttribute(
      "href",
      "#work",
    );
  });

  test("hero has LinkedIn link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /LinkedIn/i })).toBeVisible();
  });

  test("skip-to-content link is present and focusable", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  });

  test("passes axe accessibility scan", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("Home page — responsive", () => {
  test("renders without horizontal overflow at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });

  test("nav links visible at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    // Contact and GitHub are intentionally hidden below the `sm` breakpoint
    // (`hidden sm:contents`); Work and About stay visible at mobile width.
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav.getByRole("link", { name: "Work" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "About" })).toBeVisible();
  });

  test("hero heading visible at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Vlad Pisotskyi/i }),
    ).toBeVisible();
  });

  test("renders without horizontal overflow at 1280px", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(1280);
  });
});
