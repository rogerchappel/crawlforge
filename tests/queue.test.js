import assert from "node:assert/strict";
import test from "node:test";
import { CrawlQueue } from "../dist/index.js";

test("queue dedupes normalized URLs and records skips", () => {
  const queue = new CrawlQueue();
  queue.enqueue("https://example.test/docs#one");
  queue.enqueue("https://example.test/docs#two");
  assert.equal(queue.items.length, 1);
  assert.deepEqual(queue.skipped, [{ url: "https://example.test/docs#two", reason: "duplicate" }]);
});
