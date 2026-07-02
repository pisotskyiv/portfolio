import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const toggle = /switch to (dark|light) theme/i;

const isDark = (page: Page) =>
  page.evaluate(() => document.documentElement.classList.contains("dark"));

// A click can land before React hydration attaches the handler (parallel-load
// timing), making it a no-op. Retry the click until the theme actually flips —
// a lost click leaves the state unchanged, so the next attempt re-clicks once
// the handler is live. Each successful attempt is a single flip.
async function flipTo(page: Page, dark: boolean) {
  const button = page.getByRole("button", { name: toggle });
  await expect(async () => {
    await button.click();
    expect(await isDark(page)).toBe(dark);
  }).toPass({ timeout: 5000 });
}

test.describe("Theme toggle", () => {
  test("flips from dark (default) to light on click", async ({ page }) => {
    await page.goto("/");
    expect(await isDark(page)).toBe(true);
    await flipTo(page, false);
  });

  test("flips back to dark on a second click", async ({ page }) => {
    await page.goto("/");
    await flipTo(page, false);
    await flipTo(page, true);
  });

  test("persists the choice across a reload (no flash on return)", async ({
    page,
  }) => {
    await page.goto("/");
    await flipTo(page, false);

    await page.reload();
    // Set by the blocking <head> script before paint — present immediately,
    // independent of hydration.
    expect(await isDark(page)).toBe(false);
  });
});

test.describe("Theme toggle — accessibility", () => {
  test("home page passes axe in light mode", async ({ page }) => {
    // Dark is the default, so the home/work/chat specs already scan the dark
    // palette; flipping here keeps the light palette covered. Reduced motion
    // kills the 300ms color transition so axe samples the settled palette,
    // not an intermediate blended frame.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await flipTo(page, false);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
