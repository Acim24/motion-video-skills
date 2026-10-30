#!/usr/bin/env bash
# Usage: new_project.sh <target-dir>
# Copies the Remotion launch-video template into <target-dir> and installs dependencies.
set -euo pipefail
TARGET="${1:?usage: new_project.sh <target-dir>}"
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
if [ -e "$TARGET" ] && [ -n "$(ls -A "$TARGET" 2>/dev/null)" ]; then
  echo "error: $TARGET exists and is not empty" >&2; exit 1
fi
mkdir -p "$TARGET"
cp -r "$SKILL_DIR/assets/template/." "$TARGET/"
cd "$TARGET"
npm install --no-audit --no-fund --loglevel=error
echo "ready: $(pwd)"
echo "edit src/storyboard.ts, then: npm run render"
