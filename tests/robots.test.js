import assert from "node:assert/strict";
import test from "node:test";
import { isAllowed, parseRobotsConfig } from "../dist/index.js";

test("robots config parses allow disallow and crawl delay", () => {
  const policy = parseRobotsConfig("User-agent: bot\nDisallow: /private\nAllow: /private/ok\nCrawl-delay: 0.25\n");
  assert.equal(policy.userAgent, "bot");
  assert.equal(policy.crawlDelayMs, 250);
  assert.equal(isAllowed("https://example.test/public", policy), true);
  assert.equal(isAllowed("https://example.test/private", policy), false);
  assert.equal(isAllowed("https://example.test/private/ok", policy), true);
});
