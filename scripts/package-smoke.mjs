#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const documentedReleaseArtifacts = [
  "README.md",
  "LICENSE",
  "SECURITY.md",
  "SUPPORT.md",
  "RELEASE_NOTES.md",
];

export function requiredPackedFiles(packageJson) {
  const requiredFiles = new Set(documentedReleaseArtifacts);

  if (packageJson.main) {
    requiredFiles.add(packageJson.main.replace(/^\.\//, ""));
  }

  const binEntries =
    typeof packageJson.bin === "string"
      ? [packageJson.bin]
      : Object.values(packageJson.bin ?? {});

  for (const binEntry of binEntries) {
    requiredFiles.add(binEntry.replace(/^\.\//, ""));
  }

  return requiredFiles;
}

export function missingPackedFiles(packageJson, packedFilePaths) {
  const packedFiles = new Set(packedFilePaths);
  return [...requiredPackedFiles(packageJson)].filter((file) => !packedFiles.has(file));
}

async function main() {
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });

  const [packument] = JSON.parse(output);
  const missing = missingPackedFiles(
    packageJson,
    packument.files.map((file) => file.path),
  );

  if (missing.length > 0) {
    console.error(`${packageJson.name} package smoke failed; missing packed file(s):`);
    for (const file of missing) {
      console.error(`- ${file}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`${packageJson.name} package smoke passed with ${packument.files.length} packed file(s).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
