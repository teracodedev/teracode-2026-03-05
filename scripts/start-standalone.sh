#!/usr/bin/env bash
# Next standalone は process.env.HOSTNAME で bind アドレスを決める。
# Linux ではシェルが HOSTNAME=ホスト名 を付与することがあり、0.0.0.0 で待ち受けられなくなるため明示する。
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
export HOSTNAME="0.0.0.0"
export PORT="${PORT:-3000}"
# 手動起動や古い PM2 の残骸が 3000 を掴んだままだと EADDRINUSE で落ちる
if command -v fuser >/dev/null 2>&1; then
  fuser -k "${PORT}/tcp" 2>/dev/null || true
  sleep 1
fi
exec node .next/standalone/server.js
