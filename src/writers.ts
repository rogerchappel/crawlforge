import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { CrawlInput, OutputFormat } from "./types.js";
import { stableId } from "./url.js";
import { pageText } from "./extract.js";

export interface WriteResult {
  url: string;
  markdown?: string;
  json?: string;
}

export function markdownForPage(page: CrawlInput): string {
  const title = page.title ?? page.url;
  return [`# ${title}`, "", `Source: ${page.url}`, "", pageText(page), ""].join("\n");
}

export async function writePage(outputDir: string, page: CrawlInput, format: OutputFormat | "both"): Promise<WriteResult> {
  await mkdir(outputDir, { recursive: true });
  const base = stableId(page.url);
  const result: WriteResult = { url: page.url };
  if (format === "markdown" || format === "both") {
    result.markdown = join(outputDir, `${base}.md`);
    await writeFile(result.markdown, markdownForPage(page), "utf8");
  }
  if (format === "json" || format === "both") {
    result.json = join(outputDir, `${base}.json`);
    await writeFile(result.json, `${JSON.stringify(page, null, 2)}\n`, "utf8");
  }
  return result;
}
