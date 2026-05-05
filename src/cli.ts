#!/usr/bin/env node
import { parseArgs } from "./args.js";
import { helpText } from "./help.js";
import { inspectFixtures } from "./inspect.js";

try {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.command === "help") {
    console.log(helpText());
  } else {
    const result = await inspectFixtures(parsed.options);
    console.log(JSON.stringify({ ok: true, queued: result.manifest.queued.length, skipped: result.manifest.skipped.length, manifest: result.manifestPath ?? null }, null, 2));
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
