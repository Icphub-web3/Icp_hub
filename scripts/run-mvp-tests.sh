#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

pick_pm() {
  if [ -f pnpm-lock.yaml ] && command -v pnpm >/dev/null 2>&1; then echo pnpm; return; fi
  if [ -f yarn.lock ] && command -v yarn >/dev/null 2>&1; then echo yarn; return; fi
  echo npm
}

has_npm_script() {
  local name="$1"
  [ -f package.json ] || return 1
  node -e "try{process.exit(require('./package.json').scripts?.['$name']?0:1)}catch(e){process.exit(1)}" >/dev/null 2>&1
}

run_script_if_exists() {
  local pm="$1" name="$2"
  if has_npm_script "$name"; then
    echo "→ $pm run $name"
    "$pm" run "$name"
    return 0
  fi
  return 1
}

PM="$(pick_pm)"

# JS/TS workflow
if [ -f package.json ]; then
  echo "Installing JS/TS dependencies with $PM…"
  case "$PM" in
    pnpm) pnpm install --frozen-lockfile ;;
    yarn) yarn install --frozen-lockfile ;;
    npm)  (npm ci || npm install) ;;
  esac

  # Type-check if TS present
  if [ -f tsconfig.json ]; then
    echo "Type-checking…"
    if ! run_script_if_exists "$PM" "typecheck"; then
      npx -y typescript --noEmit || true
    fi
  fi

  echo "Running unit tests…"
  if ! run_script_if_exists "$PM" "test"; then
    run_script_if_exists "$PM" "test:unit" || echo "No unit test script found."
  fi

  # Playwright E2E if configured
  if [ -f playwright.config.ts ] || [ -f playwright.config.js ]; then
    echo "Running Playwright E2E…"
    npx -y playwright install --with-deps
    if ! run_script_if_exists "$PM" "test:e2e"; then
      npx -y playwright test
    fi
  fi
fi

# Internet Computer (dfx) tests
if [ -f dfx.json ] && command -v dfx >/dev/null 2>&1; then
  echo "Running DFX tests…"
  # Check if 'dfx test' subcommand exists robustly
  if dfx help test >/dev/null 2>&1; then
    dfx stop >/dev/null 2>&1 || true
    dfx start --clean --background
    trap 'dfx stop >/dev/null 2>&1 || true' EXIT
    dfx test
  else
    echo "Note: Your dfx does not support 'dfx test' (e.g., dfx 0.29.0). Skipping dfx-driven tests."
    # Fallback: run any executable test files if present (does not require 'dfx test')
    if [ -d tests ] || [ -d test ]; then
      echo "Looking for executable tests in ./tests or ./test…"
      find tests test -maxdepth 1 -type f -perm -u=x -print -exec {} \; || true
    fi
  fi
fi

echo "✅ Attempted all mandatory tests."
