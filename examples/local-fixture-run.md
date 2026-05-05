# Local fixture run

Use this example to demonstrate crawlforge without network access:

```bash
npm run build
node dist/cli.js inspect fixtures/sample --output out/example --format both
jq '.queued, .written' out/example/manifest.json
```

The generated manifest records queue entries, duplicate skips, output files, and the robots/politeness policy loaded from fixtures.
