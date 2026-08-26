# AI Development Guide

## Mandatory workflow

Every coding agent must:

1. Read README.md.
2. Read this file.
3. Inspect existing code before editing.
4. Reuse existing components, services, domain types, and configuration.
5. Avoid duplicate logic.
6. Never expose secrets or sensitive personal data.
7. Never create backdoors, bypass routes, hidden passwords, or fake security.
8. Never silently change scoring, recommendation, station, financial, or permission rules.
9. Document architectural changes in the relevant guide and ADR.
10. Add or update tests for important behavior.
11. Update documentation when behavior changes.

## Project shape

- app: routes, providers, and CSS entry points.
- src/features: cohesive product features; pages stay thin.
- src/components: reusable layout and dialogs.
- src/domain: UI-independent models.
- src/config: geographic, scoring, station, lifecycle, and permission configuration.
- src/data/mock: realistic but explicitly fictional records.
- src/repositories: interfaces and replaceable implementations.
- src/services: validation, scoring, recommendation, search, and simulation.
- src/providers: future external-provider interfaces.
- tests and docs: verification and handoff material.

## Domain rules

- Estimated area is never treated as verified.
- Missing infrastructure is Unknown or Requires Site Survey.
- Important sourced records carry source, dates, confidence, and verification state.
- High flood risk overrides an otherwise strong score.
- Weights, thresholds, station assumptions, and geographic coverage live in configuration.
- Financial outputs are deterministic simulations, never guarantees.

## Repository pattern

Components call services. Services depend on repository/provider contracts. Mock implementations may import fixtures; UI components must not become the authoritative data layer. Future API repositories return the same domain contracts or map API DTOs to them.

## Security

Never store passwords, secrets, access tokens, sensitive contacts, or identity documents in browser storage. Prototype roles are visual demonstration only. Render user strings as React text, avoid unsafe HTML, validate file type/size, revoke object URLs, and enforce authorization in the backend.

## Future integration

Do not couple features to fetch URLs, SQL, Supabase clients, or PostGIS. Add Api repository implementations at the repository boundary. Use parameterized queries, PostGIS geography for distance, geometry for boundaries, backend RBAC, RLS where appropriate, audit logs, and idempotent jobs.

Use strict TypeScript, semantic HTML, accessible names, keyboard-safe dialogs, small components, pure business functions, and configuration over embedded assumptions.

Run npm run typecheck, npm test, npm run build, and npm run build:vercel. Keep commits focused and never commit secrets or build output.
