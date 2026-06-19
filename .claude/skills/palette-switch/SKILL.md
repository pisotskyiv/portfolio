---
name: palette-switch
description: Switch the active color palette. Use when asked to change the palette or try a different color scheme.
---

# palette-switch

Switches the active palette across all design token sources. Two files must stay in sync — both must be updated.

## Available palettes

Defined in `lib/palettes.ts`: `iron` · `depth` · `obsidian` · `copper` · `voltage`

Current active: **copper** (dark mode primary)

## Step 1 — Update lib/palettes.ts

Change the `activePalette` export at the bottom of the file:

```ts
// change this one line
export const activePalette = copper; // → iron / depth / obsidian / voltage
```

## Step 2 — Update CSS variables in app/globals.css

Sync the `:root` CSS custom properties to match the chosen palette's values from `lib/palettes.ts`:

```css
:root {
  --color-bg: {palette.bg};
  --color-surface: {palette.surface};
  --color-accent: {palette.accent};
  --color-accent-hover: {palette.accentHover};
  --color-text: {palette.text};
  --color-muted: {palette.muted};
  --color-border: {palette.border};
}
```

## Step 3 — Update this skill file

Update "Current active:" above to reflect the new palette.

## Step 4 — Update CLAUDE.local.md

Update the design system decisions section to reflect the new active palette.

## Step 5 — Verify

Run `npm run build` — confirm no type errors and build passes.
Open dev server, visually confirm palette applied across all sections.
