# crawlforge

crawlforge is a local-first crawler toolkit for building deterministic content ingesters: queues, dedupe, fixture robots rules, Markdown/JSON writers, and replayable manifests — without surprise network calls.

It is intentionally small, polite, and a little forge-like: feed it known fixtures, get clean artifacts you can inspect, diff, and hand to agents.

## Why

Crawler tooling often jumps straight to live fetching. crawlforge starts one layer earlier: planning and replay. That makes it useful for tests, agent workflows, docs ingestion prototypes, and safety reviews.

## Install

```bash
npm install
npm run build
```

For local development you can run the built CLI directly:

```bash
node dist/cli.js --help
```

## Quickstart

```bash
npm run build
node dist/cli.js inspect fixtures/sample --output out/sample --format both
cat out/sample/manifest.json
```

Or after package installation:

```bash
crawlforge inspect ./fixtures/sample --output ./out/sample --format markdown
```

## Fixture format

A fixture directory contains page JSON files:

```json
{
  "url": "https://example.test/",
  "title": "Example Home",
  "html": "<main><a href=\"/docs\">Docs</a></main>"
}
```

Optional `robots.txt` files support:

```txt
User-agent: crawlforge-fixture-bot
Allow: /
Disallow: /private
Crawl-delay-ms: 250
```

## Safety notes

- V1 does **not** fetch the network.
- V1 does **not** read credentials, cookies, browser profiles, or environment secrets.
- V1 does **not** send telemetry or publish artifacts.
- Every output is produced from explicit local fixtures and recorded in a replayable manifest.

## Commands

```bash
crawlforge inspect <fixture-dir> [options]

Options:
  --output <dir>       Output directory
  --format <mode>      markdown, json, or both
  --max-depth <n>      Follow fixture links through n levels (non-negative integer)
  --manifest <file>    Manifest filename
  --dry-run            Build the queue in memory without creating the output path
```

The inspector starts from fixture pages that are not linked by another fixture page,
then follows same-origin links through the requested depth. A value of `0` includes
only those roots; linked fixture pages are expanded at depths `1`, `2`, and so on.

## Attribution

crawlforge was inspired by [`crawlkit`](https://github.com/vincentkoc/crawlkit) and Roger's OSS idea backlog. It is a fresh TypeScript implementation with a different local-first, fixture-backed V1 scope. It does not copy crawlkit's name or implementation.

## Development

```bash
npm install
npm run check
npm test
npm run smoke
bash scripts/validate.sh
```
## Release readiness

Run the same checks expected before opening or cutting a release:

```sh
npm run check
npm run test
npm run build
npm run smoke
npm run package:smoke
npm run release:check
```

Use `npm pack --dry-run` to confirm the published package contains the CLI/runtime files plus README, license, security, support, and release notes.

## License
MIT © Roger Chappel

## Verify

Run local verification before opening a PR or publishing:

```bash
npm test
npm run release:check
```

`release:check` runs type-checking, build, smoke tests, and a dry-run `npm pack` to ensure everything ships cleanly.
