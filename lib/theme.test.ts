import { describe, expect, it } from "vitest";
import { DARK_CLASS, THEME_STORAGE_KEY, themeInitScript } from "./theme";

describe("themeInitScript", () => {
  it("reads the explicit override from the storage key", () => {
    expect(themeInitScript).toContain(JSON.stringify(THEME_STORAGE_KEY));
  });

  it("falls back to the OS prefers-color-scheme", () => {
    expect(themeInitScript).toContain("prefers-color-scheme: dark");
  });

  it("applies the dark class to documentElement", () => {
    expect(themeInitScript).toContain(JSON.stringify(DARK_CLASS));
    expect(themeInitScript).toContain("documentElement.classList.add");
  });

  it("is wrapped in a try/catch so a storage error never blocks paint", () => {
    expect(themeInitScript).toContain("try{");
    expect(themeInitScript).toContain("catch");
  });
});
