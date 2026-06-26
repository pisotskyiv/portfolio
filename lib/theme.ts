export type Theme = "light" | "dark";

/** localStorage key holding an explicit user override. Absent = follow system. */
export const THEME_STORAGE_KEY = "theme";

/** Class added to <html> for the dark palette. Light is the default (no class). */
export const DARK_CLASS = "dark";

/**
 * Inline script injected into <head> and run before paint to prevent a
 * theme flash (FOUC). Reads an explicit override from localStorage; falls
 * back to the OS `prefers-color-scheme`. Adds the dark class when dark.
 * Kept self-contained (no imports) because it executes as raw text.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var d=t?t==="dark":true;if(d)document.documentElement.classList.add(${JSON.stringify(
  DARK_CLASS,
)});}catch(e){}})();`;
