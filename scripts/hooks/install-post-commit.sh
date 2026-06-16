#!/usr/bin/env bash
set -euo pipefail

# install-post-commit.sh - Cross-platform BASH/WSL install script.
#
# Usage: ./scripts/hooks/install-post-commit.sh [oh-my-patent-dir] [--standalone]

MY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OMG_DIR="${1:-}"

usage() {
  cat <<EOF
Usage: install-post-commit.sh [oh-my-patent-dir] [--standalone]

Installs the oh-my-patent auto-sync post-commit hook.

Options:
  oh-my-patent-dir  Absolute or relative path to the oh-my-patent project.
                    If not specified, auto-detection via plugin.jsonc is used.
  --standalone      Treat oh-my-patent as a standalone git repo, skip parent hooks.
EOF
}

# --- argument parsing ---
while [[ $# -gt 0 ]]; do
  case "$1" in
    --standalone) STANDALONE="1"; shift ;;
    -h|--help) usage; exit 0 ;;
    -*) echo "Unknown flag: $1"; usage; exit 1 ;;
    *)
      if [[ -z "$OMG_DIR" ]]; then
        OMG_DIR="$1"
      else
        echo "Too many positional arguments: $1"
        exit 1
      fi
      shift
      ;;
  esac
done

# --- auto-detect ---
if [[ -z "$OMG_DIR" ]]; then
  # Try current dir and parents up to 5 levels
  dir="$(pwd)"
  for _ in {1..5}; do
    if [[ -f "$dir/plugin.jsonc" ]]; then
      OMG_DIR="$dir"
      break
    fi
    parent="$(dirname "$dir")"
    if [[ "$parent" == "$dir" ]]; then break; fi
    dir="$parent"
  done

  # Try env var
  if [[ -z "$OMG_DIR" && -n "${OH_MY_PATENT_DIR:-}" && -f "$OH_MY_PATENT_DIR/plugin.jsonc" ]]; then
    OMG_DIR="$OH_MY_PATENT_DIR"
  fi
fi

# --- validate ---
if [[ -z "$OMG_DIR" ]]; then
  echo "ERROR: Cannot auto-detect oh-my-patent project. Please pass the directory or export OH_MY_PATENT_DIR."
  usage
  exit 1
fi

OMG_DIR="$(cd "$OMG_DIR" && pwd)"
if [[ ! -f "$OMG_DIR/plugin.jsonc" ]]; then
  echo "ERROR: $OMG_DIR does not look like an oh-my-patent project (plugin.jsonc missing)!"
  exit 1
fi

if [[ ! -d "$OMG_DIR/.git" ]]; then
  echo "ERROR: No .git directory found at $OMG_DIR. Is it a git repo?"
  exit 1
fi

echo "[install] oh-my-patent directory: $OMG_DIR"

# --- install post-commit (no .cmd wrapper needed in bash) ---
SRCHOOK="$OMG_DIR/scripts/hooks/post-commit.js"
DSTHOOK="$OMG_DIR/.git/hooks/post-commit"

if [[ ! -f "$SRCHOOK" ]]; then
  echo "ERROR: Hook source script not found: $SRCHOOK"
  exit 1
fi

cp -f "$SRCHOOK" "$DSTHOOK"
chmod +x "$DSTHOOK"
echo "[install] Instored post-commit hook -> $DSTHOOK"

# --- create marker for traceability ---
HOOKSOURCE="$OMG_DIR/.git/hooks/hook-source.txt"
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) :: installed from: $SRCHOOK" > "$HOOKSOURCE"

# --- notify about parent repo situation ---
if [[ "${STANDALONE:-}" != "1" ]]; then
  if git rev-parse --show-toplevel 2>/dev/null | xargs realpath 2>/dev/null | read -r PGGITROOT; then
    # Get root again properly (read into var above only works inside if condition in some bash versions)
    PGGITROOT="$(cd "$OMG_DIR" && git rev-parse --show-toplevel 2>/dev/null || echo "")"
    if [[ -n "$PGGITROOT" && "$PGGITROOT" != "$OMG_DIR" ]]; then
      echo ""
      echo "[!] Parent repository detected: $PGGITROOT (committing from there will not trigger this hook)"
      echo "    Options:"
      echo "      1. Commit inside $OMG_DIR directly (recommended for submodule work)."
      echo "      2. Manually run scripts/sync-oh-my-patent.ps1 after committing."
      echo "      3. Install a parent-repo post-commit hook to detect submodule changes."
    fi
  fi
fi

echo ""
echo "[complete] Post-commit hook installed at $DSTHOOK"
echo "  Test: cd $OMG_DIR; modify a file, 'git add -A', 'git commit -m \"feat: test sync\"'"
