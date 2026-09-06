import type { InspectOptions } from "./types.js";
import { loadFixtureBundle } from "./fixtures.js";
import { CrawlQueue } from "./queue.js";
import { isAllowed } from "./robots.js";
import { pageLinks } from "./extract.js";
import { normalizeUrl, resolveFixtureLink, sameOrigin } from "./url.js";
import { writePage } from "./writers.js";
import { createManifest, writeManifest } from "./manifest.js";

export async function inspectFixtures(options: InspectOptions) {
  const bundle = await loadFixtureBundle(options.input, options.userAgent);
  const queue = new CrawlQueue();
  const written = [];
  const pagesByUrl = new Map(bundle.pages.map((page) => [normalizeUrl(page.url), page]));
  const allowedPages = bundle.pages.filter((page) => isAllowed(page.url, bundle.policy));
  const linkedFixtureUrls = new Set<string>();

  for (const page of allowedPages) {
    for (const href of pageLinks(page)) {
      const resolved = resolveFixtureLink(page.url, href);
      const linkedPage = pagesByUrl.get(resolved);
      if (sameOrigin(page.url, resolved) && linkedPage && isAllowed(linkedPage.url, bundle.policy)) linkedFixtureUrls.add(resolved);
    }
  }

  for (const page of bundle.pages) {
    if (!isAllowed(page.url, bundle.policy)) queue.skipped.push({ url: page.url, reason: "robots-disallow" });
  }

  const seeds = allowedPages.filter((page) => !linkedFixtureUrls.has(normalizeUrl(page.url)));
  const reachable = new Set<string>();
  const markReachable = (seedUrl: string) => {
    const pending = [seedUrl];
    while (pending.length > 0) {
      const url = pending.shift()!;
      if (reachable.has(url)) continue;
      reachable.add(url);
      const page = pagesByUrl.get(url);
      if (!page) continue;
      for (const href of pageLinks(page)) {
        const resolved = resolveFixtureLink(page.url, href);
        const linkedPage = pagesByUrl.get(resolved);
        if (sameOrigin(page.url, resolved) && linkedPage && isAllowed(linkedPage.url, bundle.policy)) pending.push(resolved);
      }
    }
  };

  for (const page of seeds) markReachable(normalizeUrl(page.url));
  for (const page of allowedPages) {
    const normalizedUrl = normalizeUrl(page.url);
    if (!reachable.has(normalizedUrl)) {
      seeds.push(page);
      markReachable(normalizedUrl);
    }
  }

  for (const page of seeds) {
    queue.enqueue(page.url, 0);
  }

  for (let index = 0; index < queue.items.length; index += 1) {
    const item = queue.items[index]!;
    const page = pagesByUrl.get(item.normalizedUrl);
    if (!page) continue;
    if (!options.dryRun) written.push(await writePage(options.output, page, options.format));
    if (item.depth >= options.maxDepth) continue;

    for (const href of pageLinks(page)) {
      const resolved = resolveFixtureLink(page.url, href);
      if (!sameOrigin(page.url, resolved)) continue;
      if (!pagesByUrl.has(resolved)) {
        queue.skipped.push({ url: resolved, reason: "missing-fixture" });
        continue;
      }
      if (!isAllowed(resolved, bundle.policy)) {
        queue.skipped.push({ url: resolved, reason: "robots-disallow" });
        continue;
      }
      queue.enqueue(resolved, item.depth + 1, page.url);
    }
  }

  const manifest = createManifest({ options, queued: queue.items, skipped: queue.skipped, written, policy: bundle.policy });
  const manifestPath = options.dryRun ? undefined : await writeManifest(options.output, options.manifestName, manifest);
  return { manifest, manifestPath };
}
