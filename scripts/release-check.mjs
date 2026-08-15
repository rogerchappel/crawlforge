#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export function validateReleaseMetadata(pkg, lock) {
  return [pkg.version, lock.version, lock.packages?.[""]?.version].every((v) => v === pkg.version)
    ? [] : [`package.json and package-lock.json versions must all equal ${pkg.version}`];
}

export function validateReleaseWorkflow(workflow) {
  const required = [
    'test "$GITHUB_REF_NAME" = "v$PACKAGE_VERSION"',
    'npm view "$PACKAGE_NAME@$PACKAGE_VERSION" version',
    'npm publish "$PACKAGE_TARBALL" --provenance --access public',
    'npm view "$PACKAGE_NAME@$PACKAGE_VERSION" version --json',
    'gh release create "$GITHUB_REF_NAME" --notes-file RELEASE_NOTES.md "$PACKAGE_TARBALL"',
  ];
  const missing = required.filter((text) => !workflow.includes(text));
  const positions = required.map((text) => workflow.indexOf(text));
  if (!missing.length && positions.some((position, i) => i && position <= positions[i - 1])) {
    return ["release validation, publish, registry verification, and GitHub release steps are out of order"];
  }
  return missing.map((text) => `release workflow is missing: ${text}`);
}

async function main() {
  const pkg = JSON.parse(await readFile("package.json", "utf8"));
  const lock = JSON.parse(await readFile("package-lock.json", "utf8"));
  const workflow = await readFile(".github/workflows/release.yml", "utf8");
  const errors = [...validateReleaseMetadata(pkg, lock), ...validateReleaseWorkflow(workflow)];
  errors.forEach((error) => console.error(`- ${error}`));
  if (errors.length) process.exitCode = 1;
  else console.log(`Release metadata and workflow are consistent for v${pkg.version}.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
