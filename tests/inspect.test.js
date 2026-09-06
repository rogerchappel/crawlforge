import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { inspectFixtures } from "../dist/index.js";

test("inspect writes outputs and a replayable manifest from fixtures", async () => {
  const output = await mkdtemp(join(tmpdir(), "crawlforge-inspect-"));
  const result = await inspectFixtures({ input: "fixtures/sample", output, format: "both", userAgent: "crawlforge-fixture-bot", maxDepth: 1, manifestName: "manifest.json", dryRun: false });
  assert.equal(result.manifest.queued.length, 2);
  assert.equal(result.manifest.policy.crawlDelayMs, 250);
  assert.ok(result.manifestPath);
  const manifest = JSON.parse(await readFile(result.manifestPath, "utf8"));
  assert.equal(manifest.manifestVersion, 1);
  assert.equal(manifest.written.length, 2);
});

test("artifact names match normalized queue IDs and nested manifests are created", async () => {
  const input = await mkdtemp(join(tmpdir(), "crawlforge-normalized-input-"));
  const output = await mkdtemp(join(tmpdir(), "crawlforge-normalized-output-"));
  await writeFile(join(input, "first.json"), JSON.stringify({
    url: "HTTPS://EXAMPLE.TEST:443/docs/?b=2&a=1#top",
    text: "first"
  }));
  await writeFile(join(input, "second.json"), JSON.stringify({
    url: "https://example.test/docs?a=1&b=2",
    text: "second"
  }));

  const result = await inspectFixtures({ input, output, format: "both", userAgent: "test", maxDepth: 0, manifestName: "nested/manifest.json", dryRun: false });

  assert.equal(result.manifest.queued.length, 1);
  assert.equal(result.manifest.written.length, 1);
  assert.equal(result.manifest.skipped.length, 1);
  assert.equal(result.manifest.skipped[0]?.reason, "duplicate");
  assert.equal(result.manifest.written[0]?.markdown, join(output, `${result.manifest.queued[0]?.id}.md`));
  assert.equal(result.manifest.written[0]?.json, join(output, `${result.manifest.queued[0]?.id}.json`));
  assert.equal(result.manifestPath, join(output, "nested/manifest.json"));
  assert.equal(JSON.parse(await readFile(result.manifestPath, "utf8")).queued[0].id, result.manifest.queued[0]?.id);
});

test("max-depth controls recursive traversal through fixture pages", async () => {
  const input = await mkdtemp(join(tmpdir(), "crawlforge-depth-input-"));
  const output = await mkdtemp(join(tmpdir(), "crawlforge-depth-output-"));
  const pages = [
    { name: "root.json", url: "https://depth.test/", links: ["/one"] },
    { name: "one.json", url: "https://depth.test/one", links: ["/two"] },
    { name: "two.json", url: "https://depth.test/two", links: ["/three"] },
    { name: "three.json", url: "https://depth.test/three", links: [] }
  ];
  await mkdir(input, { recursive: true });
  await Promise.all(pages.map(({ name, ...page }) => writeFile(join(input, name), JSON.stringify(page))));

  const result = await inspectFixtures({ input, output, format: "json", userAgent: "test", maxDepth: 2, manifestName: "manifest.json", dryRun: true });

  assert.deepEqual(
    result.manifest.queued.map(({ url, depth }) => ({ url, depth })),
    [
      { url: "https://depth.test/", depth: 0 },
      { url: "https://depth.test/one", depth: 1 },
      { url: "https://depth.test/two", depth: 2 }
    ]
  );
});

