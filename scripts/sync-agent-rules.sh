#!/usr/bin/env bash
#
# Compatibility entry point for rule generation.
# Canonical target definitions live in tooling/agent-targets.json.
#
# Usage:
#   bash scripts/sync-agent-rules.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec node "$REPO_ROOT/scripts/sync-skills.mjs" --kind=rule
