import assert from "node:assert/strict";
import test from "node:test";
import { parseArgs } from "../dist/index.js";

test("parse inspect arguments with explicit behavior", () => {
  const parsed = parseArgs(["inspect", "fixtures/sample", "--output", "tmp/out", "--format", "markdown", "--dry-run"]);
  assert.equal(parsed.command, "inspect");
  assert.equal(parsed.options.output, "tmp/out");
  assert.equal(parsed.options.format, "markdown");
  assert.equal(parsed.options.dryRun, true);
});
