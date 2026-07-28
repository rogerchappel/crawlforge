import type { InspectOptions, OutputFormat } from "./types.js";

export function parseArgs(argv: string[]): { command: "help" } | { command: "inspect"; options: InspectOptions } {
  const [command, ...rest] = argv;
  if (!command || command === "--help" || command === "-h" || command === "help") return { command: "help" };
  if (command !== "inspect") throw new Error(`Unknown command: ${command}`);
  const input = rest.shift();
  if (!input) throw new Error("inspect requires an input fixture directory");
  const options: InspectOptions = {
    input,
    output: "out/crawlforge",
    format: "both",
    userAgent: "crawlforge-fixture-bot",
    maxDepth: 1,
    manifestName: "manifest.json",
    dryRun: false
  };
  for (let index = 0; index < rest.length; index += 1) {
    const flag = rest[index];
    const value = rest[index + 1];
    if (flag === "--dry-run") { options.dryRun = true; continue; }
    if (!value) throw new Error(`${flag} requires a value`);
    if (flag === "--output" || flag === "-o") options.output = value;
    else if (flag === "--format") options.format = value as OutputFormat | "both";
    else if (flag === "--user-agent") options.userAgent = value;
    else if (flag === "--max-depth") {
      const maxDepth = Number(value);
      if (!Number.isSafeInteger(maxDepth) || maxDepth < 0) {
        throw new Error("--max-depth must be a non-negative integer");
      }
      options.maxDepth = maxDepth;
    }
    else if (flag === "--manifest") options.manifestName = value;
    else throw new Error(`Unknown option: ${flag}`);
    index += 1;
  }
  if (!["markdown", "json", "both"].includes(options.format)) throw new Error("--format must be markdown, json, or both");
  return { command: "inspect", options };
}
