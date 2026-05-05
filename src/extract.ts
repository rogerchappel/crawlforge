import type { CrawlInput } from "./types.js";

export function pageText(page: CrawlInput): string {
  if (page.text) return page.text.trim();
  if (!page.html) return "";
  return page.html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function pageLinks(page: CrawlInput): string[] {
  if (page.links) return page.links;
  if (!page.html) return [];
  const links: string[] = [];
  for (const match of page.html.matchAll(/href=["']([^"']+)["']/gi)) {
    if (match[1]) links.push(match[1]);
  }
  return links;
}
