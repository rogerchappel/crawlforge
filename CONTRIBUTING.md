# Contributing to crawlforge

Thanks for helping make deterministic crawling safer and easier.

## Local setup

```bash
npm install
npm run build
npm test
npm run smoke
```

## Project principles

- Local-first by default.
- No hidden network behavior.
- Deterministic outputs over clever magic.
- Small, reviewable changes with tests.
- Respect robots/politeness semantics even in fixtures.

## Good first changes

- Add more fixture shapes.
- Improve manifest ergonomics.
- Add output writer options.
- Improve docs and smoke coverage.

## Before opening a PR

Run:

```bash
npm run check
npm test
npm run smoke
bash scripts/validate.sh
```

If a future change adds live network crawling, it needs explicit CLI behavior, docs, tests, and a security review before merge.
