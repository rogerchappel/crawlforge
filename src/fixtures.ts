import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { CrawlInput, RobotsPolicy } from "./types.js";
import { defaultPolicy, parseRobotsConfig } from "./robots.js";

export interface FixtureBundle {
  pages: CrawlInput[];
  policy: RobotsPolicy;
}

export async function loadFixtureBundle(inputDir: string): Promise<FixtureBundle> {
  const entries = await readdir(inputDir, { withFileTypes: true });
  const pages: CrawlInput[] = [];
  let policy = defaultPolicy;

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const path = join(inputDir, entry.name);
    if (entry.name === "robots.txt" || entry.name === "robots.crawlforge") {
      policy = parseRobotsConfig(await readFile(path, "utf8"));
      continue;
    }
    if (!entry.name.endsWith(".json")) continue;
    const parsed = JSON.parse(await readFile(path, "utf8")) as CrawlInput;
    if (!parsed.url) throw new Error(`Fixture ${entry.name} is missing url`);
    pages.push(parsed);
  }

  pages.sort((a, b) => scoreUrl(a.url) - scoreUrl(b.url) || a.url.localeCompare(b.url));
  return { pages, policy };
}

function scoreUrl(url: string): number {
  const path = new URL(url).pathname;
  return path === "/" ? 0 : path.split("/").filter(Boolean).length + 1;
}
