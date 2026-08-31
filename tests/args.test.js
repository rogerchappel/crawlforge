import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
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

test("rejects an option token where the fixture directory is required", () => {
  assert.throws(
    () => parseArgs(["inspect", "--dry-run"]),
    { message: "inspect requires an input fixture directory before options" }
  );
});

for (const flag of ["--output", "-o", "--format", "--user-agent", "--max-depth", "--manifest"]) {
  test(`rejects an option token as the ${flag} value`, () => {
    assert.throws(
      () => parseArgs(["inspect", "fixtures/sample", flag, "--dry-run"]),
      { message: `${flag} requires a value` }
    );
  });
}

test("missing values fail before the CLI creates option-named artifacts", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "crawlforge-args-"));
  const cli = resolve("dist/cli.js");
  const fixture = resolve("fixtures/sample");
  const result = spawnSync(process.execPath, [cli, "inspect", fixture, "--output", "--dry-run"], {
    cwd,
    encoding: "utf8"
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /--output requires a value/);
  await assert.rejects(access(join(cwd, "--dry-run")), { code: "ENOENT" });
});
