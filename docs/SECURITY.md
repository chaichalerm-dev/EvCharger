# Security

## Implemented in prototype

- React text rendering; no unsafe HTML injection.
- Zod form validation and bounded input lengths/numbers.
- Local photo type and 3 MB size checks; object URL preview only; no upload/execution.
- No committed secrets, credentials, production tokens, database, or hidden bypass.
- Runtime endpoint validation permits HTTPS and localhost HTTP only.
- User-entered tokens are held only in page memory and clear on refresh; they are not written to localStorage, source, Git, or the deployed artifact.
- Central demo permissions for UX and confirmation dialogs for approvals/rejections/config impact.
- Clear warnings that localStorage and prototype roles are not secure.
- Patched runtime dependency baseline verified by audit.
- Public provider calls are user-triggered, bounded, time-limited, and tolerate partial failure. Selected coordinates/polygons may be sent to Nominatim, Overpass, Open-Meteo, WorldPop, and optional TomTom when the user requests context.

## Required for production

Real authentication, MFA where appropriate, server-side RBAC/ABAC, RLS, parameterized queries, schema validation, CSRF strategy, SSRF egress controls, CSP/security headers, output encoding, safe redirects/URLs, private file storage, malware scanning, signed downloads, rate limiting, API quotas, secret management, encryption, audit logs, monitoring, backups, restore tests, disaster recovery, dependency/SAST/DAST scanning, incident response, and penetration testing.

Thailand PDPA work must cover purpose, minimization, consent/legal basis, retention, data-subject rights, processor agreements, cross-border transfer, breach handling, and privacy notices. Obtain legal review.

Browser-visible API keys are not secrets. Production credentials must use a same-origin backend/BFF, secure session, server-side secret manager, provider allow-list, rotation, and audited access. The prototype is not production secure.
