import assert from "node:assert/strict";
import { access, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { inspectFixtures } from "../dist/index.js";

test("dry-run builds manifest without writing page artifacts", async () => {
  const parent = await mkdtemp(join(tmpdir(), "crawlforge-dry-"));
  const output = join(parent, "output-must-not-exist");
  const result = await inspectFixtures({ input: "fixtures/sample", output, format: "both", userAgent: "test", maxDepth: 1, manifestName: "manifest.json", dryRun: true });
  assert.equal(result.manifestPath, undefined);
  assert.equal(result.manifest.written.length, 0);
  await assert.rejects(access(output), { code: "ENOENT" });
});
