---
name: skill-authoring
description: The standard every skill in this repo follows — the template, checkpoint and receipt conventions, and the "skill is truth / every rule names its check" policy. Use when creating a new skill, refactoring an existing one, or resolving a conflict between a skill and the code.
---

# skill-authoring

Skills are the source of truth for how this repo is built. Code conforms to skills, not the reverse. A skill that only suggests is decoration. A skill that names an executable check enforces. Every skill in `.claude/skills/` matches the template and obeys the rules below.

## When to use / when not

- use: creating a skill, refactoring one, or deciding what to do when a skill and the code disagree.
- skip: one-off guidance for a task that will not recur — that is a prompt, not a skill.

## The template

Every skill is exactly this shape. Same order, same headings.

```markdown
---
name: <kebab-case, matches the directory name>
description: <what it does>. Use when <concrete trigger>.
---

# <name>

<one line: what this skill enforces>

## When to use / when not
- use: <triggers>
- skip: <when NOT to fire>

## Steps
1. <imperative step>
2. ...

## Checkpoints
<the CHECKPOINT lines this skill stops at — see convention>

## Receipt
<the closing report block — see convention>
```

A pure-reference skill (decision trees, no mutation — e.g. `next-conventions`) may drop `Checkpoints` and `Receipt` and use `## Decision tree N` blocks in place of `## Steps`. Everything else is mandatory.

## Rule 1 — every rule names its check

A rule is followed only when it is (a) **precise** — unambiguous, no judgment call — and (b) **backed by an executable check** that goes red when broken. State the check next to the rule:

```
Rule: every component has a co-located {Name}.test.tsx.
Check: `npm test` (tests-exist guard) — fails if a sibling test is missing.
```

If a rule has no executable check yet, label it **`guidance:`** honestly and add the missing check to the backlog (`CLAUDE.local.md`). Never write an imperative rule the gate cannot enforce and present it as enforced — that is the defect this whole skill set was built to remove.

Live checks available now: `npm run gate` (lint + typecheck + test + build), `npm run ship` (gate + e2e), `npm run test:e2e` (Playwright + axe), the data-shape tests in `lib/projects.test.ts`.

## Rule 2 — skill is truth; resolve conflicts by type

When a skill and the code disagree, the skill wins by default. But first classify the conflict:

- **Type A — the rule was written too absolute; the code is correct.** The rule cannot be followed as written (e.g. "no inline styles ever" vs a runtime-computed `background-position` that has no utility-class equivalent). Fix the **rule**: make it precise, state the real boundary, cite the canonical file. A precise rule is stronger than a vague absolute everyone silently breaks. This is not capitulation.
- **Type B — the rule is right; the code drifted.** The code can conform (e.g. a whole-section client component that could be a thin client leaf). Keep the rule strict and log the **code** fix to the backlog. Skill is truth; the backlog is the list of code catching up.

Decide A vs B explicitly. If unsure, that is a CHECKPOINT — ask.

## Rule 3 — no dead references

Every path, file, route, and command a skill names must exist. Before shipping a skill, verify each reference resolves. A skill that says "read `notes/styleguide/x.md`" when that file is absent dead-ends the agent. If a referenced artifact does not exist yet, either create it or cite a real exemplar file instead.

## Rule 4 — one source of truth for commands

Never copy a multi-command string into a skill. Reference the npm script: `npm run gate`, `npm run ship`. If the gate changes, it changes in `package.json` only.

## Rule 5 — no checkbox theater

Do not use markdown `[ ]` checkboxes. Nothing tracks their state, so they imply enforcement that does not exist. Use plain imperative steps, and back the ones that matter with a check (Rule 1).

## Checkpoint convention

A checkpoint is the only place a skill stops for the user. Format:

```
> CHECKPOINT — <reason>. Confirm: <what the user decides>.
```

The agent halts and waits at each. Mandatory checkpoints, fixed across all skills:

- **SCOPE** — before multi-file work: state what and where, then wait.
- **IRREVERSIBLE** — before push, deploy, deleting, or overwriting.
- **CAN'T-VERIFY** — a step the agent cannot perform (open a URL, judge a visual) is never faked. It becomes a CHECKPOINT or a `needs-you` line in the receipt, with the actor named.

Keep checkpoints strategic, not per-step. Constant prompting is noise.

## Receipt

Every skill that changes files ends with this exact block:

```
--- RECEIPT ---
did:       <files created/changed>
gate:      green | FAILED: <which step>
checked:   <verifications actually run>
needs-you: <manual steps the agent cannot do> | nothing
```

## Naming

Directory name = `name:` in frontmatter = kebab-case. Prefer verb-first for action skills (`add-project`, `new-component`); reference skills may be noun-phrased (`next-conventions`). Do not rename an existing skill without updating every reference to it.

## Checkpoints

> CHECKPOINT — SCOPE. Before creating or refactoring a skill, confirm: name, which template variant (action vs reference), and which executable check will back its core rule.

## Receipt

```
--- RECEIPT ---
did:       <skill file written/edited>
gate:      n/a (skills are not gated by npm) — verify all references resolve
checked:   every path/command in the skill exists; rules cite checks or are labeled guidance
needs-you: confirm any rule left as guidance is acceptable, or approve adding its check to the backlog
```
