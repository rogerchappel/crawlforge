import { createHash } from "node:crypto";

export function normalizeUrl(raw: string): string {
  const parsed = new URL(raw);
  parsed.hash = "";
  parsed.hostname = parsed.hostname.toLowerCase();
  if ((parsed.protocol === "https:" && parsed.port === "443") || (parsed.protocol === "http:" && parsed.port === "80")) {
    parsed.port = "";
  }
  if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }
  parsed.searchParams.sort();
  return parsed.toString();
}

export function stableId(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

export function sameOrigin(a: string, b: string): boolean {
  return new URL(a).origin === new URL(b).origin;
}

export function resolveFixtureLink(base: string, href: string): string {
  return normalizeUrl(new URL(href, base).toString());
}
