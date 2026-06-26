import { test, expect } from "@playwright/test";

test.describe("Booking page", () => {
  test("does not render the chat widget", async ({ page }) => {
    await page.goto("/book");
    // /book is outside the (main) route group, so the chat FAB must not mount.
    await expect(page.getByRole("button", { name: "Open chat" })).toHaveCount(0);
  });
});
