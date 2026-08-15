# Changelog

## Unreleased

- Publish tagged tarballs through npm trusted publishing with provenance before creating the GitHub release.
- Validate `--max-depth` and honor it while recursively traversing fixture links.
- Keep dry runs entirely in memory without creating an output directory.

## 0.1.0 - 2026-05-05

- Scaffolded with StackForge `oss-cli`.
- Added deterministic URL queue and dedupe primitives.
- Added fixture robots/politeness parsing.
- Added local fixture inspection with Markdown and JSON writers.
- Added replayable crawl manifests.
- Added fixture-backed unit tests and CLI smoke coverage.
