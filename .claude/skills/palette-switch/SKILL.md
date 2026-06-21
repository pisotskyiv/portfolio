---
name: palette-switch
description: Switch the active color palette by editing the @theme tokens in app/globals.css. Use when asked to change the palette or try a different color scheme.
---

# palette-switch

Switches the site's color palette by rewriting the eight `--color-*` tokens in the `@theme` block of `app/globals.css` — the single source of truth for every color on the site.

## When to use / when not

- use: changing the active palette, or trying a different color scheme.
- skip: adding a brand-new color slot (that is a token-set change — edit `@theme` plus `notes/styleguide/tailwind.md`, not this skill), or tuning one component's color (use the existing semantic token classes instead).

## Source of truth

- The live palette is the eight `--color-*` tokens inside the `@theme` block at `app/globals.css:3` (tokens at `app/globals.css:4-11`). There is NO `:root` and no `tailwind.config`; `@theme` is the only place colors are defined. See `notes/styleguide/tailwind.md` lines 7-8.
- The eight tokens, in order: `--color-bg`, `--color-elevated`, `--color-surface`, `--color-accent`, `--color-accent-hover`, `--color-text`, `--color-muted`, `--color-border`.
- `lib/palettes.ts` is a **reference palette library only** — named swatch sets (`iron`, `depth`, `obsidian`, `copper`, `voltage`) you can copy values from. Its `activePalette` export has ZERO importers; editing it does NOT switch the theme and never has. Do not claim otherwise. Note also that `lib/palettes.ts` has no `elevated` field, so it cannot fully express the `@theme` block — `@theme` remains the authority.

## Steps

1. Pick the target palette. If it is one of the named sets, open `lib/palettes.ts` and read its values; otherwise gather the eight hex values you intend to apply.
2. Edit the `@theme` block in `app/globals.css` (`app/globals.css:4-11`). Set all eight `--color-*` tokens. `lib/palettes.ts` has no `elevated` value, so choose `--color-elevated` deliberately — typically a step between `--color-bg` and `--color-surface`.
3. Do not edit `lib/palettes.ts` to switch the theme — it has no effect. Only touch it if the user explicitly wants to add or correct a reference swatch.
4. Verify the change. Run `npm run gate` (lint + typecheck + test + build). Check: contrast (`--color-text` on `--color-bg` and on `--color-surface`, WCAG AA) is NOT covered by gate — it is enforced by the axe scan in `npm run test:e2e`, so run that too.
5. Update the design-system decisions note in `CLAUDE.local.md` to record the new active palette and rationale.

## Checkpoints

> CHECKPOINT — SCOPE. Before editing, confirm: which palette (named set from `lib/palettes.ts`, or explicit hex values), and the chosen `--color-elevated` value (no source palette defines it).

> CHECKPOINT — CAN'T-VERIFY. The agent cannot judge how the palette looks rendered. After `npm run gate` passes, the user opens the dev server and visually confirms the palette reads correctly across all sections before this is considered done.

## Receipt

```
--- RECEIPT ---
did:       app/globals.css (@theme --color-* tokens); CLAUDE.local.md (active-palette note)
gate:      green | FAILED: <which step>
checked:   npm run gate (lint+typecheck+test+build); npm run test:e2e (axe contrast scan)
needs-you: open the dev server and visually confirm the palette across all sections (agent cannot judge rendered appearance)
```
