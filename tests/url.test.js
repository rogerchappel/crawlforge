import assert from "node:assert/strict";
import test from "node:test";
import { normalizeUrl, resolveFixtureLink, stableId } from "../dist/index.js";

test("normalizes URLs deterministically", () => {
  assert.equal(normalizeUrl("HTTPS://Example.TEST:443/docs/?b=2&a=1#top"), "https://example.test/docs?a=1&b=2");
});

test("resolves fixture links relative to page URLs", () => {
  assert.equal(resolveFixtureLink("https://example.test/docs", "/guide#intro"), "https://example.test/guide");
});

test("stable ids are short repeatable hashes", () => {
  assert.equal(stableId("https://example.test/"), stableId("https://example.test/"));
  assert.equal(stableId("https://example.test/").length, 16);
});
