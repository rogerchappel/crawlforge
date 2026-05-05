# AGENTS.md - crawlforge

This repo is a local-first TypeScript CLI built from the StackForge `oss-cli` template.

## Rules for agents

- Stay inside this repository unless explicitly asked otherwise.
- Do not add hidden network calls. V1 is fixture-only.
- Treat fixtures as untrusted input and keep outputs explicit.
- Prefer deterministic behavior: stable sort order, stable IDs, replayable manifests.
- Run the smallest meaningful verification before claiming success.

## Useful commands

```bash
npm install
npm run check
npm test
npm run smoke
bash scripts/validate.sh
```

## Project shape

- `src/queue.ts` — URL queue and dedupe primitives.
- `src/robots.ts` — fixture robots/politeness rules.
- `src/inspect.ts` — local fixture inspection orchestration.
- `src/writers.ts` — Markdown/JSON output writers.
- `src/manifest.ts` — replayable manifest generation.
- `fixtures/` — deterministic local inputs.
- `tests/` — fixture-backed node tests.
