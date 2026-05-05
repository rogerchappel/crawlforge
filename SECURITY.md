# Security Policy

crawlforge V1 is local-first and fixture-only. It should not fetch URLs, read browser state, collect credentials, or transmit telemetry.

## Supported versions

| Version | Supported |
| --- | --- |
| 0.1.x | yes |

## Reporting a vulnerability

Please report security issues privately through GitHub security advisories when available, or by contacting the maintainer directly. Do not open a public issue with exploit details.

## Security expectations

- Network access must remain opt-in and documented.
- Fixtures should be treated as untrusted input.
- Output paths must remain explicit.
- Manifests should avoid secrets and environment-specific credentials.

## Current non-goals

- Authenticated crawling.
- Browser automation.
- Credential or cookie handling.
- Background crawling services.
