#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/out/smoke"
rm -rf "$OUT"
mkdir -p "$(dirname "$OUT")"
node "$ROOT/dist/cli.js" inspect "$ROOT/fixtures/sample" --output "$OUT" --format both --manifest manifest.json > "$OUT.log"
test -f "$OUT/manifest.json"
node -e "const fs=require('node:fs'); const m=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); if (m.queued.length !== 3 || m.written.length !== 2) process.exit(1)" "$OUT/manifest.json"
node "$ROOT/dist/cli.js" --help | grep -q "does not fetch the network"
echo "crawlforge smoke ok"
