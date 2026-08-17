# Fixture Format

crawlforge fixtures are plain JSON files in a directory. Each page fixture needs a `url` and may include `title`, `html`, `text`, `links`, and `discoveredAt`.

Each fixture must be a JSON object. `url` must be a non-empty absolute URL;
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

Add `robots.txt` to model politeness:

```txt
User-agent: crawlforge-fixture-bot
Disallow: /private
Crawl-delay-ms: 250
```

For a requested path, crawlforge applies the longest matching `Allow` or `Disallow` rule. When the longest matching rules are equally specific, `Allow` takes precedence.

`Crawl-delay` is expressed in seconds and `Crawl-delay-ms` in milliseconds. Both accept finite, non-negative decimal values. Invalid, non-finite, or negative delay directives are ignored, leaving the previous fallback or valid delay unchanged.
