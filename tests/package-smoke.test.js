import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  documentedReleaseArtifacts,
  missingPackedFiles,
} from "../scripts/package-smoke.mjs";

test("package smoke reports every missing documented release artifact", () => {
  const packageJson = { main: "./dist/index.js", bin: "./dist/cli.js" };
  const missing = missingPackedFiles(packageJson, ["dist/index.js", "dist/cli.js"]);

  assert.deepEqual(missing, documentedReleaseArtifacts);
});

test("npm package contains every documented release artifact", async () => {
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
    encoding: "utf8",
  });
  const [packument] = JSON.parse(output);
  const packedFiles = packument.files.map((file) => file.path);

  assert.deepEqual(missingPackedFiles(packageJson, packedFiles), []);
  for (const artifact of documentedReleaseArtifacts) {
    assert.ok(packedFiles.includes(artifact), `${artifact} should be packed`);
  }
});
