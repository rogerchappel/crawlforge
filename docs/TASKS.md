# crawlforge Tasks

## MVP build

- [x] Scaffold StackForge `oss-cli` project.
- [x] Preserve source PRD in `docs/PRD.md`.
- [x] Add TypeScript package metadata, CLI entry, and strict compiler config.
- [x] Implement URL normalization, stable IDs, queueing, and dedupe skip records.
- [x] Implement fixture robots/politeness parsing with explicit crawl-delay support.
- [x] Implement local fixture bundle loading with no hidden network behavior.
- [x] Implement Markdown and JSON writers.
- [x] Implement replayable crawl manifests.
- [x] Add fixture-backed unit tests.
- [x] Add real CLI smoke using local fixtures.

## Release readiness

- [x] README with quickstart, examples, safety notes, and crawlkit attribution.
- [x] CONTRIBUTING, SECURITY, LICENSE, package metadata.
- [x] Local verification via `npm test`, `npm run check`, `npm run build`, `npm run smoke`, `scripts/validate.sh`.
- [x] Push public GitHub repository.
- [x] Attempt best-effort main branch protection.
