# Testing

Vitest covers scoring, flood override, area verification risk, Thai/English search, combined filters, empty results, submission validation, demo permissions, and accessible confirmation behavior.

Playwright specifications cover dashboard-to-map-to-analysis, language, theme, desktop, and mobile projects. Run npm run test:e2e with Chrome available and the local server reusable.

Before release run typecheck, unit tests, both deployment builds, dependency audit, and representative manual accessibility/GIS checks. Future tests should add map source/layer contracts, repository error mapping, local persistence migration, upload limits, pagination, and backend contract tests.
