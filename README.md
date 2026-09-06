# crawlforge

crawlforge is a local-first crawler toolkit for building deterministic content ingesters: queues, dedupe, fixture robots rules, Markdown/JSON writers, and replayable manifests — without surprise network calls.

It is intentionally small, polite, and a little forge-like: feed it known fixtures, get clean artifacts you can inspect, diff, and hand to agents.

## Why

Crawler tooling often jumps straight to live fetching. crawlforge starts one layer earlier: planning and replay. That makes it useful for tests, agent workflows, docs ingestion prototypes, and safety reviews.

## Source checkout

`crawlforge` is not currently available from the npm registry. Clone this repository, then install and build it locally:

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

After a future registry release, a global installation will provide the `crawlforge` command:

```bash
npm install --global crawlforge
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

Fixture `url` values must be absolute HTTP or HTTPS URLs. Other schemes such
as `file:` and `data:` are rejected before any page is queued or output written.

Optional `robots.txt` files support:

```txt
User-agent: crawlforge-fixture-bot
Allow: /
Disallow: /private
Crawl-delay-ms: 250
```

`--user-agent` selects robots groups case-insensitively by product-token match
(for example, `crawlforge-fixture-bot/1.0` matches the group above). All groups
with the most-specific matching token are combined. `User-agent: *` is used
only when no named group matches; if neither a named nor wildcard group
matches, the default allow policy applies. Rules and crawl delays from
unrelated groups are ignored. The manifest records both the requested user
agent and the effective selected policy.

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
  --user-agent <name>  Select the matching robots policy (default: crawlforge-fixture-bot)
  --max-depth <n>      Follow fixture links through n levels (non-negative integer)
  --manifest <file>    Manifest filename
  --dry-run            Build the queue in memory without creating the output path
```

The inspector starts from fixture pages that are not linked by another permitted
fixture page, then follows same-origin links through the requested depth. It also
seeds one deterministic page from every otherwise-unreachable component, so a
disconnected cycle is not silently omitted. A value of `0` includes only each
component seed; linked fixture pages are expanded at depths `1`, `2`, and so on.

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

Run the same checks expected before opening a PR or cutting a release:

```sh
npm run check
npm run test
npm run build
npm run smoke
npm run package:smoke
npm run release:check
```

`release:check` runs the type-check, test suite, CLI smoke test, package smoke test, and release metadata check. The package smoke test packs the real artifact with `npm pack`, installs the tarball in a temporary project, executes its CLI, and fails if the runtime entry points or documented release artifacts are missing. Tagged releases require an npm trusted publisher configured for this repository and workflow environment; no long-lived npm token is used. Before tagging, add the previous version to `release-state.json`; `npm run release:metadata` rejects a package version already recorded there. The workflow verifies that the tag, package, and lockfile versions agree, refuses an existing registry version, publishes with provenance, verifies it with `npm view crawlforge@<version> version`, and only then creates the GitHub release with the same tarball attached.

## License
MIT © Roger Chappel
