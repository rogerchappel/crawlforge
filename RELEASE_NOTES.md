# Release Notes

## 0.2.0

### Summary

- Publish the first npm registry package with trusted publishing and provenance.
- Add bounded fixture traversal, write-free dry runs, stricter fixture validation, and standards-aligned robots rule precedence.

### Verification

- `npm run release:check`
- `npm pack --dry-run`

### Upgrade Notes

- This is the first registry release. Existing source-checkout usage remains compatible.

### Maintainer Notes

- Before tagging, confirm `gh release view v0.2.0` reports that the GitHub release does not exist and `npm view crawlforge@0.2.0 version` reports that the package version is unpublished.
