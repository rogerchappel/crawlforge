import type { QueueItem } from "./types.js";
import { normalizeUrl, stableId } from "./url.js";

export class CrawlQueue {
  readonly items: QueueItem[] = [];
  readonly skipped: Array<{ url: string; reason: string }> = [];
  private readonly seen = new Set<string>();

  enqueue(url: string, depth = 0, source?: string): QueueItem | undefined {
    const normalizedUrl = normalizeUrl(url);
    if (this.seen.has(normalizedUrl)) {
      this.skipped.push({ url, reason: "duplicate" });
      return undefined;
    }
    this.seen.add(normalizedUrl);
    const item: QueueItem = { id: stableId(normalizedUrl), url, normalizedUrl, depth, ...(source ? { source } : {}) };
    this.items.push(item);
    return item;
  }

  enqueueMany(urls: string[], depth = 0, source?: string): QueueItem[] {
    return urls.map((url) => this.enqueue(url, depth, source)).filter((item): item is QueueItem => Boolean(item));
  }
}
