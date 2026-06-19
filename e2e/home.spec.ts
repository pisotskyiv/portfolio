import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("nav shows site name and section links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("link", { name: "Vlad Pisotski" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Work" })).toBeVisible();
    await expect(page.getByRole("link", { name: "About" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Contact" })).toBeVisible();
  });

  test("nav has GitHub link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "GitHub" })).toBeVisible();
  });

  test("hero shows name heading and role", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Vlad Pisotski/i }),
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
});
