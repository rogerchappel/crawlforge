import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { markdownForPage, writePage } from "../dist/index.js";

test("markdown writer escapes title markup and prevents injected headings", () => {
  const page = { url: "https://example.test/", title: "Home\n\n## Injected *bold*", html: "<p>Body text</p>" };
  const markdown = markdownForPage(page);
  assert.equal((markdown.match(/^#{1,6}\s/gm) ?? []).length, 1);
  assert.ok(markdown.includes("\\#\\# Injected"));
  assert.ok(markdown.includes("\\*bold\\*"));
  assert.ok(markdown.includes("Source: https://example.test/"));
  assert.match(markdown, /Body text/);
});

test("markdown writer includes title source and extracted text", async () => {
  const page = { url: "https://example.test/", title: "Home", html: "<h1>Hello</h1><p>World</p>" };
  assert.match(markdownForPage(page), /# Home/);
  const dir = await mkdtemp(join(tmpdir(), "crawlforge-writer-"));
  const result = await writePage(dir, page, "both");
  assert.ok(result.markdown);
  assert.ok(result.json);
  assert.match(await readFile(result.markdown, "utf8"), /Hello World/);
});
