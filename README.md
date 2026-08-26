# EV Location & Expansion Intelligence Platform

A frontend-first, backend-ready location decision prototype for EV charging expansion in Thailand.

The runtime is now **Real Provider Mode**: it does not insert bundled market fixtures into the dashboard, map analysis, sites, partners, branches, comparison, or opportunity pipeline. Public location context is requested from configured providers. Company portfolio screens remain empty until a company Business REST API is configured.

## What works today

- Thailand-constrained MapLibre map, place search, click-to-select, 1/3/5/10 km analysis radius, compact clustered markers, and optional 3D buildings.
- On-demand OpenStreetMap/Nominatim/Overpass, Open-Meteo weather/elevation/flood context, WorldPop population, and optional TomTom traffic flow.
- Deterministic score and explainable recommendation calculated from available provider data; missing survey facts remain `Unknown` or `Requires Site Survey`.
- Runtime API Connection settings for provider endpoint and token replacement without editing code.
- Business API client for `GET /sites`, `/partners`, `/branches`, and `/opportunities` using an optional temporary bearer token.
- Partner submission prototype, Thai/English foundation, light/dark/system themes, responsive UI, and automated tests.

## API-token safety

Tokens entered in Settings exist **only in JavaScript memory** and are cleared by a full page refresh. They are not stored in localStorage, source code, Git, or the deployed artifact. This avoids pretending that browser storage protects secrets. Provider-approved public/client keys may be used for evaluation; production secrets require a same-origin backend proxy and secure server-side session.

## Start and validate

    npm install
    npm run dev
    npm run typecheck
    npm run lint
    npm test
    npm run build
    npm run build:vercel

Open http://localhost:3000, then:

1. Open `/settings#api-connections` to enable providers or enter TomTom/company API credentials.
2. Open `/map`, search for a Thailand location or click the map, choose a radius, and press **Check this area**.
3. Configure a company Business API to populate portfolio screens; no company records are fabricated when it is absent.

No database or local backend is required for public map analysis. Read `AI.md`, `docs/ARCHITECTURE.md`, `docs/DATA-SOURCES.md`, and `docs/SECURITY.md` before changing behavior.

## Limitations

Public data is neither guaranteed real-time nor field verified. Free public endpoints have quotas, licensing conditions, CORS policies, and no guaranteed SLA. The prototype is not production-authenticated or production-secure. Never use it as the sole basis for land, electrical, traffic, flood, engineering, or investment decisions.
