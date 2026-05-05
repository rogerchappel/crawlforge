# crawlforge Orchestration

crawlforge is designed for agents and humans that need deterministic crawl-like artifacts without surprise network access.

## Default run

1. Read a local fixture directory containing page JSON files and optional `robots.txt`.
2. Normalize each URL and enqueue it once.
3. Apply fixture robots/politeness rules.
4. Write Markdown and/or JSON artifacts.
5. Write a manifest that can be replayed or inspected by downstream tools.

## Safety contract

- No network fetches in V1.
- No credentials, cookies, telemetry, publishing, or hidden background jobs.
- External crawling would require a future explicit command and a new safety review.

## Agent handoff

Agents should run:

```bash
npm run build
node dist/cli.js inspect fixtures/sample --output out/agent --format both
```

Then inspect `out/agent/manifest.json` before using generated documents.
