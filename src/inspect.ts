import { mkdir } from "node:fs/promises";
import type { InspectOptions } from "./types.js";
import { loadFixtureBundle } from "./fixtures.js";
import { CrawlQueue } from "./queue.js";
import { isAllowed } from "./robots.js";
import { pageLinks } from "./extract.js";
import { resolveFixtureLink, sameOrigin } from "./url.js";
import { writePage } from "./writers.js";
import { createManifest, writeManifest } from "./manifest.js";

export async function inspectFixtures(options: InspectOptions) {
  const bundle = await loadFixtureBundle(options.input);
  const queue = new CrawlQueue();
  const written = [];

  for (const page of bundle.pages) {
    if (!isAllowed(page.url, bundle.policy)) {
      queue.skipped.push({ url: page.url, reason: "robots-disallow" });
      continue;
    }
    queue.enqueue(page.url, 0);
    if (!options.dryRun) written.push(await writePage(options.output, page, options.format));

    if (options.maxDepth > 0) {
      for (const href of pageLinks(page)) {
        const resolved = resolveFixtureLink(page.url, href);
        if (sameOrigin(page.url, resolved) && isAllowed(resolved, bundle.policy)) {
          queue.enqueue(resolved, 1, page.url);
        }
      }
    }
  }

  await mkdir(options.output, { recursive: true });
  const manifest = createManifest({ options, queued: queue.items, skipped: queue.skipped, written, policy: bundle.policy });
  const manifestPath = options.dryRun ? undefined : await writeManifest(options.output, options.manifestName, manifest);
  return { manifest, manifestPath };
}
