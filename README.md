# EV Location & Expansion Intelligence Platform

A frontend-first, backend-ready, database-ready prototype for deciding where an EV charging infrastructure company should expand in Thailand.

All market records are **Demo / Mock Data**, financial outputs are **Simulation / Estimate**, map tiles come from a free external provider, prototype roles are not authentication, and partner submissions use non-secure browser-local persistence.

## What works today

- Executive portfolio dashboard and ranked opportunities.
- MapLibre map with clustered opportunities, EV stations, competitors, gas stations, POIs, partner branches, radius analysis, search, selection, and dropped pins.
- Site intelligence for demand, competition, access, POIs, infrastructure gaps, flood risk, area, source quality, score, recommendation, risks, and missing information.
- Comparison, partner submission, branch ranking, lifecycle decisions, expansion analysis, financial simulation, demo RBAC, failure simulation, Thai/English foundation, and light/dark/system themes.

## Start and validate

    npm install
    npm run dev
    npm run typecheck
    npm test
    npm run build
    npm run build:vercel

Open http://localhost:3000. The core demo requires no database, backend, secret, or paid API.

The standard build validates the Sites/Vinext target. build:vercel validates standard Next.js. Vercel uses vercel.json; no environment value is required.

UI features depend on services and repository interfaces. MockSiteRepository can be replaced by ApiSiteRepository without changing screens. Partner submissions depend on SubmissionRepository and currently use LocalStorageSubmissionRepository.

Read AI.md before changing code, then docs/ARCHITECTURE.md, docs/SECURITY.md, and docs/HANDOFF.md.

## Limitations

This is not real-time, database-backed, production-authenticated, or production-secure. Do not use it for final land, electrical, flood, engineering, or investment decisions without independent verification and a site survey.
