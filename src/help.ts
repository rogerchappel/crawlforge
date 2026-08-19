export function helpText(): string {
  return `crawlforge — deterministic local-first crawl fixture inspector

Usage:
  crawlforge inspect <fixture-dir> [options]

Options:
  -o, --output <dir>       Output directory (default: out/crawlforge)
      --format <mode>      markdown, json, or both (default: both)
      --max-depth <n>      Queue same-origin fixture links to this depth (default: 1)
      --manifest <file>    Manifest filename (default: manifest.json)
      --user-agent <name>  User agent used to select robots policy
      --dry-run            Build queue and manifest in memory only
  -h, --help               Show help

Safety:
  crawlforge does not fetch the network. V1 reads explicit local fixtures only.
`;
}
