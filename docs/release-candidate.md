# Release candidate readiness

## Summary
- Branch prepared for release-candidate readiness review.
- Local verification status: **FAIL**
- Detailed command output is captured in `.rc_check.log`.

## Checks run
1. `npm run release:check`
2. `bash scripts/validate.sh`
3. `node /Users/roger/Developer/my-opensource/releasebox/bin/releasebox.js check .`

## Result
```

> crawlforge@0.1.0 build
> tsc -p tsconfig.json

src/cli.ts(7,28): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
src/cli.ts(9,5): error TS2584: Cannot find name 'console'. Do you need to change your target library? Try changing the 'lib' compiler option to include 'dom'.
src/cli.ts(12,5): error TS2584: Cannot find name 'console'. Do you need to change your target library? Try changing the 'lib' compiler option to include 'dom'.
src/cli.ts(15,3): error TS2584: Cannot find name 'console'. Do you need to change your target library? Try changing the 'lib' compiler option to include 'dom'.
src/cli.ts(16,3): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
src/fixtures.ts(1,35): error TS2307: Cannot find module 'node:fs/promises' or its corresponding type declarations.
src/fixtures.ts(2,22): error TS2307: Cannot find module 'node:path' or its corresponding type declarations.
src/fixtures.ts(34,20): error TS2552: Cannot find name 'URL'. Did you mean 'url'?
src/inspect.ts(1,23): error TS2307: Cannot find module 'node:fs/promises' or its corresponding type declarations.
src/manifest.ts(1,27): error TS2307: Cannot find module 'node:fs/promises' or its corresponding type declarations.
src/manifest.ts(2,22): error TS2307: Cannot find module 'node:path' or its corresponding type declarations.
src/robots.ts(29,20): error TS2552: Cannot find name 'URL'. Did you mean 'url'?
src/url.ts(1,28): error TS2307: Cannot find module 'node:crypto' or its corresponding type declarations.
src/url.ts(4,22): error TS2304: Cannot find name 'URL'.
src/url.ts(22,14): error TS2304: Cannot find name 'URL'.
src/url.ts(22,36): error TS2304: Cannot find name 'URL'.
src/url.ts(26,27): error TS2304: Cannot find name 'URL'.
src/writers.ts(1,34): error TS2307: Cannot find module 'node:fs/promises' or its corresponding type declarations.
src/writers.ts(2,22): error TS2307: Cannot find module 'node:path' or its corresponding type declarations.
FAIL: package script: release:check
NOTE: agent-qc not installed; skipping optional agent check

Validation failed.

## releasebox
✅ releasebox config: node-cli
✅ ci workflow: .github/workflows/ci.yml
✅ release dry run workflow: .github/workflows/release-dry-run.yml
✅ task breakdown: docs/TASKS.md
✅ orchestration plan: docs/ORCHESTRATION.md
✅ dependabot config: .github/dependabot.yml
✅ npm test script: npm run build && node --test tests/*.test.js
✅ build script: tsc -p tsconfig.json
✅ smoke script: npm run build && bash scripts/smoke.sh
✅ bin entry: {"crawlforge":"./dist/cli.js"}
RESULT release_check=2 validate=1 releasebox=0
```
