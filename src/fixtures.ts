import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { CrawlInput, RobotsPolicy } from "./types.js";
import { defaultPolicy, parseRobotsConfig } from "./robots.js";

export interface FixtureBundle {
  pages: CrawlInput[];
  policy: RobotsPolicy;
}

export async function loadFixtureBundle(inputDir: string, userAgent: string = defaultPolicy.userAgent): Promise<FixtureBundle> {
  const entries = await readdir(inputDir, { withFileTypes: true });
  const pages: CrawlInput[] = [];
  let policy = defaultPolicy;

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const path = join(inputDir, entry.name);
    if (entry.name === "robots.txt" || entry.name === "robots.crawlforge") {
      policy = parseRobotsConfig(await readFile(path, "utf8"), defaultPolicy, userAgent);
      continue;
    }
    if (!entry.name.endsWith(".json")) continue;
    const parsed: unknown = JSON.parse(await readFile(path, "utf8"));
    pages.push(validateFixture(entry.name, parsed));
  }

  pages.sort((a, b) => scoreUrl(a.url) - scoreUrl(b.url) || a.url.localeCompare(b.url));
  return { pages, policy };
}

function validateFixture(filename: string, value: unknown): CrawlInput {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`Fixture ${filename} must be a JSON object`);
  }

  const fixture = value as Record<string, unknown>;
  if (typeof fixture.url !== "string" || fixture.url.length === 0) {
    throw new Error(`Fixture ${filename} field url must be a non-empty absolute URL`);
  }
  try {
    new URL(fixture.url);
  } catch {
    throw new Error(`Fixture ${filename} field url must be a non-empty absolute URL`);
  }

  for (const field of ["title", "html", "text", "discoveredAt"] as const) {
    if (fixture[field] !== undefined && typeof fixture[field] !== "string") {
      throw new Error(`Fixture ${filename} field ${field} must be a string`);
    }
  }
  if (fixture.links !== undefined) {
    if (!Array.isArray(fixture.links)) {
      throw new Error(`Fixture ${filename} field links must be an array of strings`);
    }
    const invalidIndex = fixture.links.findIndex((link) => typeof link !== "string");
    if (invalidIndex !== -1) {
      throw new Error(`Fixture ${filename} field links[${invalidIndex}] must be a string`);
    }
  }

  return fixture as unknown as CrawlInput;
}

function scoreUrl(url: string): number {
  const path = new URL(url).pathname;
  return path === "/" ? 0 : path.split("/").filter(Boolean).length + 1;
}
