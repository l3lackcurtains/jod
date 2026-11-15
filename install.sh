#!/usr/bin/env bash
# Install jod's portable skills for AI coding tools other than Claude Code.
# (Claude Code: use the plugin instead: /plugin marketplace add l3lackcurtains/jod)
#
#   curl -fsSL https://raw.githubusercontent.com/l3lackcurtains/jod/main/install.sh | bash -s -- [targets] [--project]
#
# Targets (default: agents):
#   agents   ~/.agents/skills         read by Codex, Cursor, OpenCode, GitHub Copilot, Gemini CLI
#   zcode    ~/.zcode/skills          ZCode
#   claude   ~/.claude/skills         Claude Code without the plugin (also read by OpenCode, Cursor)
#   cursor   ~/.cursor/skills
#   opencode ~/.config/opencode/skills
#   copilot  ~/.copilot/skills
#   gemini   ~/.gemini/skills
#   all      agents + zcode
# --project  install into the current repo (.agents/skills, .zcode/skills, ...) instead of your home folder
set -euo pipefail

REPO="l3lackcurtains/jod"
targets=()
scope="global"
for arg in "$@"; do
  case "$arg" in
    --project) scope="project" ;;
    -h|--help) sed -n '2,19p' "$0" 2>/dev/null || true; exit 0 ;;
    *) targets+=("$arg") ;;
  esac
done
[ ${#targets[@]} -eq 0 ] && targets=(agents)

dir_for() {
  local base
  if [ "$scope" = "project" ]; then base="$PWD"; else base="$HOME"; fi
  case "$1" in
    agents) echo "$base/.agents/skills" ;;
    zcode) echo "$base/.zcode/skills" ;;
    claude) echo "$base/.claude/skills" ;;
    cursor) echo "$base/.cursor/skills" ;;
    opencode) if [ "$scope" = "project" ]; then echo "$base/.opencode/skills"; else echo "$HOME/.config/opencode/skills"; fi ;;
    copilot) if [ "$scope" = "project" ]; then echo "$base/.github/skills"; else echo "$HOME/.copilot/skills"; fi ;;
    gemini) echo "$base/.gemini/skills" ;;
    *) echo "unknown target: $1" >&2; exit 1 ;;
  esac
}

expanded=()
for t in "${targets[@]}"; do
  if [ "$t" = "all" ]; then expanded+=(agents zcode); else expanded+=("$t"); fi
done

# Source: this checkout if run from it, otherwise a fresh download of main.
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || echo "")"
if [ -n "$script_dir" ] && [ -d "$script_dir/portable" ]; then
  src="$script_dir/portable"
else
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT
  curl -fsSL "https://github.com/$REPO/archive/refs/heads/main.tar.gz" | tar -xz -C "$tmp"
  src="$tmp/jod-main/portable"
fi

for t in "${expanded[@]}"; do
  dest="$(dir_for "$t")"
  mkdir -p "$dest"
  for skill in "$src"/jod-*; do
    name="$(basename "$skill")"
    rm -rf "${dest:?}/$name"
    cp -R "$skill" "$dest/$name"
  done
  echo "jod: installed $(ls -d "$src"/jod-* | wc -l | tr -d ' ') skills → $dest"
done
echo "jod: next, run /jod-setup (or ask your agent to use the jod-setup skill) in your repo."