test("seeds a disconnected cyclic fixture component", async () => {
  const input = await mkdtemp(join(tmpdir(), "crawlforge-cycle-input-"));
  const output = await mkdtemp(join(tmpdir(), "crawlforge-cycle-output-"));
  const pages = [
    { name: "root.json", url: "https://cycle.test/", links: [] },
    { name: "a.json", url: "https://cycle.test/a", links: ["/b"] },
    { name: "b.json", url: "https://cycle.test/b", links: ["/a"] }
  ];
  await Promise.all(pages.map(({ name, ...page }) => writeFile(join(input, name), JSON.stringify(page))));

  const result = await inspectFixtures({ input, output, format: "json", userAgent: "test", maxDepth: 10, manifestName: "manifest.json", dryRun: false });

  assert.deepEqual(result.manifest.queued.map(({ url }) => url), [
    "https://cycle.test/",
    "https://cycle.test/a",
    "https://cycle.test/b"
  ]);
  assert.equal(result.manifest.written.length, 3);
  assert.equal(new Set(result.manifest.queued.map(({ normalizedUrl }) => normalizedUrl)).size, 3);
});

test("seeds an all-cyclic fixture set deterministically", async () => {
  const input = await mkdtemp(join(tmpdir(), "crawlforge-all-cycle-input-"));
  const output = await mkdtemp(join(tmpdir(), "crawlforge-all-cycle-output-"));
  const pages = [
    { name: "c.json", url: "https://cycle.test/c", links: ["/a"] },
    { name: "a.json", url: "https://cycle.test/a", links: ["/b"] },
    { name: "b.json", url: "https://cycle.test/b", links: ["/c"] }
  ];
  await Promise.all(pages.map(({ name, ...page }) => writeFile(join(input, name), JSON.stringify(page))));

  const result = await inspectFixtures({ input, output, format: "json", userAgent: "test", maxDepth: 10, manifestName: "manifest.json", dryRun: true });

  assert.deepEqual(
    result.manifest.queued.map(({ url, depth }) => ({ url, depth })),
    [
      { url: "https://cycle.test/a", depth: 0 },
      { url: "https://cycle.test/b", depth: 1 },
      { url: "https://cycle.test/c", depth: 2 }
    ]
  );
  assert.deepEqual(result.manifest.skipped, [
    { url: "https://cycle.test/a", reason: "duplicate" }
  ]);
});

test("records same-origin links without fixtures instead of queueing them", async () => {
  const input = await mkdtemp(join(tmpdir(), "crawlforge-missing-input-"));
  const output = await mkdtemp(join(tmpdir(), "crawlforge-missing-output-"));
  await writeFile(join(input, "root.json"), JSON.stringify({
    url: "https://missing.test/",
    links: ["/present", "/absent"]
  }));
  await writeFile(join(input, "present.json"), JSON.stringify({
    url: "https://missing.test/present",
    links: []
  }));

  const result = await inspectFixtures({ input, output, format: "json", userAgent: "test", maxDepth: 1, manifestName: "manifest.json", dryRun: true });

  assert.deepEqual(
    result.manifest.queued.map(({ url, depth }) => ({ url, depth })),
    [
      { url: "https://missing.test/", depth: 0 },
      { url: "https://missing.test/present", depth: 1 }
    ]
  );
  assert.deepEqual(result.manifest.skipped, [
    { url: "https://missing.test/absent", reason: "missing-fixture" }
  ]);
});

test("inspect applies and records the policy for the requested user agent", async () => {
  const input = await mkdtemp(join(tmpdir(), "crawlforge-agent-input-"));
  const output = await mkdtemp(join(tmpdir(), "crawlforge-agent-output-"));
  await writeFile(join(input, "root.json"), JSON.stringify({ url: "https://agent.test/" }));
  await writeFile(join(input, "robots.txt"), [
    "User-agent: fixture-bot",
    "Disallow: /",
    "",
    "User-agent: requested-bot",
    "Allow: /"
  ].join("\n"));

  const result = await inspectFixtures({ input, output, format: "json", userAgent: "requested-bot", maxDepth: 0, manifestName: "manifest.json", dryRun: true });

  assert.equal(result.manifest.userAgent, "requested-bot");
  assert.equal(result.manifest.policy.userAgent, "requested-bot");
  assert.equal(result.manifest.queued.length, 1);
  assert.deepEqual(result.manifest.policy.disallow, []);
});
