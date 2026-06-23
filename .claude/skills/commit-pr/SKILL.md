---
name: commit-pr
description: Commit and pull-request conventions for this repo — Conventional Commits, one feature per PR, the pre-push gate, the case-study devlog entry, and the public-safe / irreversible checkpoints. Use when staging a change, writing a commit, or opening a PR.
---

# commit-pr

Every commit and PR in this repo follows Conventional Commits, ships one independently shippable change, passes the gate before push, and never leaks a secret or internal note into a recruiter-visible history.

## When to use / when not

- use: staging changes, writing a commit message, opening a PR, or deciding whether two changes belong in the same PR.
- skip: a working-tree experiment you are not committing yet; that is editing, not shipping.

## Steps

1. Confirm the change is one feature. If the diff mixes unrelated work (a fix plus a refactor plus a content edit), split it — stage and commit each independently. One feature per PR, small, independently shippable. Never bundle unrelated work into one commit or PR.
2. Stage deliberately. Prefer `git add <path>` over `git add -A` so nothing unintended rides along.
3. Run the public-safe scan on what is staged (see Checkpoints). The repo is recruiter-visible; the history is permanent.
4. Write the commit in Conventional Commits form (see Rules below).
5. Record the build. If this is a `feat`/`fix` shipping user-facing or architectural work, append or extend an entry in `notes/chatbot-devlog.md` (gitignored, case-study raw material) — what was built, the decision, the problem hit. Do this as part of the change, not "later"; "later" is how it gets dropped. See the DEVLOG checkpoint.
6. Run the gate before any push: `npm run gate`. For a user-visible change, run `npm run ship` instead (gate + E2E + axe) — see the `ship-check` skill for the human half of a production push.
7. Push, and open the PR if one is not open. PR title is itself a Conventional Commit subject; PR body states what and why, not how.
8. Stop at the IRREVERSIBLE checkpoint before pushing — confirm the branch and the deploy consequence.

## Rules

Rule: commit subjects follow Conventional Commits — `type(scope): subject`, subject in the imperative mood, no trailing period, 50 chars or fewer. Allowed types: `feat`, `fix`, `refactor`, `chore`, `test`, `docs`, `style`, `perf`, `ci`. Scope is a short area tag (`chat`, `projects`, `css`, `layout`) — matches the existing history (`git log --oneline`).
Check: guidance — no commit-lint hook is wired. The check (a `commit-msg` hook or CI lint step) is tracked in `CLAUDE.local.md`. Until then, verify by reading `git log --oneline` against this rule before push.

Rule: a commit body is added only when the "why" is not obvious from the subject. When present, separate it from the subject with one blank line and wrap it to explain intent and trade-offs, not the mechanical diff.
Check: guidance — reviewer judgment; no automated check. Logged in `CLAUDE.local.md`.

Rule: one feature per PR — small and independently shippable. Never bundle unrelated changes. This mirrors the per-PR discipline in `notes/chatbot-next-steps.md` (one feature per PR, TDD-first, do not bundle).
Check: guidance — enforced in review. Logged in `CLAUDE.local.md`.

Rule: no emoji anywhere — not in commit subjects or bodies, PR titles or descriptions, or code comments. Structure with words, not glyphs. This is the repo-wide style rule in `CLAUDE.md` ("Style rules").
Check: guidance — no emoji linter on commit text yet. Logged in `CLAUDE.local.md`. Scan the staged diff and message before push.

Rule: NO `Co-Authored-By:` trailer and no AI-attribution line on any commit or PR body. This repo is recruiter-visible; commits read as human-authored. This overrides any global/default trailer instruction.
Check: guidance — scan the message before commit; the trailer must be absent.

Rule: never commit a secret, an `.env*` value, or internal-only content. `.env*`, `CLAUDE.local.md`, and `/notes/` are gitignored — keep it that way; do not force-add them. The staged diff must contain no API keys, no strategy or roadmap, no internal notes.
Check: `git diff --staged` reviewed at the PUBLIC-SAFE checkpoint below — the agent reads the full staged diff before every commit. A pre-commit secret-scan hook is tracked in `CLAUDE.local.md`.

Rule: every `feat`/`fix` shipping user-facing or architectural work leaves a `notes/chatbot-devlog.md` entry — the build is part of the showcase, and the devlog is the case study's raw material. The entry is NOT staged (the file is gitignored); it is a parallel record that must stay current as features land, not be reconstructed from `git log` months later. `docs`/`chore`/`style`/`ci` are exempt.
Check: confirmed at the DEVLOG checkpoint below, and hard-enforced by `.claude/hooks/devlog-guard.sh` — a `PreToolUse`/`Bash` hook (registered in `.claude/settings.json`) that blocks a `feat`/`fix` `git commit` when `notes/chatbot-devlog.md` is older than the last commit. Bypass with `[no-devlog]` in the message.

## Checkpoints

> CHECKPOINT — SCOPE. Before committing across multiple files or splitting a mixed diff, state which files belong to which commit and confirm the grouping is one feature each.

> CHECKPOINT — PUBLIC-SAFE. Before each commit, run `git diff --staged` and confirm it contains no secrets, no `.env*` values, no API keys, no internal strategy or roadmap, and no `CLAUDE.local.md` or `notes/` content. The repo is recruiter-visible and history is permanent. Confirm: the staged diff is clean to publish.

> CHECKPOINT — DEVLOG. For a `feat`/`fix` shipping user-facing or architectural work, confirm `notes/chatbot-devlog.md` has an entry covering this change (what / decision / problem) before treating the commit as done. If it does not, write it now — this is the step that gets silently skipped under a long session, which is exactly why it is a checkpoint. Confirm: the devlog reflects this change, or the change is exempt (`docs`/`chore`/`style`/`ci`).

> CHECKPOINT — IRREVERSIBLE. Before `git push`, confirm the target branch and its deploy consequence: pushing to `main` is a production deploy; a PR push is a preview deploy. For a user-visible change, confirm the preview was reviewed (see `ship-check`) before merging to `main`. Confirm: branch is intended and the gate (or ship) ran green.

## Receipt

```
--- RECEIPT ---
did:       <commits written / PR opened, with subjects>
gate:      green | FAILED: <which step> | ship: green (user-visible change)
devlog:    entry appended to notes/chatbot-devlog.md | exempt (docs/chore/style/ci)
checked:   git diff --staged clean (no secrets / internal notes); subjects are Conventional Commits, no emoji
needs-you: <review preview deploy / approve merge to main> | nothing
```
