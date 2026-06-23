#!/usr/bin/env bash
# PreToolUse(Bash) guard: require a case-study devlog entry for feat/fix commits.
#
# Blocks `git commit -m "feat..."` / `-m "fix..."` when notes/chatbot-devlog.md
# has not been touched since the last commit (mtime <= last commit time). This
# only constrains Claude Code's own commits; a human committing in the terminal
# is unaffected (hooks fire on the agent's tool calls only).
#
# Bypass: put [no-devlog] anywhere in the commit message.
# Exempt: anything that is not a feat/fix commit (docs/chore/style/ci/etc).
set -euo pipefail

input="$(cat)"
cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // ""' 2>/dev/null || printf '')"

# Only police git commits.
case "$cmd" in
  *git*commit*) ;;
  *) exit 0 ;;
esac

# Explicit bypass token.
case "$cmd" in
  *'[no-devlog]'*) exit 0 ;;
esac

# Only feat/fix commits — match the subject right after -m / --message.
if ! printf '%s' "$cmd" | grep -Eq "(-m|--message[ =])[[:space:]]*['\"]?(feat|fix)([(:!]|[[:space:]])"; then
  exit 0
fi

dir="${CLAUDE_PROJECT_DIR:-$PWD}"
devlog="${DEVLOG_PATH:-$dir/notes/chatbot-devlog.md}"

# No previous commit to compare against (fresh repo) — allow.
last_commit_ts="$(git -C "$dir" log -1 --format=%ct 2>/dev/null || true)"
[ -z "$last_commit_ts" ] && exit 0

if [ ! -f "$devlog" ]; then
  echo "DEVLOG GUARD: notes/chatbot-devlog.md is missing. A feat/fix commit needs a devlog entry (what / decision / problem). Create one, or add [no-devlog] to the message to bypass." >&2
  exit 2
fi

mtime="$(stat -f %m "$devlog" 2>/dev/null || stat -c %Y "$devlog" 2>/dev/null || echo 0)"

if [ "$mtime" -lt "$last_commit_ts" ]; then
  echo "DEVLOG GUARD: notes/chatbot-devlog.md has not been updated since the last commit, but this is a feat/fix. Append a devlog entry (what / decision / problem) before committing, or add [no-devlog] to the message to bypass." >&2
  exit 2
fi

exit 0
