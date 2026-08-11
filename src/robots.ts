import type { RobotsPolicy } from "./types.js";

export const defaultPolicy: RobotsPolicy = {
  userAgent: "crawlforge-fixture-bot",
  allow: ["/"],
  disallow: [],
  crawlDelayMs: 1000
};

export function parseRobotsConfig(text: string, fallback: RobotsPolicy = defaultPolicy): RobotsPolicy {
  const policy: RobotsPolicy = { ...fallback, allow: [...fallback.allow], disallow: [...fallback.disallow] };
  let hasExplicitPathRules = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    if (!line) continue;
    const [rawKey, ...rest] = line.split(":");
    const key = rawKey?.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (!key || !value) continue;
    if (key === "user-agent") policy.userAgent = value;
    if (key === "allow" || key === "disallow") {
      if (!hasExplicitPathRules) {
        policy.allow = [];
        policy.disallow = [];
        hasExplicitPathRules = true;
      }
      policy[key].push(value);
    }
    if (key === "crawl-delay-ms") setCrawlDelay(policy, value, 1);
    if (key === "crawl-delay") setCrawlDelay(policy, value, 1000);
  }
  return policy;
}

function setCrawlDelay(policy: RobotsPolicy, value: string, multiplier: number): void {
  const parsed = Number(value);
  const milliseconds = parsed * multiplier;
  if (Number.isFinite(milliseconds) && milliseconds >= 0) {
    policy.crawlDelayMs = milliseconds;
  }
}

export function isAllowed(url: string, policy: RobotsPolicy): boolean {
  const path = new URL(url).pathname;
  const longestDisallow = longestMatchingRule(path, policy.disallow);
  const longestAllow = longestMatchingRule(path, policy.allow);
  if (!longestDisallow) return true;
  return Boolean(longestAllow && longestAllow.length >= longestDisallow.length);
}

function longestMatchingRule(path: string, rules: string[]): string | undefined {
  return rules
    .filter((rule) => rule !== "" && path.startsWith(rule))
    .sort((a, b) => b.length - a.length)[0];
}
