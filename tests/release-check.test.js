import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { validateReleaseMetadata, validateReleaseWorkflow } from "../scripts/release-check.mjs";

test("release metadata requires package and lock versions to agree", () => {
  assert.deepEqual(validateReleaseMetadata({ version: "1.2.3" }, { version: "1.2.3", packages: { "": { version: "1.2.3" } } }), []);
  assert.equal(validateReleaseMetadata({ version: "1.2.3" }, { version: "1.2.2", packages: { "": { version: "1.2.3" } } }).length, 1);
});

test("release workflow publishes and verifies npm before creating the GitHub release", async () => {
  const workflow = await readFile(".github/workflows/release.yml", "utf8");
  assert.deepEqual(validateReleaseWorkflow(workflow), []);
  assert.ok(validateReleaseWorkflow(workflow.replace('test "$GITHUB_REF_NAME" = "v$PACKAGE_VERSION"', "true")).length);
  assert.ok(validateReleaseWorkflow(workflow.replace(/npm publish.*\n/, "")).length);
  const publish = 'npm publish "$PACKAGE_TARBALL" --provenance --access public';
  const release = 'gh release create "$GITHUB_REF_NAME" --notes-file RELEASE_NOTES.md "$PACKAGE_TARBALL"';
  assert.match(validateReleaseWorkflow(workflow.replace(publish, "PUBLISH").replace(release, publish).replace("PUBLISH", release)).join("\n"), /out of order/);
});
