---
name: new-component
description: Create a new component following this project's conventions — correct folder, typed props, named export, co-located test. Use when asked to create any new UI primitive or page section.
---

# new-component

Creates a component correctly per this project's style guide. Follow every step — do not skip.

## Step 1 — Determine folder

- Reusable primitive (Button, Card, Badge, Tag, Input)? → `components/ui/`
- One-off page section (Hero, Projects, About, Contact, Nav)? → `components/sections/`

## Step 2 — Read relevant style guide sections

Read these before writing any code:

- `notes/styleguide/components.md` — structure, named exports, prop rules
- `notes/styleguide/typescript.md` — Props interface naming, no any
- `notes/styleguide/tailwind.md` — clsx, class ordering, no inline styles

## Step 3 — Write the component file

Checklist:
- [ ] `interface {Name}Props` at top of file
- [ ] All props explicitly typed — no `...rest`, no spreading
- [ ] Named export (`export function`, not `export default`)
- [ ] Server Component by default — add `"use client"` only if hooks/events needed
- [ ] Hover + focus-visible states on all interactive elements
- [ ] No inline styles — Tailwind classes or CSS variables only
- [ ] No emoji in content or comments

## Step 4 — Write the test file

File: same directory, `{Name}.test.tsx`

Checklist:
- [ ] `describe("{Name}")` wrapping all tests
- [ ] At minimum: renders-without-crashing test using `getByRole`
- [ ] One test per behavior (not bundled assertions)
- [ ] Interactive elements asserted by role + accessible name
- [ ] Read `notes/styleguide/testing.md` if unsure

## Step 5 — Run gates

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

All must pass before reporting done.

## Step 6 — New pattern check

If the component introduced a pattern not in `notes/styleguide/`, flag it:
"This pattern isn't in the style guide — should it become a rule?"
