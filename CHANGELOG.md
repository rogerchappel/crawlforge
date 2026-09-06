# Changelog

## Unreleased

- Inspect every permitted fixture graph component, including disconnected cycles.

## 0.2.0 - 2026-08-17

- Publish tagged tarballs through npm trusted publishing with provenance before creating the GitHub release.
- Validate `--max-depth` and honor it while recursively traversing fixture links.
- Keep dry runs entirely in memory without creating an output directory.
- Reject malformed fixture page fields before they enter the crawl queue.
- Apply robots rules using longest-match precedence and explicit policy validation.

## 0.1.0 - 2026-05-05

- Scaffolded with StackForge `oss-cli`.
- Added deterministic URL queue and dedupe primitives.
- Added fixture robots/politeness parsing.
- Added local fixture inspection with Markdown and JSON writers.
- Added replayable crawl manifests.
- Added fixture-backed unit tests and CLI smoke coverage.
