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

test("robots rules use longest-match precedence with Allow winning ties", () => {
  const policy = {
    userAgent: "bot",
    allow: ["/same", "/allowed/deeper"],
    disallow: ["/same", "/allowed", "/blocked/deeper"],
    crawlDelayMs: 0
  };

  assert.equal(isAllowed("https://example.test/same", policy), true, "equal-length Allow wins");
  assert.equal(isAllowed("https://example.test/allowed/deeper", policy), true, "longer Allow wins");
  assert.equal(isAllowed("https://example.test/blocked/deeper", policy), false, "longer Disallow wins");
});

test("explicit robots rules replace fallback path rules", () => {
  const policy = parseRobotsConfig("User-agent: bot\nDisallow: /\n");

  assert.deepEqual(policy.allow, []);
  assert.deepEqual(policy.disallow, ["/"]);
  assert.equal(isAllowed("https://example.test/", policy), false);
  assert.equal(isAllowed("https://example.test/private", policy), false);
});

test("explicit Allow rules retain tie and specificity precedence", () => {
  const policy = parseRobotsConfig([
    "User-agent: bot",
    "Disallow: /",
    "Allow: /",
    "Disallow: /private",
    "Allow: /private/public"
  ].join("\n"));

  assert.equal(isAllowed("https://example.test/", policy), true, "equal-length Allow wins");
  assert.equal(isAllowed("https://example.test/private", policy), false);
  assert.equal(isAllowed("https://example.test/private/public", policy), true, "more-specific Allow wins");
});

test("crawl delays accept finite non-negative values and ignore invalid directives", () => {
  assert.equal(parseRobotsConfig("Crawl-delay: 0").crawlDelayMs, 0);
  assert.equal(parseRobotsConfig("Crawl-delay: 0.25").crawlDelayMs, 250);
  assert.equal(parseRobotsConfig("Crawl-delay-ms: 12.5").crawlDelayMs, 12.5);

  for (const value of ["nope", "-2", "Infinity", "1 second"]) {
    assert.equal(parseRobotsConfig(`Crawl-delay: ${value}`).crawlDelayMs, 1000, value);
    assert.equal(parseRobotsConfig(`Crawl-delay-ms: ${value}`).crawlDelayMs, 1000, value);
  }
});
