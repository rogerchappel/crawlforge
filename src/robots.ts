import type { RobotsPolicy } from "./types.js";

export const defaultPolicy: RobotsPolicy = {
  userAgent: "crawlforge-fixture-bot",
  allow: ["/"],
  disallow: [],
  crawlDelayMs: 1000
};

interface RobotsGroup {
  agents: string[];
  allow: string[];
  disallow: string[];
  crawlDelayMs?: number;
}

export function parseRobotsConfig(
  text: string,
  fallback: RobotsPolicy = defaultPolicy,
  requestedUserAgent?: string
): RobotsPolicy {
  const groups: RobotsGroup[] = [];
  let group: RobotsGroup | undefined;
  let hasDirectives = false;

  const ensureGroup = (): RobotsGroup => {
    group ??= { agents: ["*"], allow: [], disallow: [] };
    return group;
  };
  const finishGroup = (): void => {
    if (group) groups.push(group);
    group = undefined;
    hasDirectives = false;
  };

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    if (!line) continue;
    const [rawKey, ...rest] = line.split(":");
    const key = rawKey?.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (!key || !value) continue;
    if (key === "user-agent") {
      if (group && hasDirectives) finishGroup();
      if (!group) group = { agents: [], allow: [], disallow: [] };
      group.agents.push(value);
      continue;
    }
    if (key === "allow" || key === "disallow") {
      ensureGroup()[key].push(value);
      hasDirectives = true;
    }
    if (key === "crawl-delay-ms" || key === "crawl-delay") {
      const delay = parseCrawlDelay(value, key === "crawl-delay" ? 1000 : 1);
      if (delay !== undefined) ensureGroup().crawlDelayMs = delay;
      hasDirectives = true;
    }
  }
  finishGroup();

  const effectiveUserAgent = requestedUserAgent
    ?? groups.flatMap((candidate) => candidate.agents).find((agent) => agent !== "*")
    ?? fallback.userAgent;
  const requested = effectiveUserAgent.toLowerCase();
  const scores = groups.map((candidate) => Math.max(...candidate.agents.map((agent) => {
    const token = agent.toLowerCase();
    return token === "*" ? 0 : requested.includes(token) ? token.length : -1;
  })));
  const bestSpecificScore = Math.max(-1, ...scores);
  const selected = groups.filter((_, index) => scores[index] === bestSpecificScore && bestSpecificScore >= 0);
  const matchingGroups = selected.length > 0
    ? selected
    : groups.filter((candidate) => candidate.agents.some((agent) => agent === "*"));

  if (matchingGroups.length === 0) {
    return { ...fallback, userAgent: effectiveUserAgent, allow: [...fallback.allow], disallow: [...fallback.disallow] };
  }

  const hasPathRules = matchingGroups.some((candidate) => candidate.allow.length > 0 || candidate.disallow.length > 0);
  const policy: RobotsPolicy = {
    ...fallback,
    userAgent: effectiveUserAgent,
    allow: hasPathRules ? matchingGroups.flatMap((candidate) => candidate.allow) : [...fallback.allow],
    disallow: hasPathRules ? matchingGroups.flatMap((candidate) => candidate.disallow) : [...fallback.disallow]
  };
  for (const candidate of matchingGroups) {
    if (candidate.crawlDelayMs !== undefined) policy.crawlDelayMs = candidate.crawlDelayMs;
  }
  return policy;
}

function parseCrawlDelay(value: string, multiplier: number): number | undefined {
  const parsed = Number(value);
  const milliseconds = parsed * multiplier;
  if (Number.isFinite(milliseconds) && milliseconds >= 0) {
    return milliseconds;
  }
  return undefined;
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
