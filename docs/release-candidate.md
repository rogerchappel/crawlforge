# Release candidate readiness

## Reproducible check

From a clean checkout of the release candidate, install the locked dependencies and run the repository's complete release check:

```sh
npm ci
npm run release:check
git diff --check
```

`release:check` runs the type-check, test suite, CLI smoke test, package smoke test, and release metadata check. The package smoke test packs the real artifact with `npm pack --json`, installs the tarball in a temporary project, executes its CLI, and fails if the runtime entry points or documented release artifacts are missing.

## Current evidence

The release check passes on the current repository state. Its packed-file regression test confirms that `README.md`, `LICENSE`, `SECURITY.md`, `SUPPORT.md`, and `RELEASE_NOTES.md` are present in the npm package.
