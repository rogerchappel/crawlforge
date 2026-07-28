import assert from "node:assert/strict";
import test from "node:test";
import { parseArgs } from "../dist/index.js";

test("parse inspect arguments with explicit behavior", () => {
  const parsed = parseArgs(["inspect", "fixtures/sample", "--output", "tmp/out", "--format", "markdown", "--max-depth", "2", "--dry-run"]);
  assert.equal(parsed.command, "inspect");
  assert.equal(parsed.options.output, "tmp/out");
  assert.equal(parsed.options.format, "markdown");
  assert.equal(parsed.options.maxDepth, 2);
  assert.equal(parsed.options.dryRun, true);
});

for (const value of ["nope", "1.5", "-1", "3pages", "Infinity"]) {
  test(`rejects invalid --max-depth value ${value}`, () => {
    assert.throws(
      () => parseArgs(["inspect", "fixtures/sample", "--max-depth", value]),
      { message: "--max-depth must be a non-negative integer" }
    );
  });
}
