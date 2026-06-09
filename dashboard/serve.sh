#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-8787}"

cd "${SCRIPT_DIR}"
python3 -m http.server "${PORT}" --bind 127.0.0.1 >/tmp/zero-trust-dashboard.log 2>&1 &
echo $! > /tmp/zero-trust-dashboard.pid
printf 'Dashboard available at http://127.0.0.1:%s/\n' "${PORT}"
