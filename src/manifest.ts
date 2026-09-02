import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { CrawlManifest, InspectOptions, QueueItem, RobotsPolicy } from "./types.js";
import type { WriteResult } from "./writers.js";

export function createManifest(args: {
  options: InspectOptions;
  queued: QueueItem[];
  skipped: Array<{ url: string; reason: string }>;
  written: WriteResult[];
  policy: RobotsPolicy;
  createdAt?: string;
}): CrawlManifest {
  return {
    manifestVersion: 1,
    createdAt: args.createdAt ?? new Date().toISOString(),
    input: args.options.input,
    output: args.options.output,
    userAgent: args.options.userAgent,
    maxDepth: args.options.maxDepth,
    queued: args.queued,
    skipped: args.skipped,
    written: args.written,
    policy: args.policy
  };
}

export async function writeManifest(outputDir: string, name: string, manifest: CrawlManifest): Promise<string> {
  const path = join(outputDir, name);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return path;
}
