import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { inspectFixtures } from "../dist/index.js";

test("inspect writes outputs and a replayable manifest from fixtures", async () => {
  const output = await mkdtemp(join(tmpdir(), "crawlforge-inspect-"));
  const result = await inspectFixtures({ input: "fixtures/sample", output, format: "both", userAgent: "test", maxDepth: 1, manifestName: "manifest.json", dryRun: false });
  assert.equal(result.manifest.queued.length, 2);
  assert.equal(result.manifest.policy.crawlDelayMs, 250);
  assert.ok(result.manifestPath);
  const manifest = JSON.parse(await readFile(result.manifestPath, "utf8"));
  assert.equal(manifest.manifestVersion, 1);
  assert.equal(manifest.written.length, 2);
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
