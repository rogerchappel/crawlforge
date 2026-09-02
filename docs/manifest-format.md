# Manifest Format

`manifest.json` is the replay record for a crawlforge run.

Key fields:

- `manifestVersion`: schema version, currently `1`.
- `createdAt`: generation timestamp.
- `input` / `output`: local paths supplied to the CLI.
- `queued`: normalized queue items with stable IDs, depth, and optional source URL.
- `skipped`: URLs not queued because they are duplicates, robots-disallowed, or
  same-origin links without a corresponding local fixture (`missing-fixture`).
- `written`: generated Markdown and JSON artifact paths.
- `policy`: robots/politeness policy applied during the run.

The manifest is intended to be diffable and safe to hand to downstream agents.
Each written `.md` or `.json` basename matches its queued item's stable `id`.
Manifest names may include subdirectories (for example,
`--manifest reports/run/manifest.json`); crawlforge creates those parent
directories beneath the output directory before writing the manifest.
