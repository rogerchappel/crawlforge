# Fixture Format

crawlforge fixtures are plain JSON files in a directory. Each page fixture needs a `url` and may include `title`, `html`, `text`, `links`, and `discoveredAt`.

Same-origin links are traversed only when a fixture with the resolved URL exists.
Links without a corresponding fixture are recorded in the manifest with the
`missing-fixture` skip reason and are never counted as queued pages.

Each fixture must be a JSON object. `url` must be a non-empty absolute `http:`
or `https:` URL; local-file, data, and other URL schemes are rejected before
queueing or writing output.
`title`, `html`, `text`, and `discoveredAt`, when supplied, must be strings;
and `links`, when supplied, must be an array containing only strings. Invalid
fixtures fail before pages are queued or output is written, with an error that
identifies the fixture filename and invalid field.

```json
{
  "url": "https://example.test/docs",
  "title": "Docs",
  "text": "A deterministic page body.",
  "links": ["/", "/guide"]
}
```

When `links` are omitted, crawlforge extracts `href` values from `html`. Relative links are resolved against the page URL and normalized before queueing.

Artifact basenames are the stable ID of the normalized fixture URL shown in the
manifest queue item. URL variations such as host casing, default ports,
fragments, trailing slashes, and query ordering therefore map to the same queue
item and artifact basename. When multiple fixtures normalize to the same URL,
the deterministic fixture ordering selects one page and records the others as
`duplicate` skips; they never create ambiguous artifacts.

Add `robots.txt` to model politeness:

```txt
User-agent: crawlforge-fixture-bot
Disallow: /private
Crawl-delay-ms: 250
```

For a requested path, crawlforge applies the longest matching `Allow` or `Disallow` rule. When the longest matching rules are equally specific, `Allow` takes precedence.

`Crawl-delay` is expressed in seconds and `Crawl-delay-ms` in milliseconds. Both accept finite, non-negative decimal values. Invalid, non-finite, or negative delay directives are ignored, leaving the previous fallback or valid delay unchanged.
