import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { loadFixtureBundle } from "../dist/fixtures.js";

async function loadFixture(value) {
  const directory = await mkdtemp(join(tmpdir(), "crawlforge-fixture-"));
  await writeFile(join(directory, "page.json"), JSON.stringify(value));
  return loadFixtureBundle(directory);
}

test("loads fixtures that satisfy the documented page contract", async () => {
  for (const url of ["http://example.test/", "https://example.test/"]) {
    const page = { url, title: "Example", html: "<p>Hello</p>", text: "Hello", links: ["/docs"], discoveredAt: "2026-01-01" };
    assert.deepEqual((await loadFixture(page)).pages, [page]);
  }
});

test("rejects absolute fixture URLs with non-web schemes", async () => {
  for (const url of ["file:///tmp/local", "data:text/plain,hello", "ftp://example.test/page"]) {
    await assert.rejects(loadFixture({ url }), /page\.json field url must use http: or https:/);
  }
});

test("rejects non-object fixtures and missing or malformed URLs", async () => {
  await assert.rejects(loadFixture([]), /page\.json must be a JSON object/);
  await assert.rejects(loadFixture({}), /page\.json field url must be a non-empty absolute URL/);
  await assert.rejects(loadFixture({ url: "/relative" }), /page\.json field url must be a non-empty absolute URL/);
});

test("rejects invalid optional fixture fields with field-specific errors", async () => {
  for (const field of ["title", "html", "text", "discoveredAt"]) {
    await assert.rejects(loadFixture({ url: "https://example.test/", [field]: 42 }), new RegExp(`page\\.json field ${field} must be a string`));
  }
  await assert.rejects(loadFixture({ url: "https://example.test/", links: "not-an-array" }), /page\.json field links must be an array of strings/);
  await assert.rejects(loadFixture({ url: "https://example.test/", links: ["/", 42] }), /page\.json field links\[1\] must be a string/);
});
