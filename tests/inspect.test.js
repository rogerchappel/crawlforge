import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { inspectFixtures } from "../dist/index.js";

test("inspect writes outputs and a replayable manifest from fixtures", async () => {
  const output = await mkdtemp(join(tmpdir(), "crawlforge-inspect-"));
  const result = await inspectFixtures({ input: "fixtures/sample", output, format: "both", userAgent: "test", maxDepth: 1, manifestName: "manifest.json", dryRun: false });
  assert.equal(result.manifest.queued.length, 3);
  assert.equal(result.manifest.policy.crawlDelayMs, 250);
  assert.ok(result.manifestPath);
  const manifest = JSON.parse(await readFile(result.manifestPath, "utf8"));
  assert.equal(manifest.manifestVersion, 1);
  assert.equal(manifest.written.length, 2);
});
