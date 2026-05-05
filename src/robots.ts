import type { RobotsPolicy } from "./types.js";

export const defaultPolicy: RobotsPolicy = {
  userAgent: "crawlforge-fixture-bot",
  allow: ["/"],
  disallow: [],
  crawlDelayMs: 1000
};

export function parseRobotsConfig(text: string, fallback: RobotsPolicy = defaultPolicy): RobotsPolicy {
  const policy: RobotsPolicy = { ...fallback, allow: [...fallback.allow], disallow: [...fallback.disallow] };
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    if (!line) continue;
    const [rawKey, ...rest] = line.split(":");
    const key = rawKey?.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (!key || !value) continue;
    if (key === "user-agent") policy.userAgent = value;
    if (key === "allow") policy.allow.push(value);
    if (key === "disallow") policy.disallow.push(value);
    if (key === "crawl-delay-ms") policy.crawlDelayMs = Number.parseInt(value, 10);
    if (key === "crawl-delay") policy.crawlDelayMs = Number.parseFloat(value) * 1000;
  }
  return policy;
}

export function isAllowed(url: string, policy: RobotsPolicy): boolean {
  const path = new URL(url).pathname;
  const blocked = policy.disallow.some((rule) => rule !== "" && path.startsWith(rule));
  if (!blocked) return true;
  return policy.allow.some((rule) => rule !== "" && path.startsWith(rule));
}
