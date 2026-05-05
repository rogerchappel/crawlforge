export type OutputFormat = "markdown" | "json";

export interface CrawlInput {
  url: string;
  title?: string;
  html?: string;
  text?: string;
  links?: string[];
  discoveredAt?: string;
}

export interface QueueItem {
  id: string;
  url: string;
  normalizedUrl: string;
  depth: number;
  source?: string;
}

export interface RobotsPolicy {
  userAgent: string;
  allow: string[];
  disallow: string[];
  crawlDelayMs: number;
}

export interface CrawlManifest {
  manifestVersion: 1;
  createdAt: string;
  input: string;
  output: string;
  userAgent: string;
  maxDepth: number;
  queued: QueueItem[];
  skipped: Array<{ url: string; reason: string }>;
  written: Array<{ url: string; markdown?: string; json?: string }>;
  policy: RobotsPolicy;
}

export interface InspectOptions {
  input: string;
  output: string;
  format: OutputFormat | "both";
  userAgent: string;
  maxDepth: number;
  manifestName: string;
  dryRun: boolean;
}
