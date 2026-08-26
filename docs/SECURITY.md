# Security

## Implemented in prototype

- React text rendering; no unsafe HTML injection.
- Zod form validation and bounded input lengths/numbers.
- Local photo type and 3 MB size checks; object URL preview only; no upload/execution.
- No secrets, credentials, tokens, database, or hidden bypass.
- Central demo permissions for UX and confirmation dialogs for approvals/rejections/config impact.
- Clear warnings that localStorage and prototype roles are not secure.
- Patched runtime dependency baseline verified by audit.
- Public provider calls are user-triggered, bounded, time-limited, and tolerate partial failure. Selected coordinates are sent to OpenStreetMap/Overpass and Open-Meteo only when the user requests public context.

## Required for production

Real authentication, MFA where appropriate, server-side RBAC/ABAC, RLS, parameterized queries, schema validation, CSRF strategy, SSRF egress controls, CSP/security headers, output encoding, safe redirects/URLs, private file storage, malware scanning, signed downloads, rate limiting, API quotas, secret management, encryption, audit logs, monitoring, backups, restore tests, disaster recovery, dependency/SAST/DAST scanning, incident response, and penetration testing.

Thailand PDPA work must cover purpose, minimization, consent/legal basis, retention, data-subject rights, processor agreements, cross-border transfer, breach handling, and privacy notices. Obtain legal review.

The prototype is not production secure.
