#!/usr/bin/env bash
# Deploy latest code to cityforhuman.com
set -euo pipefail
cd "$(dirname "$0")"
git pull --ff-only
npm install
npm run build
sudo systemctl restart cityforhuman
for i in $(seq 1 30); do
  curl -fsS http://127.0.0.1:3020/api/health >/dev/null 2>&1 && { echo "✓ Deployed"; exit 0; }
  sleep 1
done
echo "✗ Service did not come up — check: journalctl -u cityforhuman -n 50" >&2
exit 1
