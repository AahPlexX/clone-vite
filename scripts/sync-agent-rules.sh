#!/usr/bin/env bash
# sync-agent-rules.sh
# Copies AGENTS.md to every supported agent platform rule location.
# Run via: pnpm sync-rules
# Never edit the output files directly — edit AGENTS.md then re-run.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"
SOURCE="$ROOT/AGENTS.md"

if [[ ! -f "$SOURCE" ]]; then
  echo "ERROR: AGENTS.md not found at $SOURCE" >&2
  exit 1
fi

write() {
  local dest="$ROOT/$1"
  mkdir -p "$(dirname "$dest")"
  cp "$SOURCE" "$dest"
  echo "  wrote $1"
}

echo "Syncing platform rule files from AGENTS.md..."

write ".cursor/rules/clone-vite.mdc"
write ".windsurf/rules/clone-vite.md"
write ".gemini/GEMINI.md"
write ".codex/instructions.md"
write ".amazonq/dev/instructions.md"
write ".augment/instructions.md"
write ".continue/config/clone-vite.md"
write ".opencode/context.md"
write ".github/copilot-instructions.md"

echo "Done. 9 platform files written."
