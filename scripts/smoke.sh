#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/out/smoke"
rm -rf "$OUT"
mkdir -p "$(dirname "$OUT")"
node "$ROOT/dist/cli.js" inspect "$ROOT/fixtures/sample" --output "$OUT" --format both --manifest manifest.json > "$OUT.log"
test -f "$OUT/manifest.json"
grep -q '"queued": 3' "$OUT/manifest.json"
grep -q '"skipped"' "$OUT/manifest.json"
node "$ROOT/dist/cli.js" --help | grep -q "does not fetch the network"
echo "crawlforge smoke ok"
